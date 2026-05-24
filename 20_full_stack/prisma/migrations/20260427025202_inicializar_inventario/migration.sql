-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('ASIGNADO', 'MANTENIMIENTO', 'BAJA', 'BODEGA');

-- CreateEnum
CREATE TYPE "AssetCategory" AS ENUM ('LAPTOP', 'CELLPHONE', 'NETWORK_DEVICE', 'PRINTER', 'SERVER');

-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('PREVENTIVO', 'CORRECTIVO');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'TECHNICIAN', 'EMPLOYEE');

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "category" "AssetCategory" NOT NULL,
    "status" "AssetStatus" NOT NULL DEFAULT 'BODEGA',
    "purchaseDate" TIMESTAMP(3),
    "specifications" JSONB,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "companyKey" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'EMPLOYEE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Maintenance" (
    "id" TEXT NOT NULL,
    "type" "MaintenanceType" NOT NULL,
    "description" TEXT NOT NULL,
    "maintenanceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cost" DECIMAL(10,2),
    "assetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Asset_serialNumber_key" ON "Asset"("serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
