const express = require('express');
const app = express();
const cors = require("cors")
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

app.use(cors())
app.use(express.json());
app.use(express.static('public'));

const secreto = "clave_secreta"
let todos = [];
let usuarios = [] 

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
  res.json(todos);
});

app.post('/api/todos', verificarToken,(req, res) => {
  const tarea = {
    id: Date.now(),
    descripcion: req.body.descripcion,
    fecha: req.body.fecha,
    terminado: req.body.terminado
  };
  todos.push(tarea);
  res.json(tarea);
});

app.delete('/api/todos/:id', verificarToken,(req, res) => {
  todos = todos.filter(t => t.id != req.params.id);
  res.json({ mensaje: 'Tarea eliminada' });
});

app.post('/api/registrar', async (req, res) => {
  const {usuario, contraseña} = req.body
  const existe = usuarios.find(u => u.usuario === usuario)
  if (existe){
    return res.status(400).json({mensaje: 'El usuario ya existe'})
  }
  const hash = await bcrypt.hash(contraseña, 10)
  usuarios.push({id:Date.now(), usuario, contraseña:hash})
  res.json({mensaje: 'Usuario registrado correctamente'})
})

app.post('/api/login', async (req, res) => {
  const {usuario, contraseña} = req.body
  const user = usuarios.find(u => u.usuario === usuario)
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

app.listen(3000, () => console.log('Servidor en http://localhost:3000'));