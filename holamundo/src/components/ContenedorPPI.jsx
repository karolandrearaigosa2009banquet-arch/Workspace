import { EntidadCard } from "./ EntidadCard.jsx";

export function ContenedorPPI({ entidades }) {
  return (
    <section>
      <h2>Esquema de Base de Datos</h2>
      {entidades.map((e, index) => (
        <EntidadCard 
          key={index} 
          nombreEntidad={e.nombre} 
          descripcion={e.desc} 
          cantidadCampos={e.campos} 
        />
      ))}
    </section>
  );
}