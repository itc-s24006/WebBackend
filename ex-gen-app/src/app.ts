// Expressを使ったアプリケーションの基本設定

import createError from 'http-errors'
import express, {NextFunction, Request, Response} from 'express'    // {}内は型定義のインポート
import path from 'node:path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'     // HTTPリクエストのログを出力するためのライブラリ

// typescriptはビルド時にjsファイルにコンパイルされるから、拡張子は.jsで合ってる
import indexRouter from './routes/index.js'
import usersRouter from './routes/users.js'
import helloRouter from './routes/hello.js'

const app = express()

// view engine setup
// .set() 値を設定
app.set('views', path.join(import.meta.dirname, 'views'))　// テンプレートファイルの場所を指定
app.set('view engine', 'pug')

// モジュールの組み込み-----------------------------------------------------------
// .use() どこかで作られたものを組み込む
app.use(logger('dev'))
app.use(express.json())     // クライアントから送られたJSONをparseする関数
app.use(express.urlencoded({extended: false}))  // URLをエンコードする関数
app.use(cookieParser())
// ↓ 指定したディレクトリ(public配下)を静的ファイルとしてそのまま返すやつ
app.use(express.static(path.join(import.meta.dirname, 'public')))
// -----------------------------------------------------------------------------


// ルーティングの設定　アプリモジュール呼び出しの後　かつ　404エラー処理の前-----------------
app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/hello', helloRouter)
// -----------------------------------------------------------------------------


// catch 404 and forward to error handler---------------------------------------
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