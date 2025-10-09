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

        setCookie('msg', data.msg, res)

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
    const cookie_data = getCookie(req)
    const content = index_template({
        title: 'Index',
        content: '※伝言を表示します。',
        data,
        cookie_data
    })
    res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'})
    res.write(content)
    res.end()
}

function setCookie(key: string, value: string, res: http.ServerResponse) {
    //[]つけるとパラメータとして受け取ったkeyの中身がキーとなる
    const encoded_cookie = qs.stringify({[key]: value})
    res.setHeader('Set-Cookie', [encoded_cookie])

}

function getCookie(req: http.IncomingMessage) {
    // cookieが存在するかどうかの判定 あれば取得、なければ空文字
    const cookie_data = req.headers.cookie != undefined
    ? req.headers.cookie : ''
    // 生のcookieは;で区切られた文字列だから、;で分割して配列にする
    const data = cookie_data.split(';')
        .map(raw_cookie => qs.parse(raw_cookie.trim()))
/*      reduce()    配列の結果をぐるぐる回しながら、一つのオブジェクトにまとめる
        [ {msg: 'hogehoge'}, {hoge: 'fugafuga'} ]  → {msg: 'hogehoge', hoge: 'fugafuga'}
        この形式にすることで、dataのmsg などアクセスしやすくする　
        acc = 合成用の変数　cookie = 各要素が入る変数 */
        .reduce((acc, cookie) => ({...acc, ...cookie}))
    return data
}