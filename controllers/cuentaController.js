'use strict'

const Cuenta = require('../models/cuenta')
const bcrypt = require('bcrypt-nodejs')

function createCuenta (req, res) {
	let cuenta = new Cuenta()
	cuenta.correo = req.body.correo
	cuenta.clave = req.body.clave
	if (req.body.esAdmin) {
		cuenta.esAdmin = req.body.esAdmin		
	}
	cuenta.save((err, cuentaGuardada) => {
		if (err) return res.status(500).send({ mensaje: `Error al almacenar en la BD ${err}` })
		res.status(200).send({ "id": cuentaGuardada.id, "correo": cuentaGuardada.correo })
	})
	
}

function validateCuenta (req, res) {
	let correo = req.body.correo
	Cuenta.findOne({ correo })
	       .populate('usuario')
	       .exec((err, cuenta) => {
	       		console.log(cuenta)
				if (err) return res.status(500).send({ mensaje: `Error al realizar la peticion: ${err}` })
				if (!cuenta) return res.status(403).send({ mensaje: `Acceso no autorizado` })
				if (cuenta.clave === req.body.clave) {
					if (!cuenta.usuario) return res.status(404).send({ cuentaId: cuenta.id, mensaje: `Datos de Usuario no encontrado` })
					res.status(200).send({ "cuentaId": cuenta.id, "usuarioId": cuenta.usuario.id })		
				}
				else
					return res.status(403).send({ mensaje: `Acceso no autorizado` })
			})
}

function updateClave (req, res) {
	let cuentaId = req.params.cuentaId
	let actualizacion = { "clave": req.body.clave }
	
	Cuenta.findByIdAndUpdate(cuentaId, actualizacion, (err, cuentaActualizada) => {
		if (err) res.status(500).send({ mensaje: `Error al actualizar la cuenta: ${err}` })
		res.status(200).send({ cuentaId: cuentaActualizada.id, 
							   correo: cuentaActualizada.correo,
							   usuario: cuentaActualizada.usuario
							})
	})
}

function deleteCuenta (req, res) {
	let cuentaId = req.params.cuentaId
	Cuenta.findById(cuentaId, (err, cuenta) => {
		if (err) return res.status(500).send({ mensaje: `Error al eliminar el cuenta: ${err}` })
		if (!cuenta) return res.status(404).send({ mensaje: `Cuenta no encontrada` })

		cuenta.remove(err => {
			if (err) return res.status(500).send({ mensaje: `Error al eliminar el cuenta: ${err}` })
			return res.status(200).send({ mensaje: `Cuenta eliminado satisfactoriamente` })
		})

	})
}

module.exports = {
	validateCuenta,
	createCuenta,
	updateClave,
	deleteCuenta
}

