'use strict'
// Librerias
const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const cors = require('cors')

const app = express()
const api = require('./routes')

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(multer({ dest: "./imagenes" }))
app.use(bodyParser.json())
app.use('/api', api)

module.exports = app