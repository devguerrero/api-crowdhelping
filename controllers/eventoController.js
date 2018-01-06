'use strict'

const Evento = require('../models/evento')
const Usuario = require('../models/usuario')
const Invitacion = require('../models/invitacion')
const cloudinary = require('../cloudinary')

function getEventos (req, res) {
	Evento.find({})
		  .sort({ fechaCreacion: 'desc' })
		  .populate('metaGlobal')
		  .populate('creador')
	      .exec((err, eventos) => {
				if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
				if (!eventos) return res.status(404).send({ mensaje: `Eventos no encontrados` })
				res.status(200).send(eventos)
		  })
}

function getEventosByMetaGlobal (req, res) {
	const metasGlobales = req.body.metasGlobales
	Evento.find({ metaGlobal: { $in: metasGlobales } })
		  .sort({ fechaCreacion: 'desc' })
		  .populate('metaGlobal')
		  .populate('creador')
	      .exec((err, eventos) => {
				if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
				if (!eventos) return res.status(404).send({ mensaje: `Eventos no encontrados` })
				res.status(200).send(eventos)
		  })
}

function getEvento (req, res) {
	let eventoId = req.params.eventoId
	Evento.findById(eventoId)
	      .populate('publicaciones')
	      .populate('metaGlobal')
	      .populate('meGustas')
	      .populate('creador')
	      .populate('asistencias')
	      .exec((err, evento) => {
				if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
				if (!evento) return res.status(404).send({ mensaje: `Evento no encontrado` })
				res.status(200).send(evento)
		  })
}

function createEvento (req, res) {
	let usuarioId = req.params.usuarioId
	Usuario.findById(usuarioId, (err, usuario) => {
		if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
		if (!usuario) return res.status(404).send({ mensaje: `Usuario no encontrado` })

		let evento = new Evento()
		evento.nombre = req.body.nombre
		try {
			evento.fecha = req.body.fecha
		} catch (err) {
			return res.status(500).send({ mensaje: `Error al almacenar en la BD: ${err}` })
		}
		evento.direccion = req.body.direccion
		evento.descripcion = req.body.descripcion
		evento.cupos = req.body.cupos
		evento.fechaCreacion = req.body.fechaCreacion
		evento.creador = usuario._id
		evento.metaGlobal = req.body.metaGlobal
		evento.imagenURL = ""
		evento.imagenNombre = ""
		if (req.files.imagen) {
			const imagen = req.files.imagen
			cloudinary.uploader.upload(imagen.path, (result) => {
				if (result.error) return res.status(500).send({ mensaje: `Error al registrar el avatar: ${result.error.message || result.error}` })
				evento.imagenURL = result.url
				evento.imagenNombre = result.public_id
				evento.save((err, eventoGuardado) => {
					if (err) return res.status(500).send({ mensaje: `Error al almacenar en la BD: ${err}` })
					usuario.eventosCreados.push(evento)
					Usuario.findByIdAndUpdate(usuarioId, { "eventosCreados": usuario.eventosCreados }, (err) => {})
					Evento.findById(eventoGuardado.id)
					      .populate('creador')
					      .exec((err, evento) => {
								if (err) return res.status(500).send({ mensaje: `Error obteniendo el evento creado: ${err}` })
								res.status(200).send(evento)
						  })
				})
			})
		} 
		else {
			evento.save((err, eventoGuardado) => {
				if (err) return res.status(500).send({ mensaje: `Error al almacenar en la BD: ${err}` })
				usuario.eventosCreados.push(evento)
				Usuario.findByIdAndUpdate(usuarioId, { "eventosCreados": usuario.eventosCreados }, (err) => {})
				Evento.findById(eventoGuardado.id)
				      .populate('creador')
				      .exec((err, evento) => {
							if (err) return res.status(500).send({ mensaje: `Error obteniendo el evento creado: ${err}` })
							res.status(200).send(evento)
					  })
			})
		}
	})
}

