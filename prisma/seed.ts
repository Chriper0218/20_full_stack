import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    // 1. Crear un Usuario Admin (con tu lógica de Compañía Llave)
    const admin = await prisma.user.upsert({
        where: { email: 'admin@tuempresa.com' },
        update: {},
        create: {
            name: 'Administrador de IT',
            email: 'admin@tuempresa.com',
            passwordHash: '$2a$10$MvN35PkWp79R7O4A4bC7Oux/7W0D5L1bYhWbVvU8X7b8xJvCg1Vvy', // password is admin123
            companyKey: 'CUC-2026', // Tu llave de organización
            role: 'ADMIN',
        },
    });

    // 2. Crear algunos Activos de prueba
    await prisma.asset.createMany({
        skipDuplicates: true,
        data: [
            {
                serialNumber: 'LAP-001',
                brand: 'Dell',
                model: 'Latitude 5420',
                category: 'LAPTOP',
                status: 'ASIGNADO',
                userId: admin.id,
            },
            {
                serialNumber: 'SRV-099',
                brand: 'HP',
                model: 'ProLiant DL380',
                category: 'SERVER',
                status: 'BODEGA',
            },
            {
                serialNumber: 'NET-050',
                brand: 'Cisco',
                model: 'C9200L',
                category: 'NETWORK_DEVICE',
                status: 'MANTENIMIENTO',
            },
        ],
    });

    console.log('✅ Base de datos poblada con éxito');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });