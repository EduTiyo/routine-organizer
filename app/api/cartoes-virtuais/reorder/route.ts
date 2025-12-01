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
    const ids = Array.isArray(body.ids) ? (body.ids as string[]) : [];

    if (!ids.length) {
      return new NextResponse("Lista de IDs inválida", { status: 400 });
    }

    // Garantir que todos pertencem ao professor
    const activities = await prisma.atividade.findMany({
      where: { id: { in: ids }, creatorId: session.user.id },
      select: { id: true },
    });

    if (activities.length !== ids.length) {
      return new NextResponse("Atividades inválidas para este professor", {
        status: 400,
      });
    }

    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.atividade.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("ERRO AO REORDENAR CARTÕES VIRTUAIS:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
