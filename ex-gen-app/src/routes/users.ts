import {Request, Router} from 'express'
import {PrismaMariaDb} from "@prisma/adapter-mariadb";
import {Prisma, PrismaClient} from 'db'; // Prismaはprismaオブジェクト

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
    page?: string
    prev?: string //戻る
    next?: string //進む
}

const PAGE_SIZE = 3

router.get('/', async (req: Request<{}, {}, {}, UserParams>, res, next) => {
    const conditions: Prisma.UserFindManyArgs = {
         orderBy: [
             {id: 'asc'},
         ],
         take: PAGE_SIZE,
    }
    const {prev: prevCursor, next: nextCursor} = req.query //型名の指定じゃなくて変数名を指定してる。右側が新しい変数名
    if (nextCursor) {
        conditions.cursor = {id: parseInt(nextCursor)}
        conditions.skip = 1 //カーソルの分をスキップ
    }
    if (prevCursor) {
        // 戻るボタンのときはtakeをマイナスにすると逆順に遡って取ってきてくれる
        conditions.take = -PAGE_SIZE
        conditions.cursor = {id: parseInt(prevCursor)}
        conditions.skip = 1 //カーソルの分をスキップ
    }

    const users = await prisma.user.findMany(conditions)

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

router.get('/add', async (req, res, next) => {
    res.render('users/add', {
        title: 'Users/Add',
    })
})

router.post('/add', async (req, res, next) => {
    const { name, pass, mail } = req.body //取り出し
    const age = parseInt(req.body.age)
    await prisma.user.create({
        data: {nama: name, pass, mail, age}
    })
    res.redirect('/users')
})
router.get('/edit/:id', async (req, res, next) => {
    const id = parseInt(req.params.id)
    const user = await prisma.user.findUnique({where: {id}})
    res.render('users/edit', {
        title: 'Users/Edit',
        user: { ...user!, name: user!.nama },
    })
})

router.post('/edit', async (req, res, next) => {
    const id = parseInt(req.body.id)
    const { name, pass, mail } = req.body
    const age = parseInt(req.body.age)
    await prisma.user.update({
        where: {id},
        data: {nama: name, pass, mail, age}
    })
    res.redirect('/users')
})

router.get('/delete/:id', async (req, res, next) => {
    const id = parseInt(req.params.id)
    const user = await prisma.user.findUnique({where: {id}})
    res.render('users/delete', {
        title: 'Users/Delete',
        user: { ...user!, name: user!.nama },
    })
})

router.post('/delete', async (req, res, next) => {
    const id = parseInt(req.body.id)
    await prisma.user.delete({
        where: {id}
    })
    res.redirect('/users')
})

export default router
