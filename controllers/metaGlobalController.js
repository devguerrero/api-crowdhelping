'use strict'

const MetaGlobal = require('../models/metaGlobal')

function createMetaGlobal (req, res) {
	let metaGlobal = new MetaGlobal()
	metaGlobal.nombre = req.body.nombre

	metaGlobal.save((err, metaGlobalGuardada) => {
		if (err) return res.status(500).send({ mensaje: `Error al almacenar en la BD ${err}` })
		res.status(200).send(metaGlobalGuardada)	
	})
}

function getMetaGlobal (req, res) {
	let metaGlobalId = req.params.metaGlobalId
	MetaGlobal.findById(metaGlobalId, (err, metaGlobal) => {
		if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
		if (!metaGlobal) return res.status(404).send({ mensaje: `Meta Global no encontrada` })
		res.status(200).send(metaGlobal)
	})

}

function getMetasGlobales (req, res) {
	MetaGlobal.find({}, (err, metasGlobales) => {
		if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
		if (!metasGlobales) return res.status(404).send({ mensaje: `Metas Globales no encontradas` })
		res.status(200).send(metasGlobales)
	})
}

function updateMetaGlobal (req, res) {
	let metaGlobalId = req.params.metaGlobalId
	let actualizacion = req.body
	
	MetaGlobal.findByIdAndUpdate(metaGlobalId, actualizacion, (err) => {
		if (err) res.status(500).send({ mensaje: `Error al actualizar la Meta Global: ${err}` })
		MetaGlobal.findById(metaGlobalId, (err, metaGlobalActualizada) => {
			if (err) return res.status(500).send({ mensaje: `Error al obtener la Meta Global actualizada: ${err}` })
			res.status(200).send(metaGlobalActualizada)
		})

	})
}

function deleteMetaGlobal (req, res) {
	let metaGlobalId = req.params.metaGlobalId
	MetaGlobal.findById(metaGlobalId, (err, metaGlobal) => {
		if (err) return res.status(500).send({ mensaje: `Error al eliminar la Meta Global: ${err}` })
		if (!metaGlobal) return res.status(404).send({ mensaje: `Meta Global no encontrada` })	
		metaGlobal.remove(err => {
			if (err) return res.status(500).send({ mensaje: `Error al eliminar la Meta Global: ${err}` })
			res.status(200).send({ mensaje: `Meta Global eliminada satisfactoriamente` })
		})
	})
}

module.exports = {
	createMetaGlobal,
	getMetaGlobal,
	getMetasGlobales,
	updateMetaGlobal,
	deleteMetaGlobal
}
