'use strict'

const Comentario = require('../models/comentario')
const Publicacion = require('../models/publicacion')
const Usuario = require('../models/usuario')

function createComentario (req, res) {
	let publicacionId = req.params.publicacionId
	Publicacion.findById(publicacionId, (err, publicacion) => {
		if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
		if (!publicacion) return res.status(404).send({ mensaje: `Publicacion no encontrada` })

		let comentario = new Comentario()
		comentario.contenido = req.body.contenido
		comentario.autor = req.body.autorId
		
		comentario.save((err, comentarioGuardado) => {
			if (err) return res.status(500).send({ mensaje: `Error al almacenar en la BD ${err}` })
			publicacion.comentarios.push(comentario)
			Publicacion.findByIdAndUpdate(publicacionId, { "comentarios": publicacion.comentarios }, (err) => {	})
			Comentario.findById(comentarioGuardado.id)
			          .populate('autor')
			          .exec((err, comentarioAlmacenado) => {
			          		if (err) return res.status(500).send({ mensaje: `Error al obtener el comentario registrado: ${err}` })
							res.status(200).send(comentarioAlmacenado)
			          })
		})
	})
}

function getComentarios (req, res) {
	let publicacionId = req.params.publicacionId
	Publicacion.findById(publicacionId)
		       .populate({
		       		path: 'comentarios',
		       		model: 'Comentario',
		       		populate: {
		       			path: 'autor',
		       			model: 'Usuario'
		       		}
		       })
		       .exec((err, publicacion) => {
					if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
					if (!publicacion) return res.status(404).send({ mensaje: `Publicacion no encontrada` })
					if (!publicacion.comentarios) return res.status(404).send({ mensaje: `Comentarios no encontrados` })
					const comentarios = publicacion.comentarios
					res.status(200).send(comentarios)
			   })
}

function updateComentario (req, res) {
	let comentarioId = req.params.comentarioId
	let actualizacion = req.body
	
	Comentario.findByIdAndUpdate(comentarioId, actualizacion, (err) => {
		if (err) res.status(500).send({ mensaje: `Error al actualizar el Comentario: ${err}` })
		Comentario.findById(comentarioId, (err, comentario) => {
			if (err) return res.status(500).send({ mensaje: `Error al obtener el comentario registrado: ${err}` })
			res.status(200).send(comentario)
		})
	})
}

function deleteComentario (req, res) {
	let comentarioId = req.params.comentarioId
	Comentario.findById(comentarioId, (err, comentario) => {
		if (err) return res.status(500).send({ mensaje: `Error al eliminar el Comentario: ${err}` })
		if (!comentario) return res.status(404).send({ mensaje: `Comentario no encontrada` })	
		comentario.remove(err => {
			if (err) return res.status(500).send({ mensaje: `Error al eliminar el Comentario: ${err}` })
			res.status(200).send({ mensaje: `Comentario eliminado satisfactoriamente` })
		})

		if (comentario.publicacion) {
			let publicacionId = comentario.publicacion
			Publicacion.findById(publicacionId, (err, publicacion) => {
				const index = publicacion.comentarios.indexOf(publicacionId)
				if (index > -1) {
					publicacion.comentarios.splice(index, 1)
					Publicacion.findByIdAndUpdate(publicacionId, { "comentarios": publicacion.comentarios }, (err) => {})
				}
			})
		}
	})
}

module.exports = {
	createComentario,
	getComentarios,
	updateComentario,
	deleteComentario
}