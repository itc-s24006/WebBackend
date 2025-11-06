import {Router} from 'express'

const router = Router()

router.get('/login', async (req, res) => {
  res.render('users/login')
})

export default router