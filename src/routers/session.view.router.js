import { Router } from 'express'
import { privateRoutes, publicRoutes } from '../middlewares/auth.middleware.js'
import UserDTO from '../dto/user.dto..js'

const router = Router()

router.get('/register', privateRoutes, async(req, res) => {
    res.render('sessions/register')
})

router.get('/', privateRoutes, (req, res) => {
    res.render('sessions/login')
})

router.get('/profile', publicRoutes, (req, res) => {
    const userDTO = new UserDTO(req.session.user)
    res.render('sessions/profile', userDTO)
})

export default router