import { useState } from "react";

function App() {

  const [numero1, setNumero1] = useState("");
  const [numero2, setNumero2] = useState("");

  // =====================================
  // FUNCIONES
  // =====================================

  function sumar(a, b) {
    return a + b;
  }

  function restar(a, b) {
    return a - b;
  }

  function multiplicar(a, b) {
    return a * b;
  }

  function dividir(a, b) {
    if (b === 0) {
      return "No se puede dividir por cero";
    }

    return a / b;
  }

  // =====================================
  // EVENTOS
  // =====================================

  function handleSuma() {
    alert(sumar(Number(numero1), Number(numero2)));
  }

  function handleResta() {
    alert(restar(Number(numero1), Number(numero2)));
  }

  function handleMultiplicacion() {
    alert(multiplicar(Number(numero1), Number(numero2)));
  }

  function handleDivision() {
    alert(dividir(Number(numero1), Number(numero2)));
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>Calculadora React</h1>

      <input
        type="number"
        placeholder="Número 1"
        value={numero1}
        onChange={(e) => setNumero1(e.target.value)}
      />

      <br />
      <br />

      <input
        type="number"
        placeholder="Número 2"
        value={numero2}
        onChange={(e) => setNumero2(e.target.value)}
      />

      <br />
      <br />

      <button onClick={handleSuma}>
        Sumar
      </button>

      <button onClick={handleResta}>
        Restar
      </button>

      <button onClick={handleMultiplicacion}>
        Multiplicar
      </button>

      <button onClick={handleDivision}>
        Dividir
      </button>
    </div>
  );
}

export default App;