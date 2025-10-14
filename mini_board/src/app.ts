import http from 'node:http'
import fs from 'node:fs/promises'
import pug from 'pug'
import { URL } from 'node:url'
import qs from 'node:querystring'
import path from 'node:path'

// pug  テンプレートをコンパイルして準備しておく
// import.meta.dirname  src ディレクトリまでの絶対パスが入ってる(OS間の互換性を保ってくれる)
const pugIndex = pug.compileFile(path.join(import.meta.dirname, 'index.pug'))
const pugLogin = pug.compileFile(path.join(import.meta.dirname, 'login.pug'))

// メッセージの最大保管数
const MAX_MESSAGE = 10
// メッセージを保存するファイル名
const DATA_FILENAME = "mydata.txt"

// メッセージデータを入れておく配列　constでも配列の要素は自由に出し入れ可能
const messageData: Array<{id: string, msg: string}> = await readFromFile(
    path.join(import.meta.dirname, DATA_FILENAME),
)

// Server オブジェクトを作成
const server = http.createServer(getFromClient)
// 接続待ち受け
server.listen(3210)
console.log('Server start!')


// ----------------ここから各関数の定義----------------

async function getFromClient(
    req: http.IncomingMessage,
    res: http.ServerResponse
) {
    const url = URL.parse(req.url || '', 'http://localhost:3210')

    switch (url?.pathname) {
        case '/':
            await responseIndex(req, res)
            break
        case '/login':
            await responseLogin(req, res)
            break
        default:
            res.writeHead(404, {'Content-Type': 'text/plain'})
            res.end('not found page...')
            break
    }
}


// /login の処理
async function responseLogin(
    // _実装では使わないときにつける(フレームワークによっては引数の数が決まってることがあるから)
    _req: http.IncomingMessage,
    res: http.ServerResponse
) {
    const content = pugLogin()
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
    res.write(content)
    res.end()
}

// / の処理
async function responseIndex(
    req: http.IncomingMessage,
    res: http.ServerResponse
) {
    //POSTではないアクセス時
    if (req.method !== 'POST') {
        // テンプレートレンダリングして終わり
        const content = pugIndex({
            data: messageData
        })
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
        res.write(content)
        res.end()
        return
    }

    //POSTアクセス時
    const postData = await parseBody(req)
    await addToData(postData.id, postData.msg, DATA_FILENAME)

    // リダイレクトする
    res.writeHead(302, "Found", {
        Location: '/',
    })
    res.end()
}

// リクエストボディをパースする関数
async function parseBody(req: http.IncomingMessage) {
    return new Promise<{id: string, msg: string}>((resolve, reject) => {
        let body = ''
        req.on('data', chunk => body += chunk)
        req.on('end', () => {
            const parsed = qs.parse(body)
            resolve({id: String(parsed.id), msg: String(parsed.msg)})
        })
    })
}

// 指定された名前のファイルを読み込んでメッセージデータを取り出す関数(アプリ起動時に一度だけ実行される)
async function readFromFile(filename: string) {
    let fd: fs.FileHandle | null = null     // ファイル開けなかったらnull
    let result: Array<{id: string, msg: string}> = []

    try {
        fd = await fs.open(filename, 'a+')  // 別プロセスとの整合性を保つためOSを経由してファイル開く
                                                　// a+はファイルあれば追記モード、なければ新規作成
        result = (await fs.readFile(fd, 'utf8'))
            .split('\n')
            .filter(v => v.length > 0)
            .map<{id: string, msg: string}>(s => JSON.parse(s))
    }catch (err) {
        console.error(err)
    }finally {  // ファイルを開いたら必ずcloseする。nullなら何もしない
        await fd?.close()
    }
    return result
}

// データを更新
async function addToData(id: string, msg: string, fileName: string) {
    messageData.unshift({id, msg}) // unshift() 先頭に追加
    if (messageData.length > MAX_MESSAGE) {
        messageData.pop()
    }
    await saveToFile(fileName)
}

// データを保存
async function saveToFile(filename: string) {
    const filepath = path.join(import.meta.dirname, filename)
    const data = messageData.map(m => JSON.stringify(m)).join('\n')

    try {
        await fs.writeFile(filepath, data)
    }catch (err) {
        console.error(err)
    }
}