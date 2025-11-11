import {Router} from 'express'
import prisma from "../libs/db.js";

const router = Router()
const ITEMS_PER_PAGE = 5


router.use(async (req, res, next) => {
  // 先にログイン済みか確認するミドルウェア
  if (!req.isAuthenticated()) {
    // 未ログインならログインページへリダイレクト
    res.redirect('/users/login')
    return
  }
  next() // 非同期処理後に次へ進めるために必ずnext()を呼ぶ
})

// オプションは{}で囲む
router.get('/{:page}', async (req, res) => {
  // ページ番号をパスパラメータから取得。なければデフォで1ページ目
  const page = parseInt(req.params.page || "1")

  res.send(`Welcome to board. page: ${page}`)
})

export default router