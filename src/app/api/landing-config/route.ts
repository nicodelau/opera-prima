import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    let config = await prisma.landingConfig.findUnique({
      where: { id: "singleton" },
    });

    if (!config) {
      // Create default config if it doesn't exist
      // Default to 30 days from now
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      config = await prisma.landingConfig.create({
        data: {
          id: "singleton",
          targetDate: thirtyDaysFromNow,
          title: "Próximo Estreno",
        },
      });
    }

    return NextResponse.json(config);
  } catch (error: any) {
    console.error("Error loading landing config:", error);
    return NextResponse.json({ error: error.message || "Error al cargar la configuración de landing" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const requester = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!requester || (requester.role !== "admin" && requester.role !== "editor")) {
      return NextResponse.json({ error: "Prohibido. Solo administradores y editores." }, { status: 403 });
    }

    const { targetDate, title } = await request.json();

    if (!targetDate || !title) {
      return NextResponse.json({ error: "Faltan campos requeridos (targetDate, title)" }, { status: 400 });
    }

    const parsedDate = new Date(targetDate);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: "Formato de fecha inválido" }, { status: 400 });
    }

    const config = await prisma.landingConfig.upsert({
      where: { id: "singleton" },
      update: {
        targetDate: parsedDate,
        title,
      },
      create: {
        id: "singleton",
        targetDate: parsedDate,
        title,
      },
    });

    return NextResponse.json(config);
  } catch (error: any) {
    console.error("Error updating landing config:", error);
    return NextResponse.json({ error: error.message || "Error al guardar la configuración" }, { status: 500 });
  }
}
