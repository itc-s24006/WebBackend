import { Router } from 'express'

const router = Router()

router.get('/', async (req, res, next) => {

    const data = {
        title: 'Hello',
        content: `※何か書いて送信してください。`
    }
    //  第1引数:テンプレートファイル　第2引数:レンダリング用のパラメーター
    res.render('hello', data)
})

router.post('/post', async (req, res, next) => {
    const msg = req.body.message as string | undefined
    const data = {
        title: 'Hello!',
        content: `あなたは「${msg}」と送信しました。`
    }
    res.render('hello', data)
})

export default router