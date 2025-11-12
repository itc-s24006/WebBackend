import {Router} from 'express'
import prisma from "../libs/db.js";
import {check, validationResult} from "express-validator";

const router = Router()
const ITEMS_PER_PAGE = 5 // 1ページあたりの表示件数


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
  const posts = await prisma.post.findMany({
    skip: (page - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
    where: {
      isDeleted: false, // 削除されていない投稿のみ取得
    },
    orderBy: [ // 順番をDBに頼るな　なにがあってもorderByは指定する
      {createdAt: 'desc'}
    ],
    include: { // ユーザー情報と関連付いてても、includeで指定しないと取れない
      user: {
        select: { // 必要情報のみ取得
          id: true,
          name: true
        }
      }
    }
  })
  // 件数を取得したいだけなら、countメソッドを使う
  const count = await prisma.post.count({
    where: {isDeleted: false}
  })
  const maxPage = Math.ceil(count / ITEMS_PER_PAGE) // 小数点以下切り上げ

  res.render('board/index', {
    user: req.user, // ログイン中のユーザー情報
    posts,
    page,
    maxPage
  })
})

router.post('/post',
  check('message').notEmpty(),
  async (req, res) => {
    const result = validationResult(req)
    if (result.isEmpty()) {
      // エラーが空 = チェック通った
      await prisma.post.create({
        data: {
          userId: req.user?.id as string,
          message: req.body.message
        }
      })
    }
    return res.redirect('/board')
  })

export default router