'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt-nodejs')

const CuentaSchema = Schema({
	correo: { type: String, unique: true, lowercase: true },
	clave: String ,
	esAdmin: { type: Boolean, default: false },
	fechaRegistro: { type: Date, default: Date.now() },
	usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }
})

module.exports = mongoose.model('Cuenta', CuentaSchema)