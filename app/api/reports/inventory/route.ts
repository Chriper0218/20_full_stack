import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/reports/inventory — Generate inventory report data (JSON for client-side PDF)
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "general"; // general, by-status, maintenance

  if (type === "general") {
    const assets = await prisma.asset.findMany({
      include: {
        assignedTo: { select: { name: true, email: true } },
      },
      orderBy: { category: "asc" },
    });

    const totalByCategory = await prisma.asset.groupBy({
      by: ["category"],
      _count: { category: true },
    });

    const totalByStatus = await prisma.asset.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    return NextResponse.json({
      type: "general",
      generatedAt: new Date().toISOString(),
      generatedBy: session.name,
      total: assets.length,
      assets,
      totalByCategory,
      totalByStatus,
    });
  }

  if (type === "maintenance") {
    const maintenances = await prisma.maintenance.findMany({
      include: {
        asset: { select: { serialNumber: true, brand: true, model: true, category: true } },
      },
      orderBy: { maintenanceDate: "desc" },
    });

    const totalByCost = await prisma.maintenance.aggregate({
      _sum: { cost: true },
      _count: true,
    });

    return NextResponse.json({
      type: "maintenance",
      generatedAt: new Date().toISOString(),
      generatedBy: session.name,
      total: maintenances.length,
      maintenances,
      totalCost: totalByCost._sum.cost,
      totalCount: totalByCost._count,
    });
  }

  return NextResponse.json({ error: "Tipo de reporte no válido." }, { status: 400 });
}
