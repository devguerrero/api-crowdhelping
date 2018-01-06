'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const MetaGlobalSchema = Schema({
	nombre: String
})

module.exports = mongoose.model('MetaGlobal', MetaGlobalSchema)