function updateEvento (req, res) {
	let eventoId = req.params.eventoId
	Evento.findById(eventoId, (err, evento) => {
		if (err) return res.status(500).send({ mensaje: `Error al actualizar el evento: ${err}` })
		if (!evento) return res.status(404).send({ mensaje: `Evento no encontrado` })
		let actualizacion = req.body
		if (req.files.imagen) {
			const imagen = req.files.imagen
			console.log(imagen)
			if (imagen.originalname !== evento.imagenNombre) {
				cloudinary.uploader.upload(imagen.path, (result) => {
					actualizacion.imagenURL = result.url
					actualizacion.imagenNombre = result.public_id
					Evento.findByIdAndUpdate(eventoId, actualizacion, (err) => {
						if (err) return res.status(500).send({ mensaje: `Error al actualizar el evento: ${err}` })
						cloudinary.uploader.destroy(evento.imagenNombre)
						Evento.findById(eventoId, (err, eventoActualizado) => {
							if (err) return res.status(500).send({ mensaje: `Error consultando el evento actualizado: ${err}` })
							res.status(200).send(eventoActualizado)
						})					
					})

				})
			}
		}
		else {
			Evento.findByIdAndUpdate(eventoId, actualizacion, (err) => {
				if (err) return res.status(500).send({ mensaje: `Error al actualizar el evento: ${err}` })
				Evento.findById(eventoId, (err, eventoActualizado) => {
					if (err) return res.status(500).send({ mensaje: `Error consultando el evento actualizado: ${err}` })
					res.status(200).send(eventoActualizado)
				})
			})
		}
	})
}

function deleteEvento (req, res) {
	if (!req.params.eventoId) return res.status(500).send({ mensaje: `Mala peticion` })
	let eventoId = req.params.eventoId
	Evento.findById(eventoId, (err, evento) => {
		if (err) return res.status(500).send({ mensaje: `Error al eliminar el evento: ${err}` })
		if (!evento) return res.status(404).send({ mensaje: `Evento no encontrado` })

		if(evento.imagenNombre) {
			cloudinary.uploader.destroy(evento.imagenNombre, (err) => {
				if (err.result === 'ok' || err.result === 'not found') {
					evento.remove(err => {
						if (err) return res.status(500).send({ mensaje: `Error al eliminar el evento: ${err}` })
						res.status(200).send({ mensaje: `Evento eliminado satisfactoriamente` })
					})
				}
				else 
					return res.status(200).send({ mensaje: `Error al eliminar la imagen: ${err.result}`})
			})			
		}
		else {
			evento.remove(err => {
				if (err) return res.status(500).send({ mensaje: `Error al eliminar el evento: ${err}` })
				res.status(200).send({ mensaje: `Evento eliminado satisfactoriamente` })
			})
		}
		
		if (evento.creador) { //return res.status(404).send({ mensaje: `Evento No tiene creador` })
			let usuarioId = evento.creador
			Usuario.findById(usuarioId, (err, usuario) => {
				const index = usuario.eventosCreados.indexOf(eventoId)
				if (index > -1) {
					usuario.eventosCreados.splice(index, 1)
					Usuario.findByIdAndUpdate(usuarioId, { "eventosCreados": usuario.eventosCreados }, (err) => {
						//if (err) return res.status(500).send({ mensaje: `Error al actualizar el usuario: ${err}` })
					})
				}
			})
		}
	})
}

function getEventosUsuario (req, res) {
	let usuarioId = req.params.usuarioId
	Usuario.findById(usuarioId)
	       .populate({
	       		path: 'eventosCreados',
	       		model: 'Evento',
	       		populate: {
	       			path: 'metaGlobal',
	       			model: 'MetaGlobal'
	       		}
	       })
	       .exec((err, usuario) => {
				if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
				if (!usuario) return res.status(404).send({ mensaje: `Usuario no encontrado` })
				if (!usuario.eventosCreados) return res.status(404).send({ mensaje: `Eventos no encontrados` })
				res.status(200).send({ usuarioId: usuario.id, eventosCreados: usuario.eventosCreados })
			})
}

