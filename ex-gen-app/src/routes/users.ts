import {Request, Router} from 'express'
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

interface UserParams {
    id?: string
    name?: string
    min?: string
    max?: string
    mail?: string
}

router.get('/', async (req: Request<{}, {}, {}, UserParams>, res, next) => {
    const id = parseInt(req.query.id || '') // 「|| ''」 いろんな型が存在するからparseIntが受け取れる型(string)を明示して書く
    const users = await (id ? prisma.user.findMany({where: {id: {lte: id}}}) // findMany() Userテーブルのオブジェクトを返す
        // {id} = {id: id}省略してる  lteは<=(以下)と同じ
        : prisma.user.findMany())

    res.render('users/index', {
        title: 'Users/Index',
        content: users,
    })
})

router.get('/find', async (req: Request<{}, {}, {}, UserParams>, res, next) => {
    const {name, mail} = req.query

    const users= await prisma.user.findMany({where: {
        OR: [
            {nama: {contains: name}},
            {mail: {contains: mail}}
        ]
        }})
    res.render('users/index', {
        title: 'Users/Find',
        content: users,
    })
})

export default router
