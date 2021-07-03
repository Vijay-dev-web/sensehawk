const { Router } = require('express')
const publicRoutes = Router()
const authController = require('../controller/authController.js')

publicRoutes.get('/signup', authController.signup_get)
publicRoutes.post('/signup', authController.signup_post)
publicRoutes.get('/login', authController.login_get)
publicRoutes.post('/login', authController.login_post)
publicRoutes.get('/logout', authController.logout_get)

module.exports = { publicRoutes }
