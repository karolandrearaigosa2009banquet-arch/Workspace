export function Header({ titulo, grupo }) {
  return (
    <header className="header-main">
      <h1>{titulo} </h1>
      <p>Grado: {grupo} - Karol Andrea raigosa banquet</p>
    </header>
  );
}