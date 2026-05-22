document.addEventListener('DOMContentLoaded', cargarTareas);

async function cargarTareas() {
  const res = await fetch('/api/todos');
  const todos = await res.json();
  const tbody = document.getElementById('cuerpoTabla');
  tbody.innerHTML = '';
  todos.forEach(t => renderizarFila(t));
}

async function agregarTarea() {
  const descripcion = document.getElementById('inputDescripcion').value.trim();
  const fecha = document.getElementById('inputFecha').value;
  const terminado = document.getElementById('inputTerminado').value.trim();

  if (!descripcion || !fecha || !terminado) {
    alert('Completá todos los campos.');
    return;
  }

  await fetch('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ descripcion, fecha, terminado })
  });

  document.getElementById('inputDescripcion').value = '';
  document.getElementById('inputFecha').value = '';
  document.getElementById('inputTerminado').value = '';

  cargarTareas();
}

async function eliminarTarea(id, boton) {
  await fetch(`/api/todos/${id}`, { method: 'DELETE' });
  const fila = boton.closest('tr');
  fila.remove();
}

function renderizarFila(tarea) {
  const tbody = document.getElementById('cuerpoTabla');
  const fila = document.createElement('tr');
  fila.innerHTML = `
    <td>${tarea.descripcion}</td>
    <td>${tarea.fecha}</td>
    <td>${tarea.terminado}</td>
    <td><button class="btn-eliminar" onclick="eliminarTarea(${tarea.id}, this)">Eliminar</button></td>
  `;
  tbody.appendChild(fila);
}