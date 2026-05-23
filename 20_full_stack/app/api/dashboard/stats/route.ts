import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/dashboard/stats
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  // Ejecutar todas las consultas en paralelo
  const [
    totalAssets,
    assetsByStatus,
    assetsByCategory,
    recentMaintenances,
    warrantyAlerts,
    totalUsers,
    totalMaintenances,
  ] = await Promise.all([
    // Total de activos
    prisma.asset.count(),

    // Activos por estado
    prisma.asset.groupBy({
      by: ["status"],
      _count: { status: true },
    }),

    // Activos por categoría
    prisma.asset.groupBy({
      by: ["category"],
      _count: { category: true },
    }),

    // Últimos 5 mantenimientos
    prisma.maintenance.findMany({
      take: 5,
      orderBy: { maintenanceDate: "desc" },
      include: {
        asset: { select: { serialNumber: true, brand: true, model: true } },
      },
    }),

    // Alertas de garantía (activos cuya garantía expira en los próximos 30 días)
    prisma.asset.count({
      where: {
        warrantyExpiry: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          gte: new Date(),
        },
      },
    }),

    // Total usuarios
    prisma.user.count(),

    // Total mantenimientos
    prisma.maintenance.count(),
  ]);

  // Formatear por estado
  const statusMap: Record<string, number> = {};
  assetsByStatus.forEach((s: any) => {
    statusMap[s.status] = s._count.status;
  });

  // Formatear por categoría
  const categoryMap: Record<string, number> = {};
  assetsByCategory.forEach((c: any) => {
    categoryMap[c.category] = c._count.category;
  });

  return NextResponse.json({
    totalAssets,
    totalUsers,
    totalMaintenances,
    warrantyAlerts,
    byStatus: statusMap,
    byCategory: categoryMap,
    recentMaintenances,
  });
}
