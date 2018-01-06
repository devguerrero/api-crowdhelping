'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const EventoSchema = Schema({
	nombre: String,
	fecha: Date,
	direccion: String,
	descripcion: String,
	cupos: Number,
	imagenURL: String,
	imagenNombre: String,
	fechaCreacion: { type: Date, default: Date.now },
	creador: { type: Schema.Types.ObjectId, ref: 'Usuario' },
	metaGlobal: { type: Schema.Types.ObjectId, ref: 'MetaGlobal' },
	asistencias: [{ type: Schema.Types.ObjectId, ref: 'Usuario' }],
	publicaciones: [{ type: Schema.Types.ObjectId, ref: 'Publicacion' }],
	meGustas: [{ type: Schema.Types.ObjectId, ref: 'Usuario' }]
})

module.exports = mongoose.model('Evento', EventoSchema)