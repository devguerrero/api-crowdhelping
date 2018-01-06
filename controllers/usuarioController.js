'use strict'

const Usuario = require('../models/usuario')
const Cuenta = require('../models/cuenta')
const cloudinary = require('../cloudinary')

function createUsuario (req, res) {
	let cuentaId = req.params.cuentaId
	Cuenta.findById(cuentaId, (err, cuenta) => {
		if (err) return res.status(500).send({ mensaje: `Error al almacenar en la BD: ${err}` })
		if(!cuenta) return res.status(404).send({ mensaje: `Cuenta no encontrada` })

		let usuario = new Usuario()
		usuario.nombreCompleto = req.body.nombreCompleto
		usuario.genero = req.body.genero
		try {
			usuario.fechaNacimiento = req.body.fechaNacimiento
		} catch (err) {
			return res.status(500).send({ mensaje: `Error al almacenar en la BD ${err}` })
		}
		usuario.lugarNacimiento = req.body.lugarNacimiento
		usuario.residencia = req.body.residencia
		usuario.telefono = req.body.telefono
		usuario.correo = req.body.correo
		if (req.files.avatar) {
			const avatar = req.files.avatar
			cloudinary.uploader.upload(avatar.path, (result) => { 
				if (result.error) return res.status(500).send({ mensaje: `Error al registrar el avatar: ${result.error.message || result.error}` })
				usuario.avatarURL = result.url
				usuario.avatarNombre = result.public_id
				usuario.save((err, usuarioGuardado) => {
					if (err) return res.status(500).send({ mensaje: `Error al almacenar en la BD ${err}` })					
					Cuenta.findByIdAndUpdate(cuentaId, { "usuario": usuarioGuardado.id }, (err) => {})
					res.status(200).send(usuarioGuardado)	
				})
			})
		} 
		else {
			usuario.save((err, usuarioGuardado) => {
				Cuenta.findByIdAndUpdate(cuentaId, { "usuario": usuarioGuardado.id }, (err) => {})
				if (err) return res.status(500).send({ mensaje: `Error al almacenar en la BD ${err}` })					
				res.status(200).send(usuarioGuardado)
			})
		}
	})

}

function getUsuario (req, res) {
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
	       .populate({
	       		path: 'asistenciaEventos',
	       		model: 'Evento',
	       		populate: {
	       			path: 'metaGlobal',
	       			model: 'MetaGlobal'
	       		},
	       		populate: {
	       			path: 'creador',
	       			model: 'Usuario'
	       		}
	       })
	       .populate('seguidos')
	       .populate('seguidores')
	       .exec((err, usuario) => {
				if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
				if (!usuario) return res.status(404).send({ mensaje: `Usuario no encontrado` })
				res.status(200).send(usuario)
			})

}

function getUsuarioInvitaciones (req, res) {
	let usuarioId = req.params.usuarioId
	Usuario.findById(usuarioId)
	       .populate('invitaciones')
	       ({
	       		path: 'invitaciones',
	       		model: 'Invitacion',
	       		populate: {
	       			path: 'evento',
	       			model: 'Evento'
	       		},
	       		populate: {
	       			path: 'usuarioEnvia',
	       			model: 'Usuario'
	       		}
	       })
	       .exec((err, usuario) => {
				if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
				if (!usuario) return res.status(404).send({ mensaje: `Usuario no encontrado` })
				console.log(usuario)
				res.status(200).send(usuario.invitaciones)
			})

}

function getUsuarios (req, res) {
	Usuario.find({ }, (err, usuarios) => {
		if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
		if (!usuarios) return res.status(404).send({ mensaje: `Usuario no encontrado` })
		res.status(200).send( usuarios )
	})
}

function getUsuariosByNombre (req, res) {
	if (!req.query.nombre) return res.status(400).send({ mensaje: "Mala Peticion" })
	const nombre = req.query.nombre
	const re = RegExp(nombre, "i")
	Usuario.find({ nombreCompleto: { $regex: re } }, (err, usuarios) => {
		if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
		if (!usuarios) return res.status(404).send({ mensaje: `Usuarios no encontrados` })
		res.status(200).send(usuarios)
	})
}

function getEventosUsuariosSeguidos (req, res) {

}

function updateUsuario (req, res) {
	let usuarioId = req.params.usuarioId
	let actualizacion = req.body
	
	Usuario.findByIdAndUpdate(usuarioId, actualizacion, (err, usuarioActualizado) => {
		if (err) return res.status(500).send({ mensaje: `Error al actualizar el usuario: ${err}` })
		Usuario.findById(usuarioId, (err, usuario) => {
			if (err) return res.status(500).send({ mensaje: `Error al obtener el usuario de la BD: ${err}` })
			res.status(200).send(usuario)
		})
	})
}

