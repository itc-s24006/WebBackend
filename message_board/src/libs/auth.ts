import passport from 'passport'
import {Strategy as LocalStrategy} from 'passport-local'
import argon2 from 'argon2'
import prisma from './db.js'

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
}, async (username, password, done) => {
  try {
    // ユーザ情報を取得
    const user = await prisma.user.findUnique({where: {email: username}})
    if(!user){
      // ユーザ情報が無いということはログイン失敗
      // だが攻撃者に情報を与えないために濁して伝える
      return done(null, false, {message: 'メールアドレスまたはパスワードが違います。'})
    }

    if (!await argon2.verify(user.password, password)) {
      // パスワードのハッシュ値が異なるのでログイン失敗
      return done(null, false, {message: 'メールアドレスまたはパスワードが違います。'})
    }

    // メアドとパスワードの組み合わせが正しいのでログイン成功
    return done(null, {id: user.id, name: user.name})
  } catch(e){
    return done(e)
  }
}))

// セッションストレージにユーザ情報を保存する処理
passport.serializeUser<Express.User>((user, done) => {
  process.nextTick(() => {
    done(null, user)
  })
})

// セッションストレージから　serializeUser 関数によって保存されたユーザ情報を
// 取り出した直後になんかする設定
passport.deserializeUser<Express.User>((user, done) => {
  process.nextTick(() => {
    done(null, user)
  })
})

export default passport