'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UsuarioSchema = Schema({
	nombreCompleto: String,
	avatarURL: { type: String, default: "" },
	avatarNombre: { type: String, default: "" },
	genero: { type: String, enum: ['Masculino', 'Femenino'] },
	fechaNacimiento: Date,
	lugarNacimiento: String,
	residencia: String,
	telefono: String,
	correo: String,
	seguidos: [{ type: Schema.Types.ObjectId, ref: 'Usuario' }],
	seguidores: [{ type: Schema.Types.ObjectId, ref: 'Usuario' }],
	eventosCreados: [{ type: Schema.Types.ObjectId, ref: 'Evento' }],
	asistenciaEventos: [{ type: Schema.Types.ObjectId, ref: 'Evento' }],
	invitaciones: [{ type: Schema.Types.ObjectId, ref: 'Invitacion' }]
})

module.exports = mongoose.model('Usuario', UsuarioSchema)