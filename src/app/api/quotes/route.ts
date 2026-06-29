import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    let requester = null;
    
    if (session) {
      requester = await prisma.user.findUnique({
        where: { id: session.userId },
      });
    }

    const isAuthorized = requester && (requester.role === "admin" || requester.role === "editor");

    const quotes = await prisma.quote.findMany({
      where: isAuthorized ? {} : { enabled: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(quotes);
  } catch (error: any) {
    console.error("Error loading quotes:", error);
    return NextResponse.json({ error: error.message || "Error al cargar frases" }, { status: 500 });
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

    const { text, author, enabled } = await request.json();

    if (!text || !author) {
      return NextResponse.json({ error: "Faltan campos requeridos (text, author)" }, { status: 400 });
    }

    const newQuote = await prisma.quote.create({
      data: {
        text,
        author,
        enabled: enabled !== undefined ? enabled : true,
      },
    });

    return NextResponse.json(newQuote);
  } catch (error: any) {
    console.error("Error creating quote:", error);
    return NextResponse.json({ error: error.message || "Error al crear frase" }, { status: 500 });
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

    if (!requester || (requester.role !== "admin" && requester.role !== "editor")) {
      return NextResponse.json({ error: "Prohibido. Solo administradores y editores." }, { status: 403 });
    }

    const { id, text, author, enabled } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Falta el ID de la frase" }, { status: 400 });
    }

    const updateData: any = {};
    if (text !== undefined) updateData.text = text;
    if (author !== undefined) updateData.author = author;
    if (enabled !== undefined) updateData.enabled = enabled;

    const updatedQuote = await prisma.quote.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedQuote);
  } catch (error: any) {
    console.error("Error updating quote:", error);
    return NextResponse.json({ error: error.message || "Error al actualizar frase" }, { status: 500 });
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

    if (!requester || (requester.role !== "admin" && requester.role !== "editor")) {
      return NextResponse.json({ error: "Prohibido. Solo administradores y editores." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Falta el ID de la frase" }, { status: 400 });
    }

    await prisma.quote.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting quote:", error);
    return NextResponse.json({ error: error.message || "Error al eliminar frase" }, { status: 500 });
  }
}
