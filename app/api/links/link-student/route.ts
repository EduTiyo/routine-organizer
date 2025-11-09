import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { teacherId, studentId } = await request.json();

    // Validações básicas
    if (!teacherId || !studentId) {
      return NextResponse.json(
        { message: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    const jaVinculado = await prisma.teacherStudentLink.findUnique({
        where: { teacherId_studentId: { teacherId, studentId } },
    });

    if (jaVinculado) {
        return NextResponse.json(
            { message: "Esse aluno já está vinculado a esse professor" },
            { status: 400 }
        );
    }

    // Criar vínculo
    const teacherStudentLink = await prisma.teacherStudentLink.create({
      data: {
        studentId,
        teacherId
      },
    });

    return NextResponse.json(
      { message: "Aluno vinculado com sucesso", teacherStudentLink },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao vincular aluno:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
