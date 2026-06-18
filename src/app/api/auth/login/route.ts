import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { setSession } from "@/lib/session";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Faltan datos obligatorios (email, contraseña)" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
    }

    await setSession(user.id, user.email);

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
  }
}
