// データベースオブジェクトは1つのアプリに1つだけ

import {PrismaMariaDb} from "@prisma/adapter-mariadb";
import {PrismaClient} from "db";

const url = String(process.env.DATABASE_URL);
// ↓ match() 正規表現で分解　(ユーザー名、パスワード、ホスト、ポート、データベース名)を<>で指定した名前で取得できる
const params = url.match(
  /^mysql:\/\/(?<user>.+?):(?<password>.+?)@(?<host>.+?):(?<port>\d+)\/(?<database>.+?)$/
)?.groups || {};

const adapter = new PrismaMariaDb({
  user: params.user,
  password: params.password,
  host: params.host,
  port: Number(params.port), // portは数値型に変換
  database: params.database,
  connectionLimit: 5, // 同時接続数
})

const prisma = new PrismaClient({adapter});

export default prisma;