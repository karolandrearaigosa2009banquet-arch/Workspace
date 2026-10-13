import { useEffect, useState } from "react";
import { getCookie, setCookie } from "../utils/cookies";

export default function SelectorTema() {
  const [tema, setTema] = useState(() => getCookie("tema") ?? "claro");

  useEffect(() => {
    document.body.dataset.tema = tema;
    setCookie("tema", tema, 365, { sameSite: "Lax" });
  }, [tema]);

  return (
    <button onClick={() => setTema(tema === "claro" ? "oscuro" : "claro")}>
      Tema actual: {tema}
    </button>
  );
}
