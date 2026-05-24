import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/users
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      companyKey: true,
      createdAt: true,
      _count: { select: { assets: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}

// POST /api/users — Solo admin puede crear usuarios
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  if (session.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo administradores pueden crear usuarios." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, email, role, companyKey, password } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Nombre y email son requeridos." }, { status: 400 });
    }

    const bcrypt = (await import("bcryptjs")).default;
    const hashedPassword = await bcrypt.hash(password || "changeme123", 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        role: role || "EMPLOYEE",
        companyKey: companyKey || process.env.COMPANY_KEY || "CUC-2026",
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "Ya existe un usuario con este correo." }, { status: 409 });
    }
    console.error("Create user error:", error);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
