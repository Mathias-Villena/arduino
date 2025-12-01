import { useState, useEffect, useRef } from "react";
import { PersonWalking, Bicycle, Activity, MicFill, BoxArrowUpRight } from "react-bootstrap-icons";
import caminataGif from "./assets/Chill Relax GIF by RainToMe.gif";
import correrGif from "./assets/bugs bunny running GIF.gif";
import ciclismoGif from "./assets/bicycle GIF.gif";

const ejercicios = [
  {
    nombre: "Caminata",
    valor: "CAMINATA",
    icon: <PersonWalking size={38} />,
    color: "#42b983",
    bg: "linear-gradient(120deg,#e0f7fa,#fff)",
    gif: caminataGif,
  },
  {
    nombre: "Correr",
    valor: "CORRER",
    icon: <Activity size={38} />,
    color: "#fa5555",
    bg: "linear-gradient(120deg,#fff1f0,#fff)",
    gif: correrGif,
  },
  {
    nombre: "Ciclismo",
    valor: "CICLISMO",
    icon: <Bicycle size={38} />,
    color: "#4699fa",
    bg: "linear-gradient(120deg,#e0f2ff,#fff)",
    gif: ciclismoGif,
  },
];

function App() {
  const [selected, setSelected] = useState(ejercicios[0]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Esperando...");
  const [isRunning, setIsRunning] = useState(false);
  const [textoVoz, setTextoVoz] = useState("");
  const [distancia, setDistancia] = useState(10);
  const wsRef = useRef(null);

  // Set global font and background
  useEffect(() => {
    document.body.style.background = "#f3f8fb";
    document.body.style.fontFamily = "Nunito, Montserrat, Arial, sans-serif";
    document.body.style.margin = "0";
    document.body.style.minHeight = "100vh";
  }, []);

  // WebSocket conexión y recepción de datos del backend/Arduino
  useEffect(() => {
    wsRef.current = new window.WebSocket("ws://localhost:3001");
    wsRef.current.onopen = () => setStatus("Conectado a Arduino ✔️");
    wsRef.current.onclose = () => setStatus("Desconectado");
    wsRef.current.onerror = () => setStatus("Error WS");

    wsRef.current.onmessage = (msg) => {
      if (msg.data.startsWith("PROGRESO:")) {
        const value = Number(msg.data.split(":")[1]);
        setProgress(value);
        setIsRunning(true);
      }
      if (msg.data.trim() === "TERMINADO") {
        setStatus("¡Ejercicio terminado!");
        setProgress(100);
        setIsRunning(false);
      }
    };

    return () => {
      wsRef.current && wsRef.current.close();
    };
  }, []);

  const iniciarEjercicio = () => {
    if (wsRef.current && wsRef.current.readyState === 1) {
      const comando = `${selected.valor}:${distancia}`;
      wsRef.current.send(comando);
      setStatus(`Iniciando ${selected.nombre} (${distancia}m)...`);
      setProgress(0);
      setIsRunning(true);
    } else {
      setStatus("Conexión no disponible");
    }
  };

  // Reconocimiento de voz
  const escucharVoz = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta reconocimiento de voz");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "es-PE";
    recognition.onresult = (event) => {
      const resultado = event.results[0][0].transcript.toLowerCase();
      setTextoVoz(resultado);

      const distanciaMatch = resultado.match(/distancia (\d+)/);
      if (distanciaMatch) setDistancia(Number(distanciaMatch[1]));

      if (resultado.includes("iniciar caminata")) {
        setSelected(ejercicios[0]);
        setTimeout(() => iniciarEjercicio(), 400);
      } else if (resultado.includes("iniciar correr")) {
        setSelected(ejercicios[1]);
        setTimeout(() => iniciarEjercicio(), 400);
      } else if (resultado.includes("iniciar ciclismo")) {
        setSelected(ejercicios[2]);
        setTimeout(() => iniciarEjercicio(), 400);
      }
    };
    recognition.onerror = () => setTextoVoz("No se reconoció ningún comando.");
    recognition.start();
  };

  // CARD Styles
  const cardStyle = (ej) => ({
    minWidth: 110,
    height: 130,
    cursor: isRunning ? "not-allowed" : "pointer",
    border: selected.valor === ej.valor ? `2.5px solid ${ej.color}` : "2px solid #e3e8ef",
    background: ej.bg,
    transition: "all .19s cubic-bezier(.4,1.6,.3,1)",
    boxShadow: selected.valor === ej.valor ? "0 8px 24px #aaa3" : "0 2px 12px #ccd3",
    opacity: isRunning ? 0.7 : 1,
    borderRadius: 18,
    margin: "0 7px",
    padding: "16px 7px 8px 7px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
  });

  return (
    <div className="app-root">
      {/* Panel izquierdo */}
      <div className="left-panel"
        style={{
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "32px 22px 0 22px",
        }}
      >
        <div className="app-title" style={{
          fontWeight: 900,
          fontSize: "2.6rem",
          color: "#166aaa",
          letterSpacing: "2.5px",
          marginBottom: 26,
          textShadow: "0 2px 16px #64bcff19"
        }}>
          Mi Fitness Case
        </div>

        {/* Estado de conexión */}
        <div style={{
          background: status.includes("Conectado") ? "#e9faf1" : "#fffbe9",
          color: status.includes("Conectado") ? "#2b8a5e" : "#f68639",
          fontWeight: 600,
          borderRadius: 9,
          padding: "6px 15px",
          marginBottom: 20,
          fontSize: "1.06rem",
          display: "flex",
          alignItems: "center",
          gap: 7,
        }}>
          <BoxArrowUpRight style={{ opacity: 0.8, fontSize: 16 }} /> {status}
        </div>

        <div className="exercise-list" style={{ width: "100%", marginBottom: 18, display: "flex", justifyContent: "center" }}>
          {ejercicios.map((ej) => (
            <div
              key={ej.valor}
              style={cardStyle(ej)}
              onClick={() => !isRunning && setSelected(ej)}
            >
              <div style={{
                background: ej.color + "22",
                borderRadius: "50%",
                padding: 7,
                marginBottom: 3
              }}>
                {ej.icon}
              </div>
              <div style={{
                fontWeight: 700,
                fontSize: 19,
                color: ej.color,
                marginBottom: 3
              }}>{ej.nombre}</div>
            </div>
          ))}
        </div>

        {/* Input para distancia */}
        <div style={{ width: "100%", maxWidth: 250, margin: "8px 0 13px 0" }}>
          <label htmlFor="distancia" style={{ fontWeight: 700, marginBottom: 4, color: "#386" }}>
            Distancia objetivo (m):
          </label>
          <input
            id="distancia"
            type="number"
            min={1}
            max={999}
            value={distancia}
            onChange={e => setDistancia(e.target.value)}
            className="form-control"
            style={{
              borderRadius: 12, fontWeight: 700, padding: 7, fontSize: 18, border: "1.4px solid #b6dee3",
              background: "#f7fcff"
            }}
            disabled={isRunning}
          />
        </div>

        <div className="w-100 mb-2" style={{ maxWidth: 250 }}>
          <button
            className="btn btn-primary shadow"
            style={{
              width: "100%", borderRadius: 16, fontSize: "1.2rem", fontWeight: 700,
              marginBottom: 8, background: selected.color, border: "none", boxShadow: "0 2px 14px #84ccfa49"
            }}
            onClick={iniciarEjercicio}
            disabled={isRunning}
          >
            Iniciar
          </button>
          <button
            className="btn btn-dark"
            style={{
              width: "100%", borderRadius: 16, fontSize: "1.1rem", fontWeight: 600, boxShadow: "0 1px 7px #4441"
            }}
            onClick={escucharVoz}
            disabled={isRunning}
          >
            <MicFill size={21} className="mb-1" /> Voz
          </button>
        </div>

        {/* Comando de voz */}
        <div className="w-100 mb-2" style={{ maxWidth: 250 }}>
          <div
            style={{
              minHeight: 35,
              fontSize: 15,
              color: textoVoz && textoVoz.includes("iniciar") ? "#3c7a44" : "#666",
              background: textoVoz && textoVoz.includes("iniciar") ? "#e6faee" : "#f3f3f7",
              borderRadius: 9,
              border: "1.2px solid #e0ecf3",
              fontWeight: 600,
              boxShadow: "0 1px 8px #0001",
              padding: "6px 10px",
              marginBottom: 3,
              display: "flex",
              alignItems: "center",
              gap: 8
            }}
          >
            <MicFill size={16} style={{ opacity: 0.7 }} />
            {textoVoz ? <> {textoVoz} </> : <> Comando de voz no detectado </>}
          </div>
        </div>

        
      </div>

      {/* Panel derecho - GIF, barra y ahora instrucciones horizontales */}
<div className="right-panel"
  style={{
    flexGrow: 1,
    background: "#f3f8fb",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px 0",
  }}
>
  <div className="right-card" style={{
    width: "100%",
    maxWidth: 480,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "#fff",
    borderRadius: 20,
    boxShadow: "0 6px 40px #aee4ff29",
    padding: "22px 22px 18px 22px",
  }}>
    <img className="exercise-gif"
      src={selected.gif}
      alt="Ejercicio en progreso"
      style={{
        height: 220,
        width: "auto",
        borderRadius: 15,
        marginBottom: 20,
        boxShadow: "0 2px 24px #22cfff17",
        background: "#f8fcff"
      }}
    />
    {/* Barra de progreso */}
    <div style={{ width: "100%", marginBottom: 16 }}>
      <div style={{
        height: "28px",
        background: "#eef3f7",
        borderRadius: "16px",
        boxShadow: "0 2px 12px #8cf8ff33",
        overflow: "hidden",
        position: "relative"
      }}>
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: `linear-gradient(90deg,${selected.color} 70%,#fff6 100%)`,
            transition: "width .7s cubic-bezier(.4,2.3,.3,1)",
            borderRadius: "16px 0 0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            color: "#fff",
            fontWeight: 800,
            fontSize: 18,
            paddingRight: 16,
            letterSpacing: 1
          }}
        >
          {progress > 0 ? `${progress}%` : ""}
        </div>
      </div>
    </div>
    <div style={{ textAlign: "center", color: "#14537a", fontWeight: 800, fontSize: 23, letterSpacing: 0.5, marginBottom: 10 }}>
      {status}
    </div>
    {/* INSTRUCCIONES EN FRANJA HORIZONTAL */}
    <div className="instructions"
      style={{
        width: "100%",
        background: "#eafdff",
        border: "1.3px solid #b4e9fa",
        borderRadius: 11,
        padding: "13px 18px",
        color: "#12618a",
        fontSize: 16.2,
        fontWeight: 500,
        boxShadow: "0 1px 8px #90d6fa11",
        textAlign: "center",
        letterSpacing: 0.05,
        marginTop: 10,
        marginBottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        flexWrap: "nowrap",
        overflow: "hidden"
      }}
    >
      <span><b>1. Elige ejercicio y distancia.</b></span>
      <span>|</span>
      <span><b>2. Pulsa Iniciar o usa el botón Voz.</b></span>
      <span>|</span>
      <span><b>3. Di: “iniciar caminata”, “iniciar correr”, “iniciar ciclismo” o “distancia [número]”.</b></span>
      <span>|</span>
      <span><b>4. ¡Mueve el sensor y mira tu avance!</b></span>
    </div>
  </div>
</div>

    </div>
  );
}

export default App;
