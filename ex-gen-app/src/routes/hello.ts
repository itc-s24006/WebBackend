import { Router } from 'express'
import mariadb from 'mariadb'

const router = Router()
const db = await mariadb.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'example',
    database: 'mydb',
})

//型定義
interface MyData {
    id: number
    name: string
    mail: string
    age: number
}

router.get('/', async (req, res, next) => {
    const result = await db.query<MyData[]>('SELECT * FROM mydata')
    res.render('hello', {
        title: 'Hello!',
        content: result
    })
})

export default router