import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: `PUT URL HERE TOO` });
const prisma = new PrismaClient({ adapter });

export default prisma;
