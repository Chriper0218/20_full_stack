import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

function streamToBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}

function labelForCategory(category: string) {
  return {
    LAPTOP: "Laptops",
    SERVER: "Servidores",
    NETWORK_DEVICE: "Dispositivos de red",
    PRINTER: "Impresoras",
    CELLPHONE: "Celulares",
  }[category] || category;
}

function labelForStatus(status: string) {
  return {
    ASIGNADO: "Asignado",
    MANTENIMIENTO: "Mantenimiento",
    BAJA: "Dado de baja",
    BODEGA: "En bodega",
  }[status] || status;
}

function labelForMaintenance(type: string) {
  return type === "PREVENTIVO" ? "Preventivo" : type === "CORRECTIVO" ? "Correctivo" : type;
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "general";
  const format = searchParams.get("format") || "json";

  if (format === "pdf") {
    if (type === "general") {
      const assets = await prisma.asset.findMany({
        include: { assignedTo: { select: { name: true, email: true } } },
        orderBy: { category: "asc" },
      });
      const totalByCategory = await prisma.asset.groupBy({ by: ["category"], _count: { category: true } });
      const totalByStatus = await prisma.asset.groupBy({ by: ["status"], _count: { status: true } });

      const doc = new PDFDocument({ size: "A4", margin: 40 });
      doc.fontSize(18).fillColor("#0b4fd7").text("Reporte general de activos TI", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor("#94a3b8").text(`Generado por: ${session.name}`);
      doc.text(`Fecha: ${new Date().toLocaleString("es-CO")}`);
      doc.moveDown(1);
      doc.fontSize(12).fillColor("#e2e8f0").text(`Total de activos: ${assets.length}`);
      doc.moveDown(0.75);

      doc.fontSize(11).fillColor("#f8fafc").text("Resumen por categoría:", { underline: true });
      totalByCategory.forEach((item) => {
        doc.text(`• ${labelForCategory(item.category)}: ${item._count.category}`);
      });
      doc.moveDown(0.5);

      doc.fontSize(11).text("Resumen por estado:", { underline: true });
      totalByStatus.forEach((item) => {
        doc.text(`• ${labelForStatus(item.status)}: ${item._count.status}`);
      });
      doc.moveDown(1);

      doc.fontSize(12).fillColor("#f8fafc").text("Listado de activos", { underline: true });
      doc.moveDown(0.5);
      assets.forEach((asset, index) => {
        doc.fontSize(10).fillColor("#cbd5e1").text(`${index + 1}. ${asset.brand} ${asset.model} — ${asset.serialNumber}`);
        doc.fontSize(9).fillColor("#94a3b8").text(`   Categoría: ${labelForCategory(asset.category)} · Estado: ${labelForStatus(asset.status)} · Responsable: ${asset.assignedTo?.name || "Sin asignar"}`);
        if (asset.purchaseDate) doc.text(`   Compra: ${new Date(asset.purchaseDate).toLocaleDateString("es-CO")}`);
        if (asset.warrantyExpiry) doc.text(`   Garantía: ${new Date(asset.warrantyExpiry).toLocaleDateString("es-CO")}`);
        doc.moveDown(0.35);
      });

      const buffer = await streamToBuffer(doc);
      return new Response(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment; filename=Reporte-general-activos.pdf",
        },
      });
    }

    if (type === "maintenance") {
      const maintenances = await prisma.maintenance.findMany({
        include: { asset: { select: { serialNumber: true, brand: true, model: true, category: true } } },
        orderBy: { maintenanceDate: "desc" },
      });
      const totals = await prisma.maintenance.aggregate({ _sum: { cost: true }, _count: true });

      const doc = new PDFDocument({ size: "A4", margin: 40 });
      doc.fontSize(18).fillColor("#0b4fd7").text("Reporte de mantenimientos TI", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor("#94a3b8").text(`Generado por: ${session.name}`);
      doc.text(`Fecha: ${new Date().toLocaleString("es-CO")}`);
      doc.moveDown(1);
      doc.fontSize(12).fillColor("#f8fafc").text(`Total de mantenimientos: ${totals._count}`);
      doc.fontSize(12).text(`Costo total: $${totals._sum.cost?.toFixed(2) || "0.00"}`);
      doc.moveDown(1);

      maintenances.forEach((item, index) => {
        doc.fontSize(10).fillColor("#cbd5e1").text(`${index + 1}. ${labelForMaintenance(item.type)} — ${item.asset.brand} ${item.asset.model} (${item.asset.serialNumber})`);
        doc.fontSize(9).fillColor("#94a3b8").text(`   Fecha: ${new Date(item.maintenanceDate).toLocaleDateString("es-CO")} · Técnico: ${item.performedBy || "Sin especificar"} · Costo: ${item.cost ? `$${item.cost.toString()}` : "—"}`);
        doc.text(`   Descripción: ${item.description}`);
        doc.moveDown(0.35);
      });

      const buffer = await streamToBuffer(doc);
      return new Response(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment; filename=Reporte-mantenimientos.pdf",
        },
      });
    }

    return NextResponse.json({ error: "Tipo de reporte no válido." }, { status: 400 });
  }

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
