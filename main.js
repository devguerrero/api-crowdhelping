'use strict'
// Librerias
const mongoose = require('mongoose')
const app = require('./app')
const config = require('./config')

mongoose.connect(config.DB + '/crowdhelping', (err) => {
	if (err) {
		return console.log(`Error al conectar con la BD: ${err}`)
	}
	console.log('Conexion con MongoDB establecida')
	app.listen(config.PORT, () => {
		console.log(`API REST corriendo en http://localhost:${config.PORT}`)
	})
})
