const express = require('express');
const app = express();
const cors = require("cors")
app.use(cors())

app.use(express.json());
app.use(express.static('public'));

let todos = [];

app.get('/api/todos', (req, res) => {
  res.json(todos);
});

app.post('/api/todos', (req, res) => {
  const tarea = {
    id: Date.now(),
    descripcion: req.body.descripcion,
    fecha: req.body.fecha,
    terminado: req.body.terminado
  };
  todos.push(tarea);
  res.json(tarea);
});

app.delete('/api/todos/:id', (req, res) => {
  todos = todos.filter(t => t.id != req.params.id);
  res.json({ mensaje: 'Tarea eliminada' });
});

app.listen(3000, () => console.log('Servidor en http://localhost:3000'));