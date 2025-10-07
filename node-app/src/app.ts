import http from "node:http"
// 標準機能の場合はモジュール名の頭にnode:をつける(推奨)
import pug from 'pug'

/*
async/awaitを使うと、処理がすこしシンプルになるし、try/catchでエラーハンドリングもできる。
 */

// httpモジュールをインポート
// createServer()メソッドでサーバーを作成
const server = http.createServer(getFromClient)

// 3210番ポートでサーバーを起動 (listen状態)
server.listen(3210)
console.log("server start!")

// ここまでメインプログラム＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝


// createServer の処理
async function getFromClient(req: http.IncomingMessage, res: http.ServerResponse) {
    // pugを読み込んでHTMLに変換
    const content = pug.renderFile('./index.pug', {
        //　renderFile()の第２引数で、テンプレートに渡す変数をオブジェクトで指定
        title: 'Indexページ',
        content: 'これはテンプレートを使ったサンプルページです。'
    })
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
    res.write(content)
    res.end()
}