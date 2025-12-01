import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== Role.STUDENT) {
      return new NextResponse("Acesso não autorizado", { status: 403 });
    }

    const body = await req.json();
    const atividadeId = String(body.atividadeId ?? "").trim();
    const status = String(body.status ?? "").trim();
    const timeTakenSecondsRaw = body.timeTakenSeconds;

    if (!atividadeId || !status) {
      return new NextResponse("Dados obrigatórios ausentes", { status: 400 });
    }

    let timeTakenSeconds: number | null = null;
    if (timeTakenSecondsRaw !== undefined && timeTakenSecondsRaw !== null) {
      if (
        typeof timeTakenSecondsRaw !== "number" ||
        !Number.isFinite(timeTakenSecondsRaw) ||
        timeTakenSecondsRaw < 0
      ) {
        return new NextResponse("timeTakenSeconds inválido", { status: 400 });
      }
      timeTakenSeconds = Math.round(timeTakenSecondsRaw);
    }

    const atividade = await prisma.atividade.findUnique({
      where: { id: atividadeId },
      select: { id: true },
    });

    if (!atividade) {
      return new NextResponse("Atividade não encontrada", { status: 404 });
    }

    const registro = await prisma.registroDesempenho.create({
      data: {
        atividadeId,
        studentId: session.user.id,
        status,
        timeTakenSeconds,
      },
      select: {
        id: true,
        status: true,
        timeTakenSeconds: true,
        completedAt: true,
      },
    });

    return NextResponse.json(registro, { status: 201 });
  } catch (error) {
    console.error("ERRO AO REGISTRAR DESEMPENHO:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
