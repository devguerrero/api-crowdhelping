'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ComentarioSchema = Schema({
	contenido: String,
	fechaCreacion: { type: Date, default: Date.now },
	autor: { type: Schema.Types.ObjectId, ref: 'Usuario' }
})

module.exports = mongoose.model('Comentario', ComentarioSchema)