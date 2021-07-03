const { Router } = require('express')
const privateRoutes = Router()
const authController = require('../controller/authController.js')
const { requireAuth } = require('../middleware/authMiddleware.js')

privateRoutes.get('/find', requireAuth, authController.find_get)
privateRoutes.post('/find', requireAuth, authController.find_post)

module.exports = { privateRoutes }
