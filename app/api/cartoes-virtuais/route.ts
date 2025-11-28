import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== Role.TEACHER) {
      return new NextResponse("Acesso não autorizado", { status: 403 });
    }

    const teacherId = session.user.id;

    const virtualCards = await prisma.atividade.findMany({
      where: {
        rotina: {
          creatorId: teacherId,
        },
      },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        order: true,
        estimatedTime: true,
        feedbackSoundType: true,
        rotina: {
          select: {
            id: true,
            title: true,
            student: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: [{ rotina: { title: "asc" } }, { order: "asc" }],
    });

    return NextResponse.json(virtualCards, { status: 200 });
  } catch (error) {
    console.error("ERRO AO BUSCAR CARTÕES VIRTUAIS:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