function deleteUsuario (req, res) {
	let usuarioId = req.params.usuarioId
	Usuario.findById(usuarioId, (err, usuario) => {
		if (err) return res.status(500).send({ mensaje: `Error al eliminar el usuario: ${err}` })
		if (!usuario) return res.status(404).send({ mensaje: `Usuario no encontrado` })
		if (!usuario.avatarNombre) {
			usuario.remove(err => {
				if (err) return res.status(500).send({ mensaje: `Error al eliminar el usuario: ${err}` })
				return res.status(200).send({ mensaje: `Usuario eliminado satisfactoriamente` })
			})
		} 
		else {
			cloudinary.uploader.destroy(usuario.avatarNombre, (err) => {
				if (err.result === 'ok' || err.result === 'not found') {
					usuario.remove(err => {
						if (err) return res.status(500).send({ mensaje: `Error al eliminar el usuario: ${err}` })
						return res.status(200).send({ mensaje: `Usuario eliminado satisfactoriamente` })
					})
				}
				else 
					return res.status(500).send({ mensaje: `Error al eliminar el avatar: ${err.error.message || err.error}`})
			})
		}


	})
}

function updateAvatar(req, res) {

	let usuarioId = req.params.usuarioId
	Usuario.findById(usuarioId, (err, usuario) => {
		if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
		if (!usuario) return res.status(404).send({ mensaje: `Usuario no encontrado` })
	
		if (req.files.avatar) {
				const avatar = req.files.avatar
				cloudinary.uploader.upload(avatar.path, (result) => {
					console.log(result) 
					if(result.error) return res.status(500).send({ mensaje: `Error al actualizar el avatar: ${result.error.message || result.error}` })
					const actualizacion = {
						"avatarURL": result.url,
						"avatarNombre": result.public_id	
					}
					Usuario.findByIdAndUpdate(usuarioId, actualizacion, (err) => {
						if (err) return res.status(500).send({ mensaje: `Error al actualizar el usuario: ${err}` })
						cloudinary.uploader.destroy(usuario.avatarNombre, (err) => {})
						res.status(200).send(actualizacion)
					})

				})

			
		} 
		else 
			return res.status(400).send({ mensaje: `Mala peticion` })
	})
}

function deleteAvatar(req, res) {
	let usuarioId = req.params.usuarioId
	Usuario.findById(usuarioId, (err, usuario) => {
		if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
		if (!usuario) return res.status(404).send({ mensaje: `Usuario no encontrado` })

		cloudinary.uploader.destroy(usuario.avatarNombre, (err) => {
			if (err) return res.status(500).send({ mensaje: `Error al eliminar el avatar: ${err.error.message || err.error}` })
			const actualizacion = {
				"avatarURL": "",
				"avatarNombre": ""	
			}
			Usuario.findByIdAndUpdate(usuarioId, actualizacion, (err) => {
				if (err) return res.status(500).send({ mensaje: `Error al actualizar el usuario: ${err}` })
				res.status(200).send( actualizacion )
			})
		})
	})
}

function seguirUsuario (req, res) {
	let usuarioId = req.params.usuarioId
	let seguidorId = req.body.seguidorId
	console.log(req.body.seguidorId)
	Usuario.findById(usuarioId, (err, usuario) => {
		if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
		if (!usuario) return res.status(404).send({ mensaje: `Usuario no encontrado` })
		Usuario.findById(seguidorId, (err, seguidor) => {
			if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
			if (!seguidor) return res.status(404).send({ mensaje: `Usuario seguidor no encontrado` })
			const index = usuario.seguidores.indexOf(seguidorId)
			if (index > -1) {
				usuario.seguidores.splice(index, 1)
				Usuario.findByIdAndUpdate(usuarioId, { "seguidores": usuario.seguidores }, (err) => {
					if (err) return res.status(500).send({ mensaje: `Error al almacenar en la BD: ${err}` })
					const index = seguidor.seguidos.indexOf(usuarioId)
					if (index > -1) {
						seguidor.seguidos.splice(index, 1)
						Usuario.findByIdAndUpdate(seguidorId, { "seguidos": seguidor.seguidos }, (err) => {})
					}
					res.status(200).send({ "usuarioId": usuario.id, "seguidores": usuario.seguidores })
				})
			}
			else {
				usuario.seguidores.push(seguidorId)
				Usuario.findByIdAndUpdate(usuarioId, { "seguidores": usuario.seguidores }, (err) => {
					if (err) return res.status(500).send({ mensaje: `Error al almacenar en la BD: ${err}` })
					seguidor.seguidos.push(usuarioId)
					Usuario.findByIdAndUpdate(seguidorId, { "seguidos": seguidor.seguidos }, (err) => {})
					res.status(200).send({ "usuarioId": usuario.id, "seguidores": usuario.seguidores })
				})
			}
		})
		
	})
}

function esSeguidor (req, res) {
	let usuarioId = req.params.usuarioId
	let seguidorId = req.params.seguidorId
	Usuario.findById(usuarioId, (err, usuario) => {
		if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
		if (!usuario) return res.status(404).send({ mensaje: `Usuario no encontrado` })
		
		const index = usuario.seguidores.indexOf(seguidorId)
		if (index > -1) {
			res.status(200).send({ esSeguidor: true })

		}
		else {
			res.status(200).send({ esSeguidor: false })
		}
	})
}

module.exports = {
	createUsuario,
	getUsuario,
	getUsuarios,
	updateUsuario,
	deleteUsuario,
	updateAvatar,
	deleteAvatar,
	seguirUsuario,
	esSeguidor,
	getUsuariosByNombre,
	getUsuarioInvitaciones
}

