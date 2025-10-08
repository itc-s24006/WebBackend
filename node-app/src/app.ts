// 標準機能の場合はモジュール名の頭にnode:をつける(推奨)
import http from "node:http"
import pug from 'pug'
import url from 'node:url'
import fs from 'node:fs/promises'

/*
async/awaitを使うと、処理がすこしシンプルになるし、try/catchでエラーハンドリングもできる。
 */

// レンダリング用のテンプレートをコンパイル
const index_template = pug.compileFile('./index.pug')
const other_template = pug.compileFile('./other.pug')
const style_css = await fs.readFile('./style.css', 'utf-8')

// httpモジュールをインポート
// createServer()メソッドでサーバーを作成
const server = http.createServer(getFromClient)

// 3210番ポートでサーバーを起動 (listen状態)
server.listen(3210)
console.log("server start!")

// ここまでメインプログラム＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝


// createServer の処理
async function getFromClient(req: http.IncomingMessage, res: http.ServerResponse) {
    const url_parts = new url.URL(req.url || '', 'http://localhost:3210')

    // ルーティング    どのファイルにアクセスしたかで処理を分けること
    switch (url_parts.pathname) {
        case '/': {
            //Index(トップページ)にアクセスがきたときの処理
            const content = index_template({
                title: 'Indexページ',
                content: 'これはテンプレートを使ったサンプルページです。',
            })
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
            res.write(content)
            res.end()
            break
        }

        case '/other': {
            //Index(トップページ)にアクセスがきたときの処理
            const content = other_template({
                title: 'Otherページ',
                content: 'これは新しく用意したページです。',
            })
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
            res.write(content)
            res.end()
            break
        }

        default :
            // 想定していないパスへのアクセスが来たとき対処
            res.writeHead(404, {'Content-Type': 'text/plain'})
            res.end('no page...')
            break
    }
}