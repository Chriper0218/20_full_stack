import { NextResponse } from "next/server";
<<<<<<< HEAD
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, setAuthCookie } from "@/lib/auth";
=======
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
>>>>>>> develop

export async function POST(request: Request) {
  try {
    const body = await request.json();
<<<<<<< HEAD
    const { name, email, password, companyKey } = body;

    // Validaciones
    if (!name || !email || !password || !companyKey) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos." },
=======
    const { email, password, name, organizationKey } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "El correo y la contraseña son obligatorios." },
>>>>>>> develop
        { status: 400 }
      );
    }

<<<<<<< HEAD
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
=======
    
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El correo electrónico ya está registrado." },
>>>>>>> develop
        { status: 400 }
      );
    }

<<<<<<< HEAD
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
=======
    
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
>>>>>>> develop
