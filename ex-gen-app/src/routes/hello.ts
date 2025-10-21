import { Router } from 'express'

const router = Router()

declare module 'express-session' {
    interface SessionData {
        message?: string
    }
}

router.get('/', async (req, res, next) => {
    const msg = req.session.message !== undefined
    ? `Last Message: ${req.session.message}`
        : "※何か書いて送信してください。"


    const data = {
        title: 'Hello',
        content: msg
    }
    //  第1引数:テンプレートファイル　第2引数:レンダリング用のパラメーター
    res.render('hello', data)
})

router.post('/post', async (req, res, next) => {
    const msg = req.body.message as string | undefined
    req.session.message = msg
    const data = {
        title: 'Hello!',
        content: `あなたは「${msg}」と送信しました。`
    }
    res.render('hello', data)
})

export default router