function getAsistenciasUsuario (req, res) {
	let usuarioId = req.params.usuarioId
	Usuario.findById(usuarioId)
	       .populate({
	       		path: 'asistenciaEventos',
	       		model: 'Evento',
	       		populate: {
	       			path: 'metaGlobal',
	       			model: 'MetaGlobal'
	       		}
	       })
	       .exec((err, usuario) => {
				if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
				if (!usuario) return res.status(404).send({ mensaje: `Usuario no encontrado` })
				if (!usuario.asistenciaEventos) return res.status(404).send({ mensaje: `Eventos no encontrados` })
				res.status(200).send({ usuarioId: usuario.id, asistenciaEventos: usuario.asistenciaEventos })
			})
}

function handleMeGusta (req, res) {
	let usuarioId = req.body.usuarioId
	let eventoId = req.params.eventoId 
	Evento.findById(eventoId, (err, evento) => {
		if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
		if (!evento) return res.status(404).send({ mensaje: `Evento no encontrado` })
		Usuario.findById(usuarioId, (err, usuario) => {
			if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
			if (!usuario) return res.status(404).send({ mensaje: `Usuario no encontrado` })
			const index = evento.meGustas.indexOf(usuarioId)
			if (index > -1) {
				evento.meGustas.splice(index, 1)
				Evento.findByIdAndUpdate(eventoId, { "meGustas": evento.meGustas }, (err) => {
					if (err) return res.status(500).send({ mensaje: `Error al almacenar en la BD: ${err}` })
					res.status(200).send({ eventoId: evento.id, meGustas: evento.meGustas })
				})
			}
			else {
				evento.meGustas.push(usuarioId)
				Evento.findByIdAndUpdate(eventoId, { "meGustas": evento.meGustas }, (err) => {
					if (err) return res.status(500).send({ mensaje: `Error al almacenar en la BD: ${err}` })
					res.status(200).send({ eventoId: evento.id, meGustas: evento.meGustas })
				})
			}
		})
		
	})
}

function usuarioDidMeGusta (req, res) {
	let usuarioId = req.params.usuarioId
	let eventoId = req.params.eventoId 
	Evento.findById(eventoId, (err, evento) => {
		if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
		if (!evento) return res.status(404).send({ mensaje: `Evento no encontrado` })
		Usuario.findById(usuarioId, (err, usuario) => {
			if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
			if (!usuario) return res.status(404).send({ mensaje: `Usuario no encontrado` })
			const index = evento.meGustas.indexOf(usuarioId)
			if (index > -1) {
				res.status(200).send({ dioMeGusta: true })

			}
			else {
				res.status(200).send({ dioMeGusta: false })
			}
		})
	})
}

function handleAsistencia (req, res) {
	let usuarioId = req.body.usuarioId
	let eventoId = req.params.eventoId 
	Evento.findById(eventoId, (err, evento) => {
		if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
		if (!evento) return res.status(404).send({ mensaje: `Evento no encontrado` })
		Usuario.findById(usuarioId, (err, usuario) => {
			if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
			if (!usuario) return res.status(404).send({ mensaje: `Usuario no encontrado` })
			const index = evento.asistencias.indexOf(usuarioId)
			if (index > -1) {
				evento.asistencias.splice(index, 1)
				Evento.findByIdAndUpdate(eventoId, { "asistencias": evento.asistencias }, (err) => {
					if (err) return res.status(500).send({ mensaje: `Error al almacenar en la BD: ${err}` })
					const index = evento.asistencias.indexOf(usuarioId)
					if (index > -1) {
						usuario.asistenciaEventos.splice(index, 1)
						Usuario.findByIdAndUpdate(usuarioId, { "asistenciaEventos": usuario.asistenciaEventos }, (err) => {})
					}
					res.status(200).send({ eventoId: evento.id, asistencias: evento.asistencias })
				})
			}
			else {
				if (evento.asistencias.length === evento.cupos) {
					return res.status(202).send({ mensaje: `Limite de cupos alcanzado` })
				}
				else {
					evento.asistencias.push(usuarioId)
					Evento.findByIdAndUpdate(eventoId, { "asistencias": evento.asistencias }, (err) => {
						if (err) return res.status(500).send({ mensaje: `Error al almacenar en la BD: ${err}` })
						usuario.asistenciaEventos.push(eventoId)
						Usuario.findByIdAndUpdate(usuarioId, { "asistenciaEventos": usuario.asistenciaEventos }, (err) => {})
						res.status(200).send({ eventoId: evento.id, asistencias: evento.asistencias })
					})
				}
			}
		})
		
	})
}

