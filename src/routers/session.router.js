import { Router } from 'express'
import passport from "passport";

const router = Router()

router.post('/register', passport.authenticate('register', {
    failureRedirect: '/api/sessions/failRegister'
}), async(req, res) => {
    res.redirect('/')
})

router.get('/failRegister', (req, res) => {
    res.send({ error: 'Register fails!'})
})

router.post('/login', passport.authenticate('login', { failureRedirect: '/api/sessions/failLogin'}), async (req, res) => {
    req.session.user = req.user
    res.redirect('/products')
})

router.get('/failLogin', (req, res) => {
    res.send({ error: 'Login fails!'})
})

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if(err) {
            console.log(err);
            res.status(500).render('errors/base', {error: err})
        } else res.redirect('/')
    })
})

router.get('/github-login', passport.authenticate('github', { scope: ['user: email']}), (req, res) => {
    
})

router.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/'}), async (req, res) => {
    req.session.user = req.user
    res.redirect('/products')
})

router.get('/current', (req, res) => {
    if (!req.session.user) return res.status(401).json({ status: 'error', error: 'No session detected! (You are not logged-in)' })
    res.status(200).json({ status: 'success', payload: req.session.user })
})

export default router