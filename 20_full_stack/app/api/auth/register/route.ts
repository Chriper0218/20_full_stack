import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, organizationKey } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "El correo y la contraseña son obligatorios." },
        { status: 400 }
      );
    }

    
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El correo electrónico ya está registrado." },
        { status: 400 }
      );
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split("@")[0],
        role: "EMPLOYEE", 
        companyKey: organizationKey || "DEFAULT_KEY", 
      },
    });

    // 5. Responder con éxito
    return NextResponse.json(
      { message: "Usuario registrado con éxito.", userId: newUser.id },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("ERROR EN REGISTRO:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al procesar el registro." },
      { status: 500 }
    );
  }
}