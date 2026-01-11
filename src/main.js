const API_URL = "https://sistema-academico-api-8p4j.onrender.com";

// --- ESTADO GLOBAL ---
let usuariosLista = [];
let materiasLista = [];
let estudiantesLista = [];
let notasLista = [];
let usuarioLogueado = null;

// --- INSTANCIAS DE MODALES BOOTSTRAP ---
const modalUsuarioBS = new bootstrap.Modal(document.getElementById('modalUsuario'));
const modalMateriaBS = new bootstrap.Modal(document.getElementById('modalMateria'));
const modalEstudianteBS = new bootstrap.Modal(document.getElementById('modalEstudiante'));
const modalNotaBS = new bootstrap.Modal(document.getElementById('modalNota'));
const modalPerfilBS = new bootstrap.Modal(document.getElementById('modalPerfil'));

document.addEventListener("DOMContentLoaded", () => {
  const guardado = localStorage.getItem("usuarios");
  if (guardado) iniciarSesion(JSON.parse(guardado));
});

// --- AUTENTICACIÓN ---
document.getElementById("formLogin").addEventListener("submit", async (e) => {
  e.preventDefault();
  const cedula = document.getElementById("loginCedula").value;
  const clave = document.getElementById("loginClave").value;

  try {
    console.log("Intentando login con:", { cedula, API_URL });
    
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cedula, clave })
    });
    
    console.log("Respuesta del servidor:", res.status);
    const data = await res.json();
    console.log("Datos recibidos:", data);
    
    if (res.ok) {
      localStorage.setItem("usuarios", JSON.stringify(data.usuario));
      iniciarSesion(data.usuario);
    } else {
      document.getElementById("loginError").textContent = data.msg;
    }
  } catch (error) {
    console.error("Error en login:", error);
    document.getElementById("loginError").textContent = "Error de conexión con el servidor. Verifica la URL del API.";
  }
});

function iniciarSesion(usuario) {
  usuarioLogueado = usuario;
  document.getElementById("vistaLogin").classList.add("d-none");
  document.getElementById("vistaDashboard").classList.remove("d-none");
  document.getElementById("userNombreDisplay").textContent = usuario.nombre;
  mostrarSeccion('usuarios');
}

// --- NAVEGACIÓN ---
window.mostrarSeccion = (seccion) => {
  const secciones = ['usuarios', 'materias', 'estudiantes', 'notas'];
  
  secciones.forEach(s => {
    const el = document.getElementById(`seccion${s.charAt(0).toUpperCase() + s.slice(1)}`);
    const link = document.getElementById(`link${s.charAt(0).toUpperCase() + s.slice(1)}`);
    if (el) el.classList.toggle("d-none", seccion !== s);
    if (link) link.classList.toggle("active", seccion === s);
  });

  if (seccion === 'usuarios') cargarUsuarios();
  if (seccion === 'materias') cargarMaterias();
  if (seccion === 'estudiantes') cargarEstudiantes();
  if (seccion === 'notas') cargarNotas();
};

// =====================
// LÓGICA DE USUARIOS
// =====================
async function cargarUsuarios() {
  try {
    const res = await fetch(`${API_URL}/usuarios`);
    usuariosLista = await res.json();
    renderizarUsuarios(usuariosLista);
  } catch (error) {
    console.error("Error cargando usuarios:", error);
  }
}

