import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { setSession, getSession } from "@/lib/session";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password, name, role } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Faltan datos obligatorios (email, contraseña)" }, { status: 400 });
    }

    // Check user count in DB
    const userCount = await prisma.user.count();
    const isBootstrap = userCount === 0;

    if (!isBootstrap) {
      // Enforce admin permissions to register new users
      const session = await getSession();
      if (!session) {
        return NextResponse.json({ error: "No autorizado. Debes iniciar sesión." }, { status: 401 });
      }

      const requester = await prisma.user.findUnique({
        where: { id: session.userId },
      });

      if (!requester || requester.role !== "admin") {
        return NextResponse.json({ error: "Prohibido. Solo el administrador puede crear nuevos usuarios." }, { status: 403 });
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "El correo ya está registrado" }, { status: 400 });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // First user is ALWAYS admin. Subsequent users can be admin, editor, or user.
    const finalRole = isBootstrap ? "admin" : (role === "admin" ? "admin" : (role === "editor" ? "editor" : "user"));

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: finalRole,
      },
    });

    // If bootstrapping (first user), log them in automatically
    if (isBootstrap) {
      await setSession(newUser.id, newUser.email);
    }

    return NextResponse.json({
      success: true,
      user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
      bootstrapped: isBootstrap
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
  }
}
