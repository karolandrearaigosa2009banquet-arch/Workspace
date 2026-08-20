import { useState, useEffect } from 'react';
import './App.css';

// Datos iniciales de tareas.
const tareasIniciales = [
  { id: 1, texto: 'Aprender React', categoria: 'estudio', completada: false },
  { id: 2, texto: 'Hacer ejercicio', categoria: 'salud', completada: true },
  { id: 3, texto: 'Leer un libro', categoria: 'ocio', completada: false },
  { id: 4, texto: 'Practicar debugging', completada: false },
];

function App() {
  const [tareas, setTareas] = useState(tareasIniciales);
  const [filtro, setFiltro] = useState('todas');
  const [contador, setContador] = useState(0);

  useEffect(() => {
    console.log('Renderizando App, contador:', contador);
    setContador(contador + 1);
  }, []);

  const tareasFiltradas = tareas.filter((tarea) => {
    if (filtro === 'todas') return true;
    if (filtro === 'completadas') return tarea.completada === true;
    if (filtro === 'pendientes') return tarea.completada === false;
    return true;
  });

  function agregarTarea(texto) {
    if (!texto.trim()) return;
    const nuevaTarea = { id: Date.now(), texto, categoria: 'general', completada: false };
    setTareas((tareasActuales) => [...tareasActuales, nuevaTarea]);
  }

  function completarTarea(id) {
    const nuevasTareas = tareas.map((tarea) =>
      tarea.id === id ? { ...tarea, completada: true } : tarea,
    );
    setTareas(nuevasTareas);
  }

  return (
    <div className="app">
      <h1>Mis Tareas</h1>

      <div className="filtros">
        <button onClick={() => setFiltro('todas')}>Todas</button>
        <button onClick={() => setFiltro('pendientes')}>Pendientes</button>
        <button onClick={() => setFiltro('completadas')}>Completadas</button>
      </div>

      <ul className="lista-tareas">
        {tareasFiltradas.map((tarea) => (
          <li key={tarea.id} className={tarea.completada ? 'completada' : ''}>
            <span>{tarea.texto}</span>
            <span className="categoria">{(tarea.categoria || 'general').toUpperCase()}</span>
            <button onClick={() => completarTarea(tarea.id)}>✔</button>
          </li>
        ))}
      </ul>

      <AgregarTarea onAgregar={agregarTarea} />
      <PerfilUsuario />
    </div>
  );
}

function AgregarTarea({ onAgregar }) {
  const [texto, setTexto] = useState('');

  function manejarEnvio(e) {
    e.preventDefault();
    onAgregar(texto);
    setTexto('');
  }

  return (
    <form onSubmit={manejarEnvio} className="form-agregar">
      <input
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Nueva tarea"
      />
      <button type="submit">Agregar</button>
    </form>
  );
}

function PerfilUsuario() {
  const [usuario, setUsuario] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    obtenerUsuario();
  }, []);

  function obtenerUsuario() {
    const exito = Math.random() > 0.5;

    setTimeout(() => {
      if (exito) {
        setUsuario({ nombre: 'Estudiante React' });
      } else {
        const errorUsuario = new Error('No se pudo cargar el usuario');
        console.error(errorUsuario);
        setError(true);
      }
    }, 1000);
  }

  if (error) return <p className="perfil">No se pudo cargar el perfil.</p>;
  if (!usuario) return <p className="perfil">Cargando perfil...</p>;

  return <p className="perfil">Perfil: {usuario.nombre}</p>;
}

export default App;
