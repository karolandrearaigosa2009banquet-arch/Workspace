import { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
  const [mostrarReloj, setMostrarReloj] = useState(true);
  const [usuarioId, setUsuarioId] = useState(1);

  return (
    <main className="app">
      <header className="encabezado">
        <p className="etiqueta">Taller de React</p>
        <h1>useEffect y ciclo de vida</h1>
        <p>Observa montaje, actualización y desmontaje desde la consola.</p>
      </header>

      <section>
        <h2>1. Reloj y cleanup</h2>
        <button onClick={() => setMostrarReloj((visible) => !visible)}>
          {mostrarReloj ? 'Ocultar reloj' : 'Mostrar reloj'}
        </button>
        {mostrarReloj && <Reloj />}
      </section>

      <section>
        <h2>2. Contador automático</h2>
        <ContadorAutomatico />
      </section>

      <section>
        <h2>3. Ancho de ventana</h2>
        <RastreadorVentana />
      </section>

      <section>
        <h2>4. Perfil de usuario</h2>
        <div className="botones-usuario">
          <button onClick={() => setUsuarioId(1)}>Usuario 1</button>
          <button onClick={() => setUsuarioId(2)}>Usuario 2</button>
        </div>
        <PerfilUsuario id={usuarioId} />
      </section>

      <section>
        <h2>5. Experimento: fases del ciclo de vida</h2>
        <ExperimentoFases />
      </section>
    </main>
  );
}

function Reloj() {
  const [segundos, setSegundos] = useState(0);

  useEffect(() => {
    console.log('Reloj montado');
    const id = setInterval(() => {
      setSegundos((valorActual) => {
        const siguienteValor = valorActual + 1;
        console.log('tick, segundos:', siguienteValor);
        return siguienteValor;
      });
    }, 1000);

    return () => {
      clearInterval(id);
      console.log('Reloj desmontado: intervalo limpiado');
    };
  }, []);

  return <p>Segundos: {segundos}</p>;
}

function ContadorAutomatico() {
  const [contador, setContador] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setContador((valorActual) => {
        const siguienteValor = valorActual + 1;
        console.log('Contador actualizado:', siguienteValor);
        return siguienteValor;
      });
    }, 1000);

    return () => clearInterval(id);
  }, []);

  return <p>Contador: {contador}</p>;
}

function RastreadorVentana() {
  const [ancho, setAncho] = useState(window.innerWidth);

  useEffect(() => {
    function manejarResize() {
      const nuevoAncho = window.innerWidth;
      console.log('Resize detectado, ancho:', nuevoAncho);
      setAncho(nuevoAncho);
    }

    window.addEventListener('resize', manejarResize);
    return () => {
      window.removeEventListener('resize', manejarResize);
      console.log('Listener de resize eliminado');
    };
  }, []);

  return <p>Ancho actual: {ancho}px</p>;
}

function PerfilUsuario({ id }) {
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    console.log('Buscando datos del usuario:', id);
    const nombres = { 1: 'Ana', 2: 'Luis' };
    setNombre(nombres[id]);
  }, [id]);

  return <p>Nombre: {nombre}</p>;
}

function ExperimentoFases() {
  const [clics, setClics] = useState(0);
  const esPrimeraVez = useRef(true);

  useEffect(() => {
    if (esPrimeraVez.current) {
      console.log('MONTADO');
      esPrimeraVez.current = false;
    } else {
      console.log('ACTUALIZADO, clics:', clics);
    }

    return () => {
      console.log('LIMPIEZA: antes del próximo efecto o al desmontar');
    };
  }, [clics]);

  return (
    <div>
      <p>Clics: {clics}</p>
      <button onClick={() => setClics((valorActual) => valorActual + 1)}>
        Clickeame
      </button>
    </div>
  );
}

export default App;
