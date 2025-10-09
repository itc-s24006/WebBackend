// 標準機能の場合はモジュール名の頭にnode:をつける(推奨)
import http from "node:http"
import pug from 'pug'
import url from 'node:url'
import qs from'node:querystring'

/*
async/awaitを使うと、処理がすこしシンプルになるし、try/catchでエラーハンドリングもできる。
 */

// レンダリング用のテンプレートをコンパイル
const index_template = pug.compileFile('./index.pug')
const other_template = pug.compileFile('./other.pug')

// httpモジュールをインポート
// createServer()メソッドでサーバーを作成
const server = http.createServer(getFromClient)

// 3210番ポートでサーバーを起動 (listen状態)
server.listen(3210)
console.log("server start!")

const data = {
    msg: 'no message...'
}

// ここまでメインプログラム＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝


// createServer の処理
async function getFromClient(req: http.IncomingMessage, res: http.ServerResponse) {
    const url_parts = new url.URL(req.url || '', 'http://localhost:3210')

    // ルーティング    どのファイルにアクセスしたかで処理を分けること
    switch (url_parts.pathname) {
        case '/':
            await response_index(req, res)
            break

        case '/other':
            await response_other(req, res)
            break

        default: {
            // 想定していないパスへのアクセスが来たとき対処
            res.writeHead(404, {'Content-Type': 'text/plain'})
            res.end('no page...')
            break
        }
    }
}

async function response_index(req: http.IncomingMessage, res: http.ServerResponse) {
    // POSTでアクセスされたかの判定
    if (req.method === 'POST') {
        const post_date = await parse_body(req)
        data.msg = post_date.msg as string

        // リダイレクトする
        res.writeHead(302, 'Found', {
            'Location':'/'
            // この際自動的に必ずgetでアクセスされる
        })
        res.end()
    }else {
        write_index(req, res)
    }
}

async function response_other(req: http.IncomingMessage, res: http.ServerResponse) {
    let msg = 'これは Other ページです。'

    if (req.method === 'POST') {
        const post_data = await (new Promise<qs.ParsedUrlQuery>((resolve, reject) => {
            // bodyは空にしておいて、
            let body = ''
            // data受信のたびにbodyに追加していく
            req.on('data', (chunk) => {
                body += chunk
            })
            // data受信が終わるとparseしてresolve関数を呼び出す。
            // Promiseの中で処理が成功したらresolve、失敗したらrejectを使う。
            req.on('end', () => {
                try {
                    resolve(qs.parse(body))
                } catch (e) {
                    console.error(e)
                    reject(e)
                }
            })
        }))
        msg += `あなたは「${post_data.msg}」と書きました。`
        const content = other_template({
            title: 'Other',
            content: msg,
        })
        res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'})
        res.write(content)
        res.end()
    } else {
        // POST 以外のアクセス
        const content = other_template({
            title: 'Other',
            content: 'ページがありません。',
        })
        res.writeHead(404, {'Content-Type': 'text/html; charset=UTF-8'})
        res.write(content)
        res.end()
    }
}

function parse_body(req: http.IncomingMessage): Promise<qs.ParsedUrlQuery> {
    return new Promise((resolve, reject) => {
        let body = ''
        req.on('data', (chunk) => {
            body += chunk
        })
        req.on('end', () => {
            resolve(qs.parse(body))
        })
    })
}

// POST以外のとき、index.pugを表示する関数
function write_index(req: http.IncomingMessage, res: http.ServerResponse) {
    const content = index_template({
        title: 'Index',
        content: '※伝言を表示します。',
        data
    })
    res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'})
    res.write(content)
    res.end()
}