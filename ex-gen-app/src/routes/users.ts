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
