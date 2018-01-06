'use strict'

const Publicacion = require('../models/publicacion')
const Comentario = require('../models/comentario')
const Evento = require('../models/evento')
const Usuario = require('../models/usuario')
const cloudinary = require('../cloudinary')

function createPublicacion (req, res) {
	let eventoId = req.params.eventoId
	Evento.findById(eventoId, (err, evento) => {
		if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
		if (!evento) return res.status(404).send({ mensaje: `Evento no encontrado` })

		let publicacion = new Publicacion()
		publicacion.contenido = req.body.contenido
		publicacion.imagen = req.body.imagen
		publicacion.autor = req.body.autorId
		publicacion.evento = evento.id
		if (autorId === evento.creador) 
			publicacion.tipo == 1                  // Realizado por el creador y de consumo publico 
		else 
			publicacion.tipo == 2                  // Realizado por un asistente y de consumo privado
		publicacion.imagenURL = ""
		publicacion.imagenNombre = ""
		if (req.files.imagen) {
			const imagen = req.files.imagen
			cloudinary.uploader.upload(imagen.path, (result) => {
				if (result.error) return res.status(500).send({ mensaje: `Error al registrar el avatar: ${result.error.message || result.error}` })
				publicacion.imagenURL = result.url
				publicacion.imagenNombre = result.public_id

				publicacion.save((err, publicacionGuardada) => {
					if (err) return res.status(500).send({ mensaje: `Error al almacenar en la BD ${err}` })
					evento.publicaciones.push(publicacion)
					Evento.findByIdAndUpdate(eventoId, { "publicaciones": evento.publicaciones }, (err) => {})
					Publicacion.findById(publicacionGuardada.id)
					           .populate('autor')
					           .exec((err, publicacionAlmacenada) => {
					           		if (err) return res.status(500).send({ mensaje: `Error al obtener la publicacion registrada: ${err}` })
									res.status(200).send(publicacionAlmacenada)
					           })
				})
			})
		}
		else {
			publicacion.save((err, publicacionGuardada) => {
				if (err) return res.status(500).send({ mensaje: `Error al almacenar en la BD ${err}` })
				evento.publicaciones.push(publicacion)
				Evento.findByIdAndUpdate(eventoId, { "publicaciones": evento.publicaciones }, (err) => {})
				Publicacion.findById(publicacionGuardada.id)
				           .populate('autor')
				           .exec((err, publicacionAlmacenada) => {
				       			if (err) return res.status(500).send({ mensaje: `Error al obtener la publicacion registrada: ${err}` })
								res.status(200).send(publicacionAlmacenada)
				           })
			})
		}
	})
}

function getPublicacion (req, res) {
	let eventoId = req.params.eventoId
	Evento.findById(eventoId, (err, evento) => {
		if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
		if (!evento) return res.status(404).send({ mensaje: `Evento no encontrado` })

		let publicacionId = req.params.publicacionId
		const index = evento.publicaciones.indexOf(publicacionId)
		if (index > -1) {
			Publicacion.findById(publicacionId)
					   .populate('autor')
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
							res.status(200).send(publicacion)
					   })
		}
		else { 
			return res.status(404).send({ mensaje: `Publicacion no encontrada` })
		}
	})
}

function getPublicaciones (req, res) {
	let eventoId = req.params.eventoId
	Evento.findById(eventoId)
		  .populate({
		   		path: 'publicaciones',
		   		model: 'Publicacion',
		   		populate: {
		   			path: 'autor',
			   		model: 'Usuario',	   			
			   		path: 'comentarios',
			   		model: 'Comentario',
			   		populate: {
			   			path: 'autor',
			   			model: 'Usuario'
			   		}
		   		}
		   })
	      .exec((err, evento) => {
				if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
				if (!evento) return res.status(404).send({ mensaje: `Evento no encontrado` })
				if (!evento.publicaciones) return res.status(404).send({ mensaje: `Publicaciones no encontradas` })
				const publicaciones = evento.publicaciones
				res.status(200).send(publicaciones)
		  })
}

