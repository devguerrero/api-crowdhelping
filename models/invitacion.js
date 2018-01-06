'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const InvitacionSchema = Schema({
	usuarioEnvia: { type: Schema.Types.ObjectId, ref: 'Usuario' },
	usuarioRecibe: { type: Schema.Types.ObjectId, ref: 'Usuario' },
	evento: { type: Schema.Types.ObjectId, ref: 'Evento' }
})

module.exports = mongoose.model('Invitacion', InvitacionSchema)