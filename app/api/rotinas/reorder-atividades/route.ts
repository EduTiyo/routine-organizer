import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== Role.TEACHER) {
      return new NextResponse("Acesso não autorizado", { status: 403 });
    }

    const body = await req.json();
    const rotinaId = String(body.rotinaId ?? "").trim();
    const atividadeIds = Array.isArray(body.atividadeIds)
      ? (body.atividadeIds as string[])
      : [];

    if (!rotinaId || !atividadeIds.length) {
      return new NextResponse("Dados inválidos", { status: 400 });
    }

    const rotina = await prisma.rotina.findUnique({
      where: { id: rotinaId, creatorId: session.user.id },
      select: {
        id: true,
        atividades: { select: { id: true } },
      },
    });

    if (!rotina) {
      return new NextResponse("Rotina não encontrada para este professor", {
        status: 404,
      });
    }

    const rotinaAtividadeIds = rotina.atividades.map((a) => a.id);
    const allMatch =
      atividadeIds.length === rotinaAtividadeIds.length &&
      atividadeIds.every((id) => rotinaAtividadeIds.includes(id));

    if (!allMatch) {
      return new NextResponse("Atividades não correspondem à rotina", {
        status: 400,
      });
    }

    await prisma.$transaction(
      atividadeIds.map((id, index) =>
        prisma.atividade.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("ERRO AO REORDENAR ATIVIDADES DA ROTINA:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
