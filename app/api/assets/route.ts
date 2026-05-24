import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/assets — Listar activos con filtros
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const status = searchParams.get("status") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (search) {
    where.OR = [
      { serialNumber: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
      { model: { contains: search, mode: "insensitive" } },
      { assignedTo: { name: { contains: search, mode: "insensitive" } } },
    ];
  }
  if (category) where.category = category;
  if (status) where.status = status;

  const [assets, total] = await Promise.all([
    prisma.asset.findMany({
      where,
      include: { assignedTo: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.asset.count({ where }),
  ]);

  return NextResponse.json({ assets, total, page, totalPages: Math.ceil(total / limit) });
}

// POST /api/assets — Crear activo
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  if (session.role === "EMPLOYEE") {
    return NextResponse.json({ error: "No tienes permisos para crear activos." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { serialNumber, brand, model, category, status, purchaseDate, warrantyExpiry, specifications, userId } = body;

    if (!serialNumber || !brand || !model || !category) {
      return NextResponse.json({ error: "Campos requeridos: serialNumber, brand, model, category." }, { status: 400 });
    }

    const asset = await prisma.asset.create({
      data: {
        serialNumber,
        brand,
        model,
        category,
        status: status || "BODEGA",
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
        specifications: specifications || null,
        userId: userId || null,
      },
      include: { assignedTo: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({ asset }, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "Ya existe un activo con ese número de serie." }, { status: 409 });
    }
    console.error("Create asset error:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
