import {Router} from 'express'
import passport from '../libs/auth.js'

const router = Router()

router.get('/login', async (req, res) => {
  res.render('users/login', {
    // undefined をpopで取り出したらまずいので空配列を代入しておく
    error: (req.session.messages || []).pop()
  })
})

router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/board',
    failureRedirect: '/users/login',
    failureMessage: true,
    badRequestMessage: 'メールアドレスとパスワードを入力してください。'
  }))

export default router