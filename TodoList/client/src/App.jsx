import { useState, useEffect } from "react"

const API = "http://localhost:3000/api/todos"

function App() {
  const [tareas, setTareas] = useState([])
  const [descripcion, setDescripcion] = useState("")
  const [fecha, setFecha] = useState("")
  const [terminado, setTerminado] = useState("")
  const [subiendo, setSubiendo] = useState(false)
  const [descargando, setDescargando] = useState(false)

  useEffect(() => {
    fetch(API)
      .then(res => res.json())
      .then(data => setTareas(data))
  }, [])

  function agregarTarea() {
    if (!descripcion || !fecha || !terminado) {
      alert("Completá todos los campos.")
      return
    }
    fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descripcion, fecha, terminado })
    })
      .then(res => res.json())
      .then(nueva => {
        setTareas([...tareas, nueva])
        setDescripcion("")
        setFecha("")
        setTerminado("")
      })
  }

   function eliminarTarea(id) {
    fetch(`${API}/${id}`, { method: "DELETE" })
      .then(() => setTareas(tareas.filter(t => t.id !== id)))
  }
  
  function descargarTareas() {
    setDescargando(true)
    setTimeout(() => {
      const contenido = JSON.stringify(tareas, null, 2)
      const blob = new Blob([contenido], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "tareas.json"
      a.click()
      URL.revokeObjectURL(url)
      setDescargando(false)
    }, 1200)
  }

  function subirTarea(e) {
    const archivo = e.target.files[0]
    if (!archivo) return
    setSubiendo(true)
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const datos = JSON.parse(ev.target.result)
        setTareas(datos)
      } catch {
        alert("El archivo no es válido")
      }
      setSubiendo(false)
      e.target.value = ""
    }
    reader.readAsText(archivo)
  }

  return (
    <div>
      <h1>Todo-List</h1>

      <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
        <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción" />
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        <input value={terminado} onChange={(e) => setTerminado(e.target.value)} placeholder="Terminado (si / no)" />
        <button className="btn-agregar" onClick={agregarTarea}>Agregar</button>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <button
          className="btn-agregar" onClick={descargarTareas}
          disabled={descargando}
          style={{ cursor: descargando ? "not-allowed" : "pointer", opacity: descargando ? 0.7 : 1 }}
        >
          {descargando ? "Descargando..." : "Descargar tareas"}
        </button>

        <input type="file" accept=".json" onChange={subirTarea} style={{ display: "none" }} id="subir" />
        <button
          className="btn-agregar" onClick={() => document.getElementById("subir").click()}
          disabled={subiendo}
          style={{ cursor: subiendo ? "not-allowed" : "pointer", opacity: subiendo ? 0.7 : 1 }}
        >
          {subiendo ? "Subiendo..." : "Subir tareas"}
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Descripción</th>
            <th>Fecha</th>
            <th>Terminado</th>
            <th>Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {tareas.map((tarea) => (
            <tr key={tarea.id}>
              <td>{tarea.descripcion}</td>
              <td>{tarea.fecha}</td>
              <td>{tarea.terminado}</td>
              <td>
                <button onClick={() => eliminarTarea(tarea.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default App