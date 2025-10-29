import {Router} from 'express'
import {PrismaMariaDb} from "@prisma/adapter-mariadb";
import {PrismaClient} from 'db';

const router = Router()
const adapter = new PrismaMariaDb({
    host: 'localhost',
    port: 3306,
    user: 'prisma',
    password: 'prisma',
    database: 'chap6',
    connectionLimit: 5,
})
const prisma = new PrismaClient({adapter})

export default router