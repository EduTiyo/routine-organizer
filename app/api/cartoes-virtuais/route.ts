import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { DayPeriod, Role } from "@prisma/client";
import {
  buildObjectUrl,
  ensureBucketExists,
  getBucketName,
  getMinioClient,
} from "@/lib/minio";

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== Role.TEACHER) {
      return new NextResponse("Acesso não autorizado", { status: 403 });
    }

    const virtualCards = await prisma.atividade.findMany({
      where: {
        creatorId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        estimatedTime: true,
        timeInSeconds: true,
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        dayPeriod: true,
        order: true,
      },
      orderBy: [{ order: "asc" }, { title: "asc" }],
    });

    const cardsWithImageUrl = virtualCards.map((card) => {
      const hasAbsoluteUrl = /^https?:\/\//i.test(card.imageUrl);
      return {
        ...card,
        imageUrl: hasAbsoluteUrl
          ? card.imageUrl
          : buildObjectUrl(card.imageUrl),
      };
    });

    return NextResponse.json(cardsWithImageUrl, { status: 200 });
  } catch (error) {
    console.error("ERRO AO BUSCAR CARTÕES VIRTUAIS:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== Role.TEACHER) {
      return new NextResponse("Acesso não autorizado", { status: 403 });
    }

    const formData = await req.formData();
    const title = String(formData.get("title") ?? "").trim();
    const estimatedTimeRaw = formData.get("estimatedTime");
    const timeInSecondsRaw = formData.get("timeInSeconds");
    const dayPeriodRaw = String(formData.get("dayPeriod") ?? "").trim();
    const imageFile = formData.get("image");

    if (!title) {
      return new NextResponse("Dados obrigatórios ausentes", {
        status: 400,
      });
    }

    let estimatedTime: number | null = null;
    if (typeof estimatedTimeRaw === "string" && estimatedTimeRaw.trim()) {
      const parsedEstimatedTime = Number(estimatedTimeRaw);
      if (
        Number.isNaN(parsedEstimatedTime) ||
        !Number.isInteger(parsedEstimatedTime) ||
        parsedEstimatedTime < 1
      ) {
        return new NextResponse("Tempo estimado inválido", { status: 400 });
      }
      estimatedTime = parsedEstimatedTime;
    }

    let timeInSeconds: number | null = null;
    if (typeof timeInSecondsRaw === "string" && timeInSecondsRaw.trim()) {
      const parsedSeconds = Number(timeInSecondsRaw);
      if (
        Number.isNaN(parsedSeconds) ||
        !Number.isInteger(parsedSeconds) ||
        parsedSeconds < 1
      ) {
        return new NextResponse("Tempo em segundos inválido", { status: 400 });
      }
      timeInSeconds = parsedSeconds;
    }

    if (!dayPeriodRaw || !Object.values(DayPeriod).includes(dayPeriodRaw as DayPeriod)) {
      return new NextResponse("Período do dia inválido", { status: 400 });
    }

    if (!(imageFile instanceof File) || imageFile.size === 0) {
      return new NextResponse("A imagem é obrigatória", { status: 400 });
    }

    if (imageFile.size > MAX_UPLOAD_SIZE) {
      return new NextResponse("A imagem deve ter no máximo 5MB", {
        status: 400,
      });
    }

    const bucketName = getBucketName();
    await ensureBucketExists(bucketName);

    const sanitizedFileName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const objectKey = `virtual-cards/${
      session.user.id
    }/${Date.now()}-${sanitizedFileName}`;
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const minioClient = getMinioClient();

    await minioClient.putObject(bucketName, objectKey, buffer, buffer.length, {
      "Content-Type": imageFile.type || "application/octet-stream",
    });

    const imageUrl = buildObjectUrl(objectKey);

    const currentCount = await prisma.atividade.count({
      where: { creatorId: session.user.id },
    });

    const atividade = await prisma.atividade.create({
      data: {
        title,
        imageUrl,
        estimatedTime,
        timeInSeconds,
        dayPeriod: dayPeriodRaw as DayPeriod,
        creatorId: session.user.id,
        order: currentCount,
      },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        estimatedTime: true,
        timeInSeconds: true,
        dayPeriod: true,
        order: true,
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(atividade, { status: 201 });
  } catch (error) {
    console.error("ERRO AO CRIAR CARTÃO VIRTUAL:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
