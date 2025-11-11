// 型情報の拡張ファイル　.dつける
import 'express-session'
import 'passport'

declare module 'express-session' {
  // ログイン失敗時にエラーメッセージを格納するためのフィールド
  interface SessionData {
    messages: string[]
  }
}

declare global {
  namespace Express {
    interface User {
      id: string // 最低限必用
      name: string // 使用頻度高いから追加
    }
  }
}

declare module 'passport' {
  interface AuthenticateOptions {
    badRequestMessage?: string | undefined
  }
}