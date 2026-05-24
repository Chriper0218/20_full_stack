import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

// GET /api/maintenance/[id]
export async function GET(_request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const { id } = await params;
  const maintenance = await prisma.maintenance.findUnique({
    where: { id },
    include: { asset: { select: { id: true, serialNumber: true, brand: true, model: true, category: true } } },
  });

  if (!maintenance) return NextResponse.json({ error: "Mantenimiento no encontrado." }, { status: 404 });
  return NextResponse.json({ maintenance });
}

// PUT /api/maintenance/[id]
export async function PUT(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  if (session.role === "EMPLOYEE") {
    return NextResponse.json({ error: "No tienes permisos." }, { status: 403 });
  }

  const { id } = await params;
  try {
    const body = await request.json();
    const { type, description, cost, performedBy, maintenanceDate } = body;

    const maintenance = await prisma.maintenance.update({
      where: { id },
      data: {
        ...(type && { type }),
        ...(description && { description }),
        ...(cost !== undefined && { cost: cost ? parseFloat(cost) : null }),
        ...(performedBy !== undefined && { performedBy }),
        ...(maintenanceDate && { maintenanceDate: new Date(maintenanceDate) }),
      },
      include: { asset: { select: { id: true, serialNumber: true, brand: true, model: true } } },
    });

    return NextResponse.json({ maintenance });
  } catch (error) {
    console.error("Update maintenance error:", error);
    return NextResponse.json({ error: "Error al actualizar." }, { status: 500 });
  }
}

// DELETE /api/maintenance/[id]
export async function DELETE(_request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  if (session.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo administradores." }, { status: 403 });
  }

  const { id } = await params;
  await prisma.maintenance.delete({ where: { id } });
  return NextResponse.json({ message: "Mantenimiento eliminado." });
}
