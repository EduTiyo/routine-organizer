import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(request: NextRequest) {
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

    if (!jaVinculado) {
        return NextResponse.json(
            { message: "Esse aluno não está vinculado a esse professor" },
            { status: 400 }
        );
    }

    // Remover vínculo
    await prisma.teacherStudentLink.delete({
        where: {
            teacherId_studentId: {
                teacherId,
                studentId,
            },
        },
    });


    return NextResponse.json(
      { message: "Aluno desvinculado com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao desvincular aluno:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
