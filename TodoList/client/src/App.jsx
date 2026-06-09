import { useState, useEffect } from "react"

const API = "https://localhost:3000/api/todos"

function App() {
  const [tareas, setTareas] = useState([])
  const [descripcion, setDescripcion] = useState("")
  const [fecha, setFecha] = useState("")
  const [terminado, setTerminado] = useState("")
  const [subiendo, setSubiendo] = useState(false)
  const [descargando, setDescargando] = useState(false)
  const [token, setToken] = useState(() => localStorage.getItem('token') || "")
  const [usuario, setUsuario] = useState("")
  const [contraseña, setContraseña] = useState("")
  const [registrando, setRegistrando] = useState(false)
  const [archivo, setArchivo] = useState(null)
  const [subiendoArchivo, setSubiendoArchivo] = useState(false)
  const [archivos, setArchivos] = useState([])
 
  useEffect(() => {
    if (!token) return
    fetch (API,{
      headers: {authorization: token}
    })
      .then(res => res.json())
      .then(data => setTareas(data))
      fetch('https://localhost:3000/api/archivos', {
        headers: { authorization: token }
    })
    .then(res => res.json())
    .then(data => setArchivos(data))
  }, [token])

  function agregarTarea() {
    if (!descripcion || !fecha || !terminado) {
      alert("Completá todos los campos.")
      return
    }
    fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization: token},
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
    fetch(`${API}/${id}`, { method: "DELETE",
    headers: { authorization: token }
  })
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
      Promise.all(
        datos.map(tarea =>
          fetch(API, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              authorization: token
            },
            body: JSON.stringify(tarea)
          }).then(res => res.json())
        )
      ).then(tareasNuevas => {
        setTareas([...tareas, ...tareasNuevas])
        setSubiendo(false)
        e.target.value = ""
      })
    } catch {
      alert("El archivo no es válido")
      setSubiendo(false)
    }
  }
  reader.readAsText(archivo)
}

  function login(){
    fetch("https://localhost:3000/api/login" ,{
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({usuario, contraseña})
  })
  .then(res => res.json())
  .then(data =>{
    if (data.token){
      setToken(data.token)
      localStorage.setItem('token', data.token)
    }else{
      alert(data.mensaje)
    }
  })
  }

  function registrar() {
  fetch("https://localhost:3000/api/registrar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario, contraseña })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.mensaje)
    setRegistrando(false)
  })
}

function cerrarSesion(){
  localStorage.removeItem('token')
  setToken("")
}

  return (
    <div>
    {!token ? (
  <div>
    <h1>{registrando ? "Registrarse" : "Iniciar sesión"}</h1>
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "300px" }}>
      <input value={usuario} onChange={(e) => setUsuario(e.target.value)} placeholder="Usuario" />
      <input type="password" value={contraseña} onChange={(e) => setContraseña(e.target.value)} placeholder="Contraseña" />
      {registrando ? (
        <>
          <button className="btn-agregar" onClick={registrar}>Registrarse</button>
          <button onClick={() => setRegistrando(false)}>Ya tengo cuenta</button>
        </>
      ) : (
        <>
          <button className="btn-agregar" onClick={login}>Iniciar sesión</button>
          <button onClick={() => setRegistrando(true)}>Crear cuenta</button>
        </>
      )}
    </div>
  </div>
) : (
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
        <div style={{ marginBottom: "16px" }}>
          <input type="file" onChange={(e) => setArchivo(e.target.files[0])} />
          <button className="btn-agregar" onClick={subirArchivo} disabled={subiendoArchivo}>
            {subiendoArchivo ? "Subiendo..." : "Subir archivo"}
            </button>
            </div>
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
      <h2>Archivos subidos</h2>
<ul>
  {archivos.map((archivo) => (
    <li key={archivo.id}>{archivo.nombre}</li>
  ))}
</ul>
    </div>
    )}
    <button className="btn-eliminar" onClick={cerrarSesion}>Cerrar sesión</button>
  </div>
  )
}

export default App