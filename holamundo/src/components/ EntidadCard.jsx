export function EntidadCard({ nombreEntidad, descripcion, cantidadCampos }) {
  return (
    <div className="card">
      <h3>Entidad: {nombreEntidad}</h3>
      <p>{descripcion}</p>
      <span>Atributos definidos: {cantidadCampos}</span>
    </div>
  );
}