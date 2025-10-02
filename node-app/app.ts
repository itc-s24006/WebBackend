import http from "node:http";
// 標準機能の場合はモジュール名の頭にnode:をつける(推奨)

// httpモジュールをインポート
// createServer()メソッドでサーバーを作成
const server = http.createServer(
    (request, response) => {
        response.setHeader('Content-Type', 'text/html');
        response.write('<!DOCTYPE html><html lang="ja">');
        response.write('<head><meta charset="utf-8">');
        response.write('<title>Hello</title></head>');
        response.write('<body><h1>Hello Node.js!</h1>');
        response.write('<p>This is Node.js sample page.</p>');
        response.write('<p>これは、Node．jsのサンプルページです。</p>', 'utf-8');
        response.write('</body></html>');
        response.end();
        // .end() レスポンスとして返す内容の終了を表す。
        // これがないと、tcp送受信の際に、クライアント側にデータの送信が完了したことを伝えないと、受け取った確認ができない。
    }
);

// 3000番ポートでサーバーを起動 (listen状態)
server.listen(3000);
console.log("server start!")