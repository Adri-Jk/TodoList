const STORAGE_KEY = 'todoList';
document.addEventListener('DOMContentLoaded', () => {
  const tareas = obtenerTareas();
  tareas.forEach((tarea) => renderizarFila(tarea));
});
function obtenerTareas() {
  const datos = localStorage.getItem(STORAGE_KEY);
  return datos ? JSON.parse(datos) : [];
}
function guardarTareas(tareas) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tareas));
}
const tareas = obtenerTareas();
  tareas.push(tarea);
  guardarTareas(tareas);
function eliminarFila(id, boton) {
  const fila = boton.closest('tr');
  fila.remove();
  const tareas = obtenerTareas().filter((t) => t.id !== id);
  guardarTareas(tareas);
}
function agregarFila() {
  const descripcion = document.getElementById("inputDescripcion").value.trim();
  const fecha = document.getElementById("inputFecha").value;
  const terminado = document.getElementById("inputTerminado").value.trim();

  if (!descripcion || !fecha || !terminado) {
    alert("Completá todos los campos.");
    return;
  }

  const tbody = document.getElementById("cuerpoTabla");
  const fila = document.createElement("tr");

  fila.innerHTML = `
    <td>${descripcion}</td>
    <td>${fecha}</td>
    <td>${terminado}</td>
    <td><button class="btn-eliminar" onclick="eliminarFila(this)">Eliminar</button></td>
  `;

  tbody.appendChild(fila);
  

  document.getElementById("inputDescripcion").value = "";
  document.getElementById("inputFecha").value = "";
  document.getElementById("inputTerminado").value = "";
}

function eliminarFila(boton) {
  const fila = boton.closest("tr");
  fila.remove();
}
