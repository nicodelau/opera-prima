import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "billboard" or "calendar" or null for all

    const where = type ? { type } : {};
    const shows = await prisma.show.findMany({
      where,
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(shows);
  } catch (error: any) {
    console.error("Error loading shows:", error);
    return NextResponse.json({ error: error.message || "Error al cargar obras" }, { status: 500 });
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

    if (!requester || requester.role !== "admin") {
      return NextResponse.json({ error: "Prohibido. Solo administradores." }, { status: 403 });
    }

    const { title, composer, tag, desc, image, type, category, dates, price } = await request.json();

    if (!title || !composer || !desc || !image || !type) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const newShow = await prisma.show.create({
      data: {
        title,
        composer,
        tag: tag || null,
        desc,
        image,
        type,
        category: category || null,
        dates: dates || null,
        price: price || null,
      },
    });

    return NextResponse.json(newShow);
  } catch (error: any) {
    console.error("Error creating show:", error);
    return NextResponse.json({ error: error.message || "Error al crear obra" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const requester = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!requester || requester.role !== "admin") {
      return NextResponse.json({ error: "Prohibido. Solo administradores." }, { status: 403 });
    }

    const { id, title, composer, tag, desc, image, type, category, dates, price } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Falta el ID de la obra" }, { status: 400 });
    }

    const updatedShow = await prisma.show.update({
      where: { id },
      data: {
        title,
        composer,
        tag: tag || null,
        desc,
        image,
        type,
        category: category || null,
        dates: dates || null,
        price: price || null,
      },
    });

    return NextResponse.json(updatedShow);
  } catch (error: any) {
    console.error("Error updating show:", error);
    return NextResponse.json({ error: error.message || "Error al actualizar obra" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const requester = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!requester || requester.role !== "admin") {
      return NextResponse.json({ error: "Prohibido. Solo administradores." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Falta el ID de la obra" }, { status: 400 });
    }

    await prisma.show.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting show:", error);
    return NextResponse.json({ error: error.message || "Error al eliminar obra" }, { status: 500 });
  }
}
