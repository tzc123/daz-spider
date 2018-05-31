const Router = require('koa-router')
const router = new Router()
const loginController = require('./controller/login')
const taskController = require('./controller/task')
const messageController = require('./controller/message')
const urlController = require('./controller/url')

router
.post('/user', userController.create)
.get('/user', userController.list)
.get('/user/:id', userController.index)
.post('/task', taskController.create)
.get('/task', taskController.list)
.get('/task/:id', taskController.index)
.post('/message', messageController.create)
.get('message', messageController.list)
.get('/message/:id', messageController.index)
.post('/message/:id', messageController.update)
.post('/url', urlController.create)
.get('/url', urlController.list)
.get('/url/:id', urlController.index)
.post('/url/:id', urlController.update)

module.exports = router