import createError from 'http-errors'
import express, {NextFunction, Request, Response} from 'express'
import path from 'node:path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import session from 'express-session'
import {RedisStore} from 'connect-redis'
import {createClient} from 'redis'

import passport from './libs/auth.js' // 設定済みのpassportをインポート

import indexRouter from './routes/index.js'
import usersRouter from './routes/users.js'
import boardRouter from './routes/board.js'

const app = express()

// Redisクライアントの作成
const redisClient = await createClient({url: process.env.REDIS_URL})
  .on('error', (err: Error) => console.error(err))
  .connect()
const redisStore = new RedisStore({client: redisClient})

// view engine setup
app.set('views', path.join(import.meta.dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
app.use(express.static(path.join(import.meta.dirname, 'public')))
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret key',
  resave: false,
  saveUninitialized: false,
  name: 'mb-sid',
  cookie: {
    maxAge: 1000 * 60 * 60,
    httpOnly: true,
  },
  store: redisStore, //valkeyをセッションストアとして使用
}))
// session設定後に呼び出す↓
app.use(passport.authenticate('session'))

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/board', boardRouter)

// catch 404 and forward to error handler
app.use(async (req: Request, res: Response, next: NextFunction) => {
    throw createError(404)
})

// error handler
app.use(async (err: unknown, req: Request, res: Response, next: NextFunction) => {
    // set locals, only providing error in development
    res.locals.message = hasProperty(err, 'message') && err.message || 'Unknown error'
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    res.status(hasProperty(err, 'status') && Number(err.status) || 500)
    res.render('error')
})

// unknown 型のデータが、指定のプロパティを持っているかチェックするための関数
function hasProperty<K extends string>(x: unknown, ...name: K[]): x is { [M in K]: unknown } {
    return (
        x instanceof Object && name.every(prop => prop in x)
    )
}

export default app