function usuarioDidAsistencia (req, res) {
	let usuarioId = req.params.usuarioId
	let eventoId = req.params.eventoId
	Evento.findById(eventoId, (err, evento) => {
		if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
		if (!evento) return res.status(404).send({ mensaje: `Evento no encontrado` })
		Usuario.findById(usuarioId, (err, usuario) => {
			if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
			if (!usuario) return res.status(404).send({ mensaje: `Usuario no encontrado` })
			const index = evento.asistencias.indexOf(usuarioId)
			if (index > -1) {
				res.status(200).send({ vaAsistir: true })

			}
			else {
				res.status(200).send({ vaAsistir: false })
			}
		})
	})
}

function createInvitacion (req, res) {
	let eventoId = req.params.eventoId
	Evento.findById(eventoId, (err, evento) => {
		if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
		if (!evento) return res.status(404).send({ mensaje: `Evento no encontrado` })
		let usuarioEnviaId = req.body.usuarioEnviaId
		let usuarioRecibeId = req.body.usuarioRecibeId
		Usuario.findById(usuarioRecibeId, (err, usuarioRecibe) => {
			if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
			if (!usuarioRecibe) return res.status(404).send({ mensaje: `Usuario que recibe no encontrado` })
			Usuario.findById(usuarioEnviaId, (err, usuarioEnvia) => {
				if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
				if (!usuarioEnvia) return res.status(404).send({ mensaje: `Usuario que envia no encontrado` })
				let invitacion = new Invitacion()
				invitacion.usuarioRecibe = usuarioRecibe
				invitacion.usuarioEnvia = usuarioEnvia
				invitacion.evento = evento
				invitacion.save((err, invitacion) => {
					if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
					usuarioRecibe.invitaciones.push(invitacion.id)
					Usuario.findByIdAndUpdate(usuarioRecibeId, { "invitaciones": usuarioRecibe.invitaciones }, (err) => {})
					res.status(200).send({ mensaje: "Invitacion creada satisfactoriamente" })
				})

			})

		})
	})
}

function deleteInvitacion (req, res) {
	let invitacionId = req.params.invitacionId
	Invitacion.findById(invitacionId, (err, invitacion) => {
		if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
		if (!invitacion) return res.status(404).send({ mensaje: `Invitacion no encontrada` })
		let usuarioRecibeId = invitacion.usuarioRecibe
		Usuario.findById(usuarioRecibeId, (err, usuarioRecibe) => {
			if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
			if (!usuarioRecibe) return res.status(404).send({ mensaje: `Usuario que recibe no encontrado` })
			const index = usuarioRecibe.invitaciones.indexOf(invitacion.id)
			if (index > -1) {
				usuarioRecibe.invitaciones.splice(index, 1)
				Usuario.findByIdAndUpdate(usuarioRecibeId, { "invitaciones": usuarioRecibe.invitaciones }, (err) => {
					if (err) return res.status(500).send({ mensaje: `Error al eliminar la invitacion: ${err}` })
				})
			}

			invitacion.remove(err => {
				if (err) return res.status(500).send({ mensaje: `Error al eliminar la invitacion: ${err}` })
				res.status(200).send({ mensaje: `Invitacion eliminada satisfactoriamente` })
			})
		})
	})
}

module.exports = {
	getEventos,
	getEventosByMetaGlobal,
	getEvento,
	getEventosUsuario,
	getAsistenciasUsuario,
	createEvento,
	updateEvento,
	deleteEvento,
	handleMeGusta,
	usuarioDidMeGusta,
	handleAsistencia,
	usuarioDidAsistencia,
	createInvitacion,
	deleteInvitacion
}
