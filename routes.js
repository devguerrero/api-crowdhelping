'use strict'

const express = require('express')
const api = express.Router()

const cuentaController = require('./controllers/cuentaController')
const usuarioController = require('./controllers/usuarioController')
const eventoController = require('./controllers/eventoController')
const metaGlobalController = require('./controllers/metaGlobalController')
const publicacionController = require('./controllers/publicacionController')
const comentarioController = require('./controllers/comentarioController')

// EndPoint de bienvenida
api.get('/', (req, res) => {
	res.send({ mensaje: 'Bienvenido a la API CrowdHelping' })
})

// Autenticacion EndPoints
api.post('/login', cuentaController.validateCuenta)
api.post('/cuentas', cuentaController.createCuenta)
api.patch('/cuentas/:cuentaId', cuentaController.updateClave)
api.delete('/cuentas/:cuentaId', cuentaController.deleteCuenta)


// Usuarios Query por Nombre
api.get('/usuarios/buscar', usuarioController.getUsuariosByNombre)
api.get('/usuarios/:usuarioId/invitaciones', usuarioController.getUsuarioInvitaciones)
// Usuario EndPoints
api.get('/usuarios', usuarioController.getUsuarios)
api.post('/cuentas/:cuentaId/usuarios', usuarioController.createUsuario)
api.get('/usuarios/:usuarioId', usuarioController.getUsuario)
api.patch('/usuarios/:usuarioId', usuarioController.updateUsuario)
api.delete('/usuarios/:usuarioId', usuarioController.deleteUsuario)
// EndPoints para Seguir Usuario
api.post('/usuarios/:usuarioId/seguir', usuarioController.seguirUsuario)
api.get('/usuarios/:usuarioId/seguir/:seguidorId', usuarioController.esSeguidor)
// Usuario Avatar EndPoints
api.post('/usuarios/:usuarioId/avatar', usuarioController.updateAvatar)
api.delete('/usuarios/:usuarioId/avatar', usuarioController.deleteAvatar)
// Usuarios Query por nombre


// Eventos Query por meta global
api.post('/eventos/buscar', eventoController.getEventosByMetaGlobal)
// Evento EndPoints
api.get('/eventos', eventoController.getEventos)
api.get('/eventos/:eventoId', eventoController.getEvento)
api.get('/usuarios/:usuarioId/eventos', eventoController.getEventosUsuario)
api.get('/usuarios/:usuarioId/asistencias', eventoController.getAsistenciasUsuario)
api.post('/usuarios/:usuarioId/eventos', eventoController.createEvento)
api.patch('/eventos/:eventoId', eventoController.updateEvento)
api.delete('/eventos/:eventoId', eventoController.deleteEvento)
// EndPoints para Asistencia de Eventos
api.post('/eventos/:eventoId/asistencias', eventoController.handleAsistencia)
api.get('/eventos/:eventoId/asistencias/:usuarioId', eventoController.usuarioDidAsistencia)
// EndPoints para Me gustas de Eventos
api.post('/eventos/:eventoId/megusta', eventoController.handleMeGusta)
api.get('/eventos/:eventoId/megusta/:usuarioId', eventoController.usuarioDidMeGusta)
// EndPoint para Invitaciones a Eventos
api.post('/eventos/:eventoId/invitaciones', eventoController.createInvitacion)
api.delete('/invitaciones/:invitacionId', eventoController.deleteInvitacion)


// Publicacion EndPoints
api.get('/eventos/:eventoId/publicaciones', publicacionController.getPublicaciones)
api.post('/eventos/:eventoId/publicaciones', publicacionController.createPublicacion)
api.get('/eventos/:eventoId/publicaciones/:publicacionId', publicacionController.getPublicacion)
api.patch('/eventos/:eventoId/publicaciones/:publicacionId', publicacionController.updatePublicacion)
api.delete('/eventos/:eventoId/publicaciones/:publicacionId', publicacionController.deletePublicacion)
// EndoPoints para Me gustas de Publicaciones
api.post('/publicaciones/:publicacionId/megusta', publicacionController.handleMeGusta)
api.get('/publicaciones/:publicacionId/megusta/:usuarioId', publicacionController.usuarioDidMeGusta)

// Comentario EndPoints
api.get('/publicaciones/:publicacionId/comentarios', comentarioController.getComentarios)
api.post('/publicaciones/:publicacionId/comentarios', comentarioController.createComentario)
api.patch('/publicaciones/:publicacionId/comentarios/:comentarioId', comentarioController.updateComentario)
api.delete('/publicaciones/:publicacionId/comentarios/:comentarioId', comentarioController.deleteComentario)


// Meta Global EndPoints
api.get('/metasGlobales', metaGlobalController.getMetasGlobales)
api.post('/metasGlobales', metaGlobalController.createMetaGlobal)
api.get('/metasGlobales/:metaGlobalId', metaGlobalController.getMetaGlobal)
api.patch('/metasGlobales/:metaGlobalId', metaGlobalController.updateMetaGlobal)
api.delete('/metasGlobales/:metaGlobalId', metaGlobalController.deleteMetaGlobal)

module.exports = api