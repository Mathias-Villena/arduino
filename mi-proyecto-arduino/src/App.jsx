import { useState, useRef } from "react";
import { PersonWalking, Bicycle, Activity, MicFill } from "react-bootstrap-icons";
import caminataGif from "./assets/Chill Relax GIF by RainToMe.gif";
import correrGif from "./assets/bugs bunny running GIF.gif";
import ciclismoGif from "./assets/bicycle GIF.gif";

const ejercicios = [
  {
    nombre: "Caminata",
    valor: "CAMINATA",
    icon: <PersonWalking size={54} />,
    color: "primary",
    bg: "bg-primary bg-gradient",
    gif: caminataGif,
  },
  {
    nombre: "Correr",
    valor: "CORRER",
    icon: <Activity size={54} />,
    color: "danger",
    bg: "bg-danger bg-gradient",
    gif: correrGif,
  },
  {
    nombre: "Ciclismo",
    valor: "CICLISMO",
    icon: <Bicycle size={54} />,
    color: "success",
    bg: "bg-success bg-gradient",
    gif: ciclismoGif,
  },
];

function App() {
  const [selected, setSelected] = useState(ejercicios[0]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Esperando...");
  const [isRunning, setIsRunning] = useState(false);
  const [textoVoz, setTextoVoz] = useState("");
  const wsRef = useRef(null);

  // Fondo con gradiente global
  document.body.style.background = `linear-gradient(135deg, #c3ec52 0%, #0ba29d 100%)`;
  document.body.style.minHeight = "100vh";
  document.body.style.margin = "0";

  // Conexión WebSocket
  const connectWS = () => {
    if (!wsRef.current || wsRef.current.readyState !== 1) {
      wsRef.current = new window.WebSocket("ws://localhost:3001");
      wsRef.current.onopen = () => setStatus("Conectado a Arduino ✔️");
      wsRef.current.onclose = () => setStatus("Desconectado");
      wsRef.current.onerror = () => setStatus("Error WS");
      wsRef.current.onmessage = (msg) => {
        if (msg.data.startsWith("PROGRESO:")) {
          setProgress(Number(msg.data.split(":")[1]));
          setIsRunning(true);
        }
        if (msg.data === "TERMINADO") {
          setStatus("¡Ejercicio terminado!");
          setIsRunning(false);
        }
      };
    }
  };

  const iniciarEjercicio = () => {
    connectWS();
    if (wsRef.current && wsRef.current.readyState === 1) {
      wsRef.current.send(selected.valor);
      setStatus(`Iniciando ${selected.nombre}...`);
      setProgress(0);
      setIsRunning(true);
    }
  };

  // ======= RECONOCIMIENTO DE VOZ ===========
  const escucharVoz = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta reconocimiento de voz");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "es-PE"; // o "es-ES"

    recognition.onresult = (event) => {
      const resultado = event.results[0][0].transcript.toLowerCase();
      setTextoVoz(resultado);

      // Lógica de activación por comando
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

    recognition.onerror = () => {
      setTextoVoz("No se reconoció ningún comando.");
    };

    recognition.start();
  };

  // --- CLASE CSS PERSONALIZADA PARA ESTILO "CARD"
  const cardStyle = {
    minWidth: 120,
    cursor: isRunning ? "not-allowed" : "pointer",
    transform: "scale(1)",
    transition: "all .18s",
    opacity: isRunning ? 0.6 : 1,
    borderRadius: 18,
    border: "none",
    boxShadow: "0 2px 20px #0001",
    margin: "0 8px",
    padding: "28px 10px 20px 10px"
  };

  return (
    <div
      className="d-flex align-items-stretch"
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "linear-gradient(135deg, #c3ec52 0%, #0ba29d 100%)",
        overflow: "hidden",
      }}
    >
      {/* Panel de controles - IZQUIERDA */}
      <div
        className="shadow-lg bg-white bg-opacity-85 px-3 px-md-5 d-flex flex-column align-items-center justify-content-start"
        style={{
          width: "100%",
          maxWidth: "470px",
          minWidth: "320px",
          height: "100vh", // ocupa todo el alto
          margin: "0",
          borderRadius: "0 32px 32px 0", // solo derecha redondeado
          boxShadow: "8px 0 32px #0002"
        }}
      >
        <h1 className="fw-bold text-center mt-4 mb-4 display-5" style={{ letterSpacing: "2px", fontSize: "2.5rem" }}>
          Control de Ejercicios Arduino
        </h1>

        <div className="d-flex flex-wrap justify-content-center mb-4" style={{ width: "100%" }}>
          {ejercicios.map((ej,) => (
            <div
              key={ej.valor}
              className={`card align-items-center justify-content-center mb-2 ${selected.valor === ej.valor ? ej.bg + " text-white" : "bg-light"
                }`}
              style={{
                ...cardStyle,
                ...(selected.valor === ej.valor ? { boxShadow: "0 4px 24px #08a9d780", transform: "scale(1.10)" } : {})
              }}
              onClick={() => !isRunning && setSelected(ej)}
            >
              <div className="mb-2">{ej.icon}</div>
              <div className="fw-bold fs-5">{ej.nombre}</div>
            </div>
          ))}
        </div>

        <div className="w-100 mb-2" style={{ maxWidth: 400 }}>
          <button
            className={`btn btn-lg btn-${selected.color} fw-semibold shadow mb-2`}
            style={{ width: "100%", borderRadius: 16, fontSize: "1.25rem" }}
            onClick={iniciarEjercicio}
            disabled={isRunning}
          >
            Iniciar
          </button>
          <button
            className="btn btn-dark btn-lg fw-semibold shadow"
            style={{ width: "100%", borderRadius: 16, fontSize: "1.2rem" }}
            onClick={escucharVoz}
            disabled={isRunning}
          >
            <MicFill size={23} className="mb-1" /> Voz
          </button>
        </div>

        {/* Franja comando voz */}
        <div className="w-100 mb-2" style={{ maxWidth: 400 }}>
          <div
            className={
              "alert fw-bold py-2 px-3 mb-0 text-center " +
              (textoVoz && (textoVoz.includes("iniciar") ? "alert-success" : "alert-warning"))
            }
            style={{
              minHeight: 44,
              fontSize: 18,
              background: textoVoz
                ? (textoVoz.includes("iniciar")
                  ? "linear-gradient(90deg,#cefad0,#90ffe5)"
                  : "linear-gradient(90deg,#fffbe3,#ffe9ce)")
                : "#eaeaea",
              color: "#333",
              borderRadius: 14,
              border: "none",
              boxShadow: "0 2px 18px #00000011"
            }}
          >
            <MicFill size={20} className="me-2" />
            {textoVoz
              ? <> <span style={{ opacity: 0.77 }}>Comando:</span> “{textoVoz}” </>
              : <>Comando de voz no detectado</>}
          </div>
        </div>

        <div className="alert alert-info mt-3 mb-1 fw-semibold shadow-sm w-100" style={{ maxWidth: 420, fontSize: 16, borderRadius: 12 }}>
          <span className="fw-bold">Instrucciones:</span> Puedes decir por ejemplo: <b>iniciar correr</b>, <b>iniciar caminata</b> o <b>iniciar ciclismo</b>.
        </div>
      </div>

      {/* Panel derecho - GIF y progreso */}
      <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center"
           style={{ minHeight: "100vh", width: "100%", padding: "32px 0" }}>
        {isRunning && (
          <>
            <img
              src={selected.gif}
              alt="Ejercicio en progreso"
              style={{
                height: 320,
                maxWidth: "90%",
                borderRadius: 24,
                boxShadow: "0 12px 40px #0003",
                background: "#fff6",
                padding: 8,
                marginBottom: 24,
              }}
            />
            {/* Barra de progreso */}
            <div className="mb-3 px-2 w-100" style={{ maxWidth: 400 }}>
              <div className="progress" style={{ height: "38px", background: "#e9ecef", borderRadius: "18px" }}>
                <div
                  className={`progress-bar progress-bar-striped progress-bar-animated bg-${selected.color}`}
                  role="progressbar"
                  style={{
                    width: `${progress}%`,
                    fontSize: "1.4rem",
                    borderRadius: "18px",
                    transition: "width .6s cubic-bezier(.4,2.3,.3,1)",
                    backgroundImage: "linear-gradient(90deg, #fff7, #fff0)"
                  }}
                  aria-valuenow={progress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  {progress}%
                </div>
              </div>
            </div>
            <div className="text-center h4 mb-1" style={{ minHeight: "2.4em" }}>{status}</div>
          </>
        )}
        {!isRunning && (
          <div className="text-center h4 mb-1 text-white" style={{ minHeight: "2.4em" }}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
