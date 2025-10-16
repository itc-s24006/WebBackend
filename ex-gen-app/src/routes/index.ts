import {Router} from 'express'

const router = Router()

/* Get home page. */
router.get('/', async (req, res, next) => {
    res.render('index', {title: 'Express'})
    // .render() テンプレートを使ってレンダリングする関数
    // 第一引数: テンプレートファイルの名前 (viewsフォルダからの相対パスで指定)
    // 第二引数: テンプレートに渡すデータ (オブジェクトで指定)
})

export default router