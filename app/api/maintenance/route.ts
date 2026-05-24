import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/maintenance
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const assetId = searchParams.get("assetId") || "";
  const type = searchParams.get("type") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (assetId) where.assetId = assetId;
  if (type) where.type = type;

  const [maintenances, total] = await Promise.all([
    prisma.maintenance.findMany({
      where,
      include: {
        asset: { select: { id: true, serialNumber: true, brand: true, model: true } },
      },
      orderBy: { maintenanceDate: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.maintenance.count({ where }),
  ]);

  return NextResponse.json({ maintenances, total, page, totalPages: Math.ceil(total / limit) });
}

// POST /api/maintenance
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  if (session.role === "EMPLOYEE") {
    return NextResponse.json({ error: "No tienes permisos." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { assetId, type, description, cost, performedBy, maintenanceDate } = body;

    if (!assetId || !type || !description) {
      return NextResponse.json({ error: "assetId, type y description son requeridos." }, { status: 400 });
    }

    // Actualizar estado del activo a MANTENIMIENTO si es necesario
    if (type === "CORRECTIVO" || type === "PREVENTIVO") {
      await prisma.asset.update({
        where: { id: assetId },
        data: { status: "MANTENIMIENTO" },
      });
    }

    const maintenance = await prisma.maintenance.create({
      data: {
        assetId,
        type,
        description,
        cost: cost ? parseFloat(cost) : null,
        performedBy: performedBy || null,
        maintenanceDate: maintenanceDate ? new Date(maintenanceDate) : new Date(),
      },
      include: {
        asset: { select: { id: true, serialNumber: true, brand: true, model: true } },
      },
    });

    return NextResponse.json({ maintenance }, { status: 201 });
  } catch (error) {
    console.error("Create maintenance error:", error);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