function renderizarUsuarios(lista) {
  const tabla = document.getElementById("tablaUsuarios");
  tabla.innerHTML = lista.map(u => `
    <tr>
      <td>${u.id}</td>
      <td>${u.cedula}</td>
      <td>${u.nombre}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="prepararEditar(${u.id})"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-danger" onclick="eliminarUsuario(${u.id})"><i class="bi bi-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

window.prepararCrear = () => {
  document.getElementById("formUsuario").reset();
  document.getElementById("userId").value = "";
  document.getElementById("modalTitulo").textContent = "Nuevo Usuario";
};

window.prepararEditar = async (id) => {
  try {
    const res = await fetch(`${API_URL}/usuarios/${id}`);
    const usuario = await res.json();
    
    document.getElementById("userId").value = usuario.id;
    document.getElementById("userCedula").value = usuario.cedula;
    document.getElementById("userNombre").value = usuario.nombre;
    document.getElementById("userClave").value = "";
    document.getElementById("modalTitulo").textContent = "Editar Usuario";
    
    modalUsuarioBS.show();
  } catch (error) {
    console.error("Error preparando edición:", error);
  }
};

document.getElementById("formUsuario").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const id = document.getElementById("userId").value;
  const datos = {
    cedula: document.getElementById("userCedula").value,
    nombre: document.getElementById("userNombre").value,
    clave: document.getElementById("userClave").value
  };

  try {
    const url = id ? `${API_URL}/usuarios/${id}` : `${API_URL}/usuarios`;
    const method = id ? "PUT" : "POST";
    
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });

    if (res.ok) {
      modalUsuarioBS.hide();
      cargarUsuarios();
    } else {
      const error = await res.json();
      alert(`Error: ${error.msg || error.error}`);
    }
  } catch (error) {
    console.error("Error guardando usuario:", error);
    alert("Error de conexión con el servidor");
  }
});

window.eliminarUsuario = async (id) => {
  if (!confirm("¿Está seguro de eliminar este usuario?")) return;
  
  try {
    await fetch(`${API_URL}/usuarios/${id}`, { method: "DELETE" });
    cargarUsuarios();
  } catch (error) {
    console.error("Error eliminando usuario:", error);
  }
};

// =====================
// LÓGICA DE MATERIAS
// =====================
async function cargarMaterias() {
  try {
    const res = await fetch(`${API_URL}/materias`);
    materiasLista = await res.json();
    renderizarMaterias(materiasLista);
  } catch (error) {
    console.error("Error cargando materias:", error);
  }
}

function renderizarMaterias(lista) {
  const tabla = document.getElementById("tablaMaterias");
  tabla.innerHTML = lista.map(m => `
    <tr>
      <td>${m.id_materia}</td>
      <td>${m.nombre_materia}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="prepararEditarMateria(${m.id_materia})"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-danger" onclick="eliminarMateria(${m.id_materia})"><i class="bi bi-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

window.prepararCrearMateria = () => {
  document.getElementById("formMateria").reset();
  document.getElementById("materiaId").value = "";
  document.getElementById("modalMateriaTitulo").textContent = "Nueva Materia";
};

window.prepararEditarMateria = async (id) => {
  try {
    const res = await fetch(`${API_URL}/materias/${id}`);
    const materia = await res.json();
    
    document.getElementById("materiaId").value = materia.id_materia;
    document.getElementById("materiaNombre").value = materia.nombre_materia;
    document.getElementById("modalMateriaTitulo").textContent = "Editar Materia";
    
    modalMateriaBS.show();
  } catch (error) {
    console.error("Error preparando edición:", error);
  }
};

document.getElementById("formMateria").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const id = document.getElementById("materiaId").value;
  const datos = {
    nombre_materia: document.getElementById("materiaNombre").value
  };

  try {
    const url = id ? `${API_URL}/materias/${id}` : `${API_URL}/materias`;
    const method = id ? "PUT" : "POST";
    
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });

    if (res.ok) {
      modalMateriaBS.hide();
      cargarMaterias();
    } else {
      const error = await res.json();
      alert(`Error: ${error.msg || error.error}`);
    }
  } catch (error) {
    console.error("Error guardando materia:", error);
    alert("Error de conexión con el servidor");
  }
});

window.eliminarMateria = async (id) => {
  if (!confirm("¿Está seguro de eliminar esta materia?")) return;
  
  try {
    await fetch(`${API_URL}/materias/${id}`, { method: "DELETE" });
    cargarMaterias();
  } catch (error) {
    console.error("Error eliminando materia:", error);
  }
};

// =====================
// LÓGICA DE ESTUDIANTES
// =====================
async function cargarEstudiantes() {
  try {
    const res = await fetch(`${API_URL}/estudiantes`);
    estudiantesLista = await res.json();
    renderizarEstudiantes(estudiantesLista);
  } catch (error) {
    console.error("Error cargando estudiantes:", error);
  }
}

