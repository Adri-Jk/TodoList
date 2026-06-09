const https = require('https')
const fs = require('fs')
const Database = require('better-sqlite3')
const db = new Database('todolist.db')
const express = require('express');
const app = express();
const cors = require("cors")
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const multer = require('multer')
const path = require('path')
const storage = multer.diskStorage({
  destination:(req, file, cb) =>{
    cb (null, 'uploads/')
  },
  filename:(req, file, cb) =>{
    cb (null, Date.now() + '-' + file.originalname)
  } 
})
const upload = multer({storage})

db.exec(`create table if not exists tareas (
    id integer primary key autoincrement,
    descripcion text not null,
    fecha text not null,
    terminado text not null,
    usuario_id integer not null
  )`)

db.exec(`create table if not exists usuarios (
    id integer primary key autoincrement,
    usuario text not null unique,
    contraseña text not null
  )`)

db.exec(`create table if not exists archivos (
  id integer primary key autoincrement,
  nombre text not null,
  ruta text not null,
  usuario_id integer not null
  )`)

app.use(cors())
app.use(express.json());
app.use(express.static('public'));

const secreto = "clave_secreta" 

function verificarToken (req, res, next){
  const token = req.headers.authorization
  if (!token){
    return res.status(401).json({mensaje: 'No hay token'})
  }
  try{
    const datos = jwt.verify(token, secreto)
    req.usuario = datos
    next ()
  }
  catch{
    return res.status(401).json({mensaje: 'Token invalido'})
  }
}

app.get('/api/todos', verificarToken,(req, res) => {
  const todos = db.prepare('SELECT * FROM tareas where usuario_id = ?').all(req.usuario.id)
  res.json(todos)
})

app.post('/api/todos', verificarToken,(req, res) => {
  const {descripcion, fecha, terminado}= req.body
  const resultado = db.prepare('insert into tareas(descripcion, fecha, terminado, usuario_id)values(?,?,?,?)')
  .run(descripcion, fecha, terminado, req.usuario.id)
  res.json({id:resultado.lastInsertRowid, descripcion, fecha, terminado})
  })

app.delete('/api/todos/:id', verificarToken,(req, res) => {
  db.prepare('delete from tareas where id = ?').run(req.params.id)
  res.json({mensaje:'Tarea eliminada'})
  })

app.post('/api/registrar', async (req, res) => {
  const {usuario, contraseña} = req.body
  const existe = db.prepare('select * from usuarios where usuario = ?').get(usuario)
  if (existe){
    return res.status(400).json({mensaje: 'El usuario ya existe'})
  }
  const hash = await bcrypt.hash(contraseña, 10)
  db.prepare('insert into usuarios(usuario, contraseña) values(?,?)').run(usuario,hash)
  res.json({mensaje: 'Usuario registrado correctamente'})
})

app.post('/api/login', async (req, res) => {
  const {usuario, contraseña} = req.body
  const user = db.prepare('select * from usuarios where usuario = ?').get(usuario)
  if (!user){
    return res.status(400).json({mensaje: 'Usuario no encontrado'})
  }
  const valida = await bcrypt.compare(contraseña, user.contraseña)
  if (!valida){
    return res.status(400).json({mensaje: 'Contraseña incorrecta'})
  }
  const token = jwt.sign({id: user.id, usuario: user.usuario}, secreto)
  res.json({token})
  })

  app.post('/api/upload', verificarToken, upload.single('archivo'),(req, res) =>{
    if (!req.file){
      return res.status(400).json({mensaje:'No se subio ningun archivo'})
    }
    const resultado = db.prepare('insert into archivos (nombre, ruta, usuario_id) values (?, ?, ?)')
    .run(req.file.originalname, req.file.filename, req.usuario.id)
    res.json({
      id: resultado.lastInsertRowid,
      nombre: req.file.originalname,
      ruta: req.file.filename
    })
  })

  app.get('/api/archivos', verificarToken, (req, res) => {
  const archivos = db.prepare('select * from archivos where usuario_id = ?').all(req.usuario.id)
  res.json(archivos)
  })

  const options ={
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
  };
  https.createServer(options, app).listen(3000, () => {
  console.log('Servidor en https://localhost:3000')
})
  