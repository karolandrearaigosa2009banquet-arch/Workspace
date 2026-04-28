export function BotonEstado({ texto, activo }) {
  const color = activo ? "green" : "gray";
  return (
    <button style={{ backgroundColor: color, color: 'white', padding: '10px' }}>
      {texto}
    </button>
  );
}