function renderizarEstudiantes(lista) {
  const tabla = document.getElementById("tablaEstudiantes");
  tabla.innerHTML = lista.map(e => `
    <tr>
      <td>${e.id}</td>
      <td>${e.cedula}</td>
      <td>${e.nombre}</td>
      <td>${e.correo || 'N/A'}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="prepararEditarEstudiante(${e.id})"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-danger" onclick="eliminarEstudiante(${e.id})"><i class="bi bi-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

window.prepararCrearEstudiante = () => {
  document.getElementById("formEstudiante").reset();
  document.getElementById("estudianteId").value = "";
};

window.prepararEditarEstudiante = async (id) => {
  try {
    const estudiante = estudiantesLista.find(e => e.id === id);
    if (estudiante) {
      document.getElementById("estudianteId").value = estudiante.id;
      document.getElementById("estudianteCedula").value = estudiante.cedula;
      document.getElementById("estudianteNombre").value = estudiante.nombre;
      document.getElementById("estudianteCorreo").value = estudiante.correo || "";
      modalEstudianteBS.show();
    }
  } catch (error) {
    console.error("Error preparando edición:", error);
  }
};

document.getElementById("formEstudiante").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const id = document.getElementById("estudianteId").value;
  const datos = {
    cedula: document.getElementById("estudianteCedula").value,
    nombre: document.getElementById("estudianteNombre").value,
    correo: document.getElementById("estudianteCorreo").value
  };

  try {
    const url = id ? `${API_URL}/estudiantes/${id}` : `${API_URL}/estudiantes`;
    const method = id ? "PUT" : "POST";
    
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });

    if (res.ok) {
      modalEstudianteBS.hide();
      cargarEstudiantes();
    } else {
      const error = await res.json();
      alert(`Error: ${error.msg || error.error}`);
    }
  } catch (error) {
    console.error("Error guardando estudiante:", error);
    alert("Error de conexión con el servidor");
  }
});

window.eliminarEstudiante = async (id) => {
  if (!confirm("¿Está seguro de eliminar este estudiante?")) return;
  
  try {
    await fetch(`${API_URL}/estudiantes/${id}`, { method: "DELETE" });
    cargarEstudiantes();
  } catch (error) {
    console.error("Error eliminando estudiante:", error);
  }
};

// =====================
// LÓGICA DE NOTAS
// =====================
async function cargarNotas() {
  try {
    const res = await fetch(`${API_URL}/notas`);
    notasLista = await res.json();
    renderizarNotas(notasLista);
  } catch (error) {
    console.error("Error cargando notas:", error);
  }
}

function renderizarNotas(lista) {
  const tabla = document.getElementById("tablaNotas");
  tabla.innerHTML = lista.map(n => `
    <tr>
      <td>${n.id_nota}</td>
      <td>${n.nombre_estudiante}</td>
      <td>${n.nombre_materia}</td>
      <td><span class="badge ${n.calificacion >= 7 ? 'bg-success' : 'bg-danger'}">${n.calificacion}</span></td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="eliminarNota(${n.id_nota})"><i class="bi bi-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

window.prepararCrearNota = async () => {
  document.getElementById("formNota").reset();
  
  try {
    // Cargar Estudiantes en el Select
    const resEst = await fetch(`${API_URL}/estudiantes`);
    const ests = await resEst.json();
    const selectEst = document.getElementById("selectEstudiante");
    selectEst.innerHTML = '<option value="">Seleccione Estudiante...</option>' + 
      ests.map(e => `<option value="${e.id}">${e.nombre} (${e.cedula})</option>`).join('');

    // Cargar Materias en el Select
    const resMat = await fetch(`${API_URL}/materias`);
    const mats = await resMat.json();
    const selectMat = document.getElementById("selectMateria");
    selectMat.innerHTML = '<option value="">Seleccione Materia...</option>' + 
      mats.map(m => `<option value="${m.id_materia}">${m.nombre_materia}</option>`).join('');
  } catch (error) {
    console.error("Error cargando datos para nota:", error);
  }
};

document.getElementById("formNota").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const datos = {
    id_estudiante: document.getElementById("selectEstudiante").value,
    id_materia: document.getElementById("selectMateria").value,
    calificacion: parseFloat(document.getElementById("notaValor").value)
  };

  try {
    const res = await fetch(`${API_URL}/notas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });

    if (res.ok) {
      modalNotaBS.hide();
      cargarNotas();
    } else {
      const error = await res.json();
      alert(`Error: ${error.msg || error.error}`);
    }
  } catch (error) {
    console.error("Error guardando nota:", error);
    alert("Error de conexión con el servidor");
  }
});

window.eliminarNota = async (id) => {
  if (!confirm("¿Está seguro de eliminar esta nota?")) return;
  
  try {
    await fetch(`${API_URL}/notas/${id}`, { method: "DELETE" });
    cargarNotas();
  } catch (error) {
    console.error("Error eliminando nota:", error);
  }
};

// --- BUSCADORES ---
document.getElementById("inputBuscar")?.addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase();
  renderizarUsuarios(usuariosLista.filter(u => 
    u.nombre.toLowerCase().includes(term) || u.cedula.includes(term)
  ));
});

document.getElementById("inputBuscarMateria")?.addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase();
  renderizarMaterias(materiasLista.filter(m => 
    m.nombre_materia.toLowerCase().includes(term)
  ));
});

document.getElementById("inputBuscarEstudiante")?.addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase();
  renderizarEstudiantes(estudiantesLista.filter(est => 
    est.nombre.toLowerCase().includes(term) || est.cedula.includes(term)
  ));
});

document.getElementById("inputBuscarNota")?.addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase();
  renderizarNotas(notasLista.filter(n => 
    n.nombre_estudiante.toLowerCase().includes(term)
  ));
});

// --- ACCIONES DE CIERRE ---
document.getElementById("btnSalir").onclick = () => { 
  localStorage.clear(); 
  location.reload(); 
};

document.getElementById("btnPerfil").onclick = () => {
  document.getElementById("perfilNombre").textContent = usuarioLogueado.nombre;
  document.getElementById("perfilCedula").textContent = usuarioLogueado.cedula;
  modalPerfilBS.show();
};

// Botón de Configuración
document.getElementById("btnConfig").addEventListener("click", () => {
  document.body.classList.toggle("bg-dark");
  document.body.classList.toggle("text-white");
  alert("Cambiando tema visual...");
});
