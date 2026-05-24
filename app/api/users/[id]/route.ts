import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

// GET /api/users/[id]
export async function GET(_request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, email: true, role: true, companyKey: true, createdAt: true,
      assets: {
        select: { id: true, serialNumber: true, brand: true, model: true, category: true, status: true },
      },
    },
  });

  if (!user) return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  return NextResponse.json({ user });
}

// PUT /api/users/[id]
export async function PUT(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  if (session.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo administradores pueden editar usuarios." }, { status: 403 });
  }

  const { id } = await params;
  try {
    const body = await request.json();
    const { name, email, role } = body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
      },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Error al actualizar." }, { status: 500 });
  }
}

// DELETE /api/users/[id]
export async function DELETE(_request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  if (session.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo administradores." }, { status: 403 });
  }

  const { id } = await params;

  // Verificar que no tenga activos asignados
  const assetCount = await prisma.asset.count({ where: { userId: id } });
  if (assetCount > 0) {
    return NextResponse.json(
      { error: `No se puede eliminar: tiene ${assetCount} activo(s) asignado(s).` },
      { status: 409 }
    );
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ message: "Usuario eliminado." });
}