function updatePublicacion (req, res) {
	let publicacionId = req.params.publicacionId
	Publicacion.findById(publicacionId, (err, publicacion) => {
		if (err) return res.status(500).send({ mensaje: `Error al actualizar la publicacion: ${err}` })
		if (!publicacion) return res.status(404).send({ mensaje: `Publicacion no encontrada` })
		let actualizacion = req.body
		if (req.files.imagen) {
			const imagen = req.files.imagen
			console.log(imagen)
			if (imagen.originalname !== publicacion.imagenNombre) {
				cloudinary.uploader.upload(imagen.path, (result) => {
					actualizacion.imagenURL = result.url
					actualizacion.imagenNombre = result.public_id

					Publicacion.findByIdAndUpdate(publicacionId, actualizacion, (err) => {
						if (err) res.status(500).send({ mensaje: `Error al actualizar la Publicacion: ${err}` })
						cloudinary.uploader.destroy(evento.imagenNombre)
						Publicacion.findById(publicacionId, (err, publicacion) => {
							if (err) res.status(500).send({ mensaje: `Error al obtener la Publicacion actualizada: ${err}` })
							res.status(200).send(publicacion)
						})
					})
				})
			}
		}
		else {
			Publicacion.findByIdAndUpdate(publicacionId, actualizacion, (err) => {
				if (err) res.status(500).send({ mensaje: `Error al actualizar la Publicacion: ${err}` })
				Publicacion.findById(publicacionId, (err, publicacion) => {
					if (err) res.status(500).send({ mensaje: `Error al obtener la Publicacion actualizada: ${err}` })
					res.status(200).send(publicacion)
				})
			})			
		}
		
	})
}

function deletePublicacion (req, res) {
	let publicacionId = req.params.publicacionId
	Publicacion.findById(publicacionId, (err, publicacion) => {
		if (err) return res.status(500).send({ mensaje: `Error al eliminar la Publicacion: ${err}` })
		if (!publicacion) return res.status(404).send({ mensaje: `Publicacion no encontrada` })	

		if(publicacion.imagenNombre) {
			cloudinary.uploader.destroy(publicacion.imagenNombre, (err) => {
				if (err.result === 'ok' || err.result === 'not found') {
					publicacion.remove(err => {
						if (err) return res.status(500).send({ mensaje: `Error al eliminar la Publicacion: ${err}` })
						res.status(200).send({ mensaje: `Publicacion eliminada satisfactoriamente` })
					})
				}
				else 
					return res.status(200).send({ mensaje: `Error al eliminar la imagen: ${err.result}`})
			})
		}
		else {
			publicacion.remove(err => {
				if (err) return res.status(500).send({ mensaje: `Error al eliminar la Publicacion: ${err}` })
				res.status(200).send({ mensaje: `Publicacion eliminada satisfactoriamente` })
			})
		}

		if (publicacion.evento) {
			let eventoId = publicacion.evento
			Evento.findById(eventoId, (err, evento) => {
				const index = evento.publicaciones.indexOf(eventoId)
				if (index > -1) {
					evento.publicaciones.splice(index, 1)
					Evento.findByIdAndUpdate(eventoId, { "publicaciones": evento.publicaciones }, (err) => {
						//if (err) res.status(500).send({ mensaje: `Error al actualizar el evento: ${err}` })
					})
				}
			})
		}
	})
}

function handleMeGusta (req, res) {
	let usuarioId = req.body.usuarioId
	let publicacionId = req.params.publicacionId 
	Publicacion.findById(publicacionId, (err, publicacion) => {
		if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
		if (!publicacion) return res.status(404).send({ mensaje: `Publicacion no encontrada` })
		Usuario.findById(usuarioId, (err, usuario) => {
			if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
			if (!usuario) return res.status(404).send({ mensaje: `Usuario no encontrado` })
			const index = publicacion.meGustas.indexOf(usuarioId)
			if (index > -1) {
				publicacion.meGustas.splice(index, 1)
				Publicacion.findByIdAndUpdate(publicacionId, { "meGustas": publicacion.meGustas }, (err) => {
					if (err) return res.status(500).send({ mensaje: `Error al almacenar en la BD: ${err}` })
					res.status(200).send({ publicacionId: publicacion.id, meGustas: publicacion.meGustas.length })
				})
			}
			else {
				publicacion.meGustas.push(usuarioId)
				Publicacion.findByIdAndUpdate(publicacionId, { "meGustas": publicacion.meGustas }, (err) => {
					if (err) return res.status(500).send({ mensaje: `Error al almacenar en la BD: ${err}` })
					res.status(200).send({ publicacionId: publicacion.id, meGustas: publicacion.meGustas.length })
				})
			}
		})
		
	})
}

function usuarioDidMeGusta (req, res) {
	let usuarioId = req.params.usuarioId
	let publicacionId = req.params.publicacionId 
	Publicacion.findById(publicacionId, (err, publicacion) => {
		if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
		if (!publicacion) return res.status(404).send({ mensaje: `Publicacion no encontrado` })
		Usuario.findById(usuarioId, (err, usuario) => {
			if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
			if (!usuario) return res.status(404).send({ mensaje: `Usuario no encontrado` })
			const index = publicacion.meGustas.indexOf(usuarioId)
			if (index > -1) {
				res.status(200).send({ dioMeGusta: true })

			}
			else {
				res.status(200).send({ dioMeGusta: false })
			}
		})
		
	})
}

module.exports = {
	createPublicacion,
	getPublicacion,
	getPublicaciones,
	updatePublicacion,
	deletePublicacion,
	handleMeGusta,
	usuarioDidMeGusta
}
