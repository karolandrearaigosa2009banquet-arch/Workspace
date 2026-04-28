import { Header } from "./components/Header";
import { ContenedorPPI } from "./components/ContenedorPPI";
import { BotonEstado } from "./components/BotonEstado";

function App() {
  // Datos basados en tu diagrama ER
  const misEntidades = [
    { nombre: "Usuarios", desc: "Almacena credenciales y roles", campos: 5 },
    { nombre: "Productos", desc: "Inventario general del sistema", campos: 8 },
    { nombre: "Ventas", desc: "Registro de transacciones", campos: 4 }
  ];

  return (
    <main>
      <Header titulo="Mi Proyecto Pedagógico (PPI)" grupo="11A" />
      <BotonEstado texto="Fase de Análisis Completa" activo={true} />
      <ContenedorPPI entidades={misEntidades} />
    </main>
  );
}

export default App;