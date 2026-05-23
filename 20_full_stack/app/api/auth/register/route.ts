import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, companyKey } = body;

    // Validaciones
    if (!name || !email || !password || !companyKey) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos." },
        { status: 400 }
      );
    }

    // Validar compañía llave
    const validKey = process.env.COMPANY_KEY || "CUC-2026";
    if (companyKey.toUpperCase() !== validKey.toUpperCase()) {
      return NextResponse.json(
        { error: "La Compañía Llave no es válida. Contacta al administrador de TI." },
        { status: 403 }
      );
    }

    // Verificar si ya existe
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con este correo electrónico." },
        { status: 409 }
      );
    }

    // Validar password
    if (password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres." },
        { status: 400 }
      );
    }

    // Hash password y crear usuario
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        companyKey: companyKey.toUpperCase(),
        role: "EMPLOYEE",
      },
    });

    // Generar token y setear cookie
    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    await setAuthCookie(token);

    return NextResponse.json(
      {
        message: "Cuenta creada exitosamente.",
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
