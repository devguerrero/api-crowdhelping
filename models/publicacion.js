'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PublicacionSchema = Schema({
	contenido: String,
	imagen: String,
	fechaCreacion: { type: Date, default: Date.now },
	autor: { type: Schema.Types.ObjectId, ref: 'Usuario' },
	evento: { type: Schema.Types.ObjectId, ref: 'Evento' },
	comentarios: [{ type: Schema.Types.ObjectId, ref: 'Comentario' }],
	meGustas: [{ type: Schema.Types.ObjectId, ref: 'Usuario' }],
	tipo: { type: Number, enum: [1, 2], default: 1 } // 1: Publico 2: Privado
})

module.exports = mongoose.model('Publicacion', PublicacionSchema)