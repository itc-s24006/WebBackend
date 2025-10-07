import http from 'node:http'
import fs from 'node:fs/promises'

const server = http.createServer(
    async (request, response) => {
        // 指示が終わるまで待つ　await
        const data = await fs.readFile('./home.html', 'utf8')
        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        response.write(data)
        response.end()
    }
)