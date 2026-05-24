import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

// GET /api/assets/[id]
export async function GET(_request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const { id } = await params;
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      maintenances: { orderBy: { maintenanceDate: "desc" } },
    },
  });

  if (!asset) return NextResponse.json({ error: "Activo no encontrado." }, { status: 404 });
  return NextResponse.json({ asset });
}

// PUT /api/assets/[id]
export async function PUT(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  if (session.role === "EMPLOYEE") {
    return NextResponse.json({ error: "No tienes permisos." }, { status: 403 });
  }

  const { id } = await params;
  try {
    const body = await request.json();
    const { serialNumber, brand, model, category, status, purchaseDate, warrantyExpiry, specifications, userId } = body;

    const asset = await prisma.asset.update({
      where: { id },
      data: {
        ...(serialNumber && { serialNumber }),
        ...(brand && { brand }),
        ...(model && { model }),
        ...(category && { category }),
        ...(status && { status }),
        ...(purchaseDate !== undefined && { purchaseDate: purchaseDate ? new Date(purchaseDate) : null }),
        ...(warrantyExpiry !== undefined && { warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null }),
        ...(specifications !== undefined && { specifications }),
        ...(userId !== undefined && { userId: userId || null }),
      },
      include: { assignedTo: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({ asset });
  } catch (error) {
    console.error("Update asset error:", error);
    return NextResponse.json({ error: "Error al actualizar el activo." }, { status: 500 });
  }
}

// DELETE /api/assets/[id]
export async function DELETE(_request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  if (session.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo administradores pueden eliminar activos." }, { status: 403 });
  }

  const { id } = await params;
  try {
    await prisma.asset.delete({ where: { id } });
    return NextResponse.json({ message: "Activo eliminado." });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "P2003") {
      return NextResponse.json(
        { error: "No se puede eliminar: tiene mantenimientos registrados." },
        { status: 409 }
      );
    }
    console.error("Delete asset error:", error);
    return NextResponse.json({ error: "Error al eliminar." }, { status: 500 });
  }
}
