import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import { buildObjectUrl } from "@/lib/minio";

function normalizeDateOnly(dateString: string) {
  return new Date(`${dateString}T00:00:00`);
}

function isDateValidAndNotPast(dateString: string) {
  const parsed = normalizeDateOnly(dateString);
  if (Number.isNaN(parsed.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parsed >= today;
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Acesso não autorizado", { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const studentIdFromQuery = searchParams.get("studentId");
    const isTeacher = session.user.role === Role.TEACHER;

    const studentId = isTeacher ? studentIdFromQuery : session.user.id;

    if (!studentId) {
      return new NextResponse("studentId é obrigatório", { status: 400 });
    }

    if (!isTeacher && session.user.role !== Role.STUDENT) {
      return new NextResponse("Acesso não autorizado", { status: 403 });
    }

    if (isTeacher) {
      const link = await prisma.teacherStudentLink.findUnique({
        where: {
          teacherId_studentId: {
            teacherId: session.user.id,
            studentId,
          },
        },
      });

      if (!link) {
        return new NextResponse("Aluno não vinculado a este professor", {
          status: 404,
        });
      }
    }

    const student = await prisma.user.findUnique({
      where: {
        id: studentId,
        role: Role.STUDENT,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!student) {
      return new NextResponse("Aluno não encontrado", { status: 404 });
    }

    const rotinas = await prisma.rotina.findMany({
      where: {
        studentId,
        ...(isTeacher ? { creatorId: session.user.id } : {}),
      },
      select: {
        id: true,
        dateOfRealization: true,
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        atividades: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            estimatedTime: true,
            timeInSeconds: true,
            dayPeriod: true,
          },
          orderBy: [{ order: "asc" }],
        },
        status: true,
      },
      orderBy: [{ dateOfRealization: "asc" }],
    });

    const rotinasWithFullImageUrl = rotinas.map((rotina) => ({
      ...rotina,
      atividades: rotina.atividades.map((atividade) => {
        const hasAbsoluteUrl = /^https?:\/\//i.test(atividade.imageUrl);

        return {
          ...atividade,
          imageUrl: hasAbsoluteUrl
            ? atividade.imageUrl
            : buildObjectUrl(atividade.imageUrl),
        };
      }),
    }));

    return NextResponse.json(
      { student, rotinas: rotinasWithFullImageUrl },
      { status: 200 }
    );
  } catch (error) {
    console.error("ERRO AO BUSCAR ROTINAS DO ALUNO:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== Role.TEACHER) {
      return new NextResponse("Acesso não autorizado", { status: 403 });
    }

    const body = await req.json();
    const studentId = String(body.studentId ?? "").trim();
    const atividadeIds = Array.isArray(body.atividadeIds)
      ? (body.atividadeIds as string[]).map((id) => String(id))
      : [];
    const dateOfRealizationRaw = String(body.dateOfRealization ?? "").trim();

    if (!studentId || !dateOfRealizationRaw) {
      return new NextResponse("Dados obrigatórios ausentes", { status: 400 });
    }

    if (!isDateValidAndNotPast(dateOfRealizationRaw)) {
      return new NextResponse("Data de realização inválida", { status: 400 });
    }

    if (!atividadeIds.length) {
      return new NextResponse("Selecione ao menos uma atividade", {
        status: 400,
      });
    }

    const student = await prisma.user.findUnique({
      where: { id: studentId, role: Role.STUDENT },
      select: { id: true, name: true },
    });

    if (!student) {
      return new NextResponse("Aluno não encontrado", { status: 404 });
    }

    const link = await prisma.teacherStudentLink.findUnique({
      where: {
        teacherId_studentId: {
          teacherId: session.user.id,
          studentId,
        },
      },
    });

    if (!link) {
      return new NextResponse("Aluno não vinculado a este professor", {
        status: 404,
      });
    }

    const teacherActivities = await prisma.atividade.findMany({
      where: {
        id: { in: atividadeIds },
        creatorId: session.user.id,
      },
      select: { id: true },
    });

    if (teacherActivities.length !== atividadeIds.length) {
      return new NextResponse("Atividades inválidas", { status: 400 });
    }

    const rotina = await prisma.rotina.create({
      data: {
        dateOfRealization: normalizeDateOnly(dateOfRealizationRaw),
        creatorId: session.user.id,
        studentId,
        atividades: {
          connect: atividadeIds.map((id) => ({ id })),
        },
      },
      select: {
        id: true,
        dateOfRealization: true,
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        atividades: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            estimatedTime: true,
            timeInSeconds: true,
            dayPeriod: true,
          },
          orderBy: [{ order: "asc" }],
        },
        status: true,
      },
    });

    const rotinaWithImages = {
      ...rotina,
      atividades: rotina.atividades.map((atividade) => {
        const hasAbsoluteUrl = /^https?:\/\//i.test(atividade.imageUrl);
        return {
          ...atividade,
          imageUrl: hasAbsoluteUrl
            ? atividade.imageUrl
            : buildObjectUrl(atividade.imageUrl),
        };
      }),
    };

    return NextResponse.json(
      { student, rotina: rotinaWithImages },
      { status: 201 }
    );
  } catch (error) {
    console.error("ERRO AO CRIAR ROTINA DO ALUNO:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
