import { useState } from "react";

const SCRIPT = `(function() {
  let deleted = 0;
  function selectAll() {
    const checkboxes = document.querySelectorAll('div[data-latest-bg]');
    checkboxes.forEach(el => el.click());
  }
  async function deleteSelected() {
    const moreBtn = document.querySelector('button[aria-label="More options"]') || 
                    document.querySelector('button[aria-label="Más opciones"]');
    if (moreBtn) moreBtn.click();
    await new Promise(r => setTimeout(r, 500));
    const deleteBtn = Array.from(document.querySelectorAll('li[role="menuitem"]'))
      .find(el => el.textContent.includes('Delete') || el.textContent.includes('Eliminar') || el.textContent.includes('Mover a la papelera'));
    if (deleteBtn) {
      deleteBtn.click();
      await new Promise(r => setTimeout(r, 500));
      const confirmBtn = document.querySelector('button[data-mdc-dialog-action="ok"]') ||
                         Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Move to trash') || b.textContent.includes('Mover a la papelera'));
      if (confirmBtn) { confirmBtn.click(); deleted++; }
    }
  }
  async function run() {
    const firstPhoto = document.querySelector('div[data-latest-bg]');
    if (!firstPhoto) { alert('No se encontraron fotos. Asegúrate de estar en photos.google.com'); return; }
    firstPhoto.dispatchEvent(new MouseEvent('mouseover', {bubbles: true}));
    await new Promise(r => setTimeout(r, 300));
    firstPhoto.click();
    await new Promise(r => setTimeout(r, 300));
    selectAll();
    await new Promise(r => setTimeout(r, 500));
    await deleteSelected();
    console.log('Lote enviado a la papelera. Recarga y vuelve a ejecutar. Total lotes: ' + deleted);
    alert('Lote movido a la papelera ✓\\nRecarga Google Photos (F5) y ejecuta el script de nuevo para continuar con el siguiente lote.');
  }
  run();
})();`;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        position: "absolute",
        top: "12px",
        right: "12px",
        backgroundColor: copied ? "#4ade80" : "#1e2d1e",
        color: copied ? "#0f0f0f" : "#4ade80",
        border: "1px solid #4ade80",
        borderRadius: "6px",
        padding: "6px 14px",
        fontSize: "13px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s ease",
        zIndex: 10,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {copied ? "Copiado ✓" : "Copiar Script"}
    </button>
  );
}

const steps = [
  {
    num: 1,
    title: "Abre Google Photos en una nueva pestaña",
    content: (
      <div>
        <p style={{ color: "#a3a3a3", marginBottom: "16px", lineHeight: 1.6 }}>
          Haz clic en el botón de abajo para abrir Google Photos. Asegúrate de
          haber iniciado sesión con tu cuenta de Google.
        </p>
        <a
          href="https://photos.google.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            backgroundColor: "#4ade80",
            color: "#0f0f0f",
            fontWeight: 700,
            padding: "12px 28px",
            borderRadius: "8px",
            textDecoration: "none",
            fontSize: "15px",
            transition: "opacity 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Abrir Google Photos →
        </a>
      </div>
    ),
  },
  {
    num: 2,
    title: "Abre la Consola del Navegador",
    content: (
      <div>
        <p style={{ color: "#a3a3a3", marginBottom: "14px", lineHeight: 1.6 }}>
          Con Google Photos abierto, abre la consola del desarrollador usando
          uno de estos métodos:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            {
              browser: "Chrome / Edge",
              shortcut: "F12  o  Ctrl+Shift+J (Windows) / Cmd+Option+J (Mac)",
            },
            {
              browser: "Firefox",
              shortcut: "F12  o  Ctrl+Shift+K (Windows) / Cmd+Option+K (Mac)",
            },
            {
              browser: "Safari",
              shortcut:
                'Primero activa "Menú Desarrollo" en Preferencias, luego Cmd+Option+C',
            },
          ].map((item) => (
            <div
              key={item.browser}
              style={{
                backgroundColor: "#0f0f0f",
                border: "1px solid #2a2a2a",
                borderRadius: "8px",
                padding: "12px 16px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <span style={{ color: "#4ade80", fontWeight: 600, fontSize: "13px" }}>
                {item.browser}
              </span>
              <span style={{ color: "#d4d4d4", fontSize: "14px", fontFamily: "monospace" }}>
                {item.shortcut}
              </span>
            </div>
          ))}
        </div>
        <p style={{ color: "#737373", marginTop: "14px", fontSize: "13px" }}>
          Ve a la pestaña <strong style={{ color: "#a3a3a3" }}>Console</strong>{" "}
          dentro de las herramientas del desarrollador.
        </p>
      </div>
    ),
  },
  {
    num: 3,
    title: "Copia el Script",
    content: (
      <div>
        <p style={{ color: "#a3a3a3", marginBottom: "16px", lineHeight: 1.6 }}>
          Haz clic en el botón <strong style={{ color: "#4ade80" }}>Copiar Script</strong> para copiar
          el código al portapapeles:
        </p>
        <div style={{ position: "relative" }}>
          <CopyButton text={SCRIPT} />
          <pre
            style={{
              backgroundColor: "#0d1117",
              border: "1px solid #2a2a2a",
              borderRadius: "10px",
              padding: "20px 20px 20px 20px",
              paddingTop: "52px",
              overflowX: "auto",
              fontSize: "12px",
              lineHeight: 1.7,
              color: "#c9d1d9",
              fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
              margin: 0,
              whiteSpace: "pre",
            }}
          >
            <code>{SCRIPT}</code>
          </pre>
        </div>
      </div>
    ),
  },
  {
    num: 4,
    title: "Pega el Script y Presiona Enter",
    content: (
      <div>
        <p style={{ color: "#a3a3a3", marginBottom: "14px", lineHeight: 1.6 }}>
          En la consola de Google Photos, pega el script y ejecútalo:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            {
              step: "1.",
              text: 'Haz clic dentro del campo de texto de la consola (donde dice ">").',
            },
            {
              step: "2.",
              text: "Pega con Ctrl+V (Windows/Linux) o Cmd+V (Mac).",
            },
            {
              step: "3.",
              text: "Presiona Enter para ejecutar.",
            },
            {
              step: "4.",
              text: "Espera el mensaje de confirmación del script.",
            },
          ].map((item) => (
            <div
              key={item.step}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                backgroundColor: "#0f0f0f",
                border: "1px solid #2a2a2a",
                borderRadius: "8px",
                padding: "12px 16px",
              }}
            >
              <span
                style={{
                  color: "#4ade80",
                  fontWeight: 700,
                  fontSize: "15px",
                  flexShrink: 0,
                  minWidth: "20px",
                }}
              >
                {item.step}
              </span>
              <span style={{ color: "#d4d4d4", fontSize: "14px", lineHeight: 1.5 }}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export default function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f0f0f",
        color: "#e5e5e5",
        fontFamily: "'Inter', sans-serif",
        padding: "0 0 60px",
      }}
    >
      {/* Header */}
      <header
        style={{
          background: "linear-gradient(180deg, #111111 0%, #0f0f0f 100%)",
          borderBottom: "1px solid #1e1e1e",
          padding: "48px 24px 40px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                backgroundColor: "#4ade80",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
              }}
            >
              🗑
            </div>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: 700,
                color: "#ffffff",
                margin: 0,
                letterSpacing: "-0.5px",
              }}
            >
              Google Photos Cleaner
            </h1>
          </div>
          <p
            style={{
              color: "#737373",
              fontSize: "16px",
              lineHeight: 1.6,
              margin: 0,
              maxWidth: "560px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Elimina en masa todas tus fotos y vídeos de Google Photos usando un
            script que se ejecuta directamente en tu navegador.
          </p>
        </div>
      </header>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 24px" }}>
        {/* Warning Banner */}
        <div
          style={{
            backgroundColor: "#1a0a0a",
            border: "1px solid #7f1d1d",
            borderLeft: "4px solid #dc2626",
            borderRadius: "10px",
            padding: "20px 24px",
            marginTop: "32px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "14px",
            }}
          >
            <span style={{ fontSize: "22px", flexShrink: 0, lineHeight: 1 }}>⚠️</span>
            <div>
              <p
                style={{
                  color: "#fca5a5",
                  fontWeight: 700,
                  fontSize: "15px",
                  margin: "0 0 8px",
                }}
              >
                Advertencia: Esta acción es irreversible
              </p>
              <p
                style={{
                  color: "#f87171",
                  fontSize: "14px",
                  margin: "0 0 12px",
                  lineHeight: 1.6,
                }}
              >
                Las fotos eliminadas <strong>no se pueden recuperar</strong> una vez
                vaciada la papelera. Haz una copia de seguridad de todo lo que
                quieras conservar antes de continuar.
              </p>
              <a
                href="https://takeout.google.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#4ade80",
                  fontSize: "14px",
                  fontWeight: 600,
                  textDecoration: "underline",
                }}
              >
                Descargar copia de seguridad con Google Takeout →
              </a>
            </div>
          </div>
        </div>

        {/* Steps */}
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#ffffff",
            marginBottom: "20px",
            marginTop: "0",
          }}
        >
          Guía paso a paso
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {steps.map((step) => (
            <div
              key={step.num}
              style={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #2a2a2a",
                borderRadius: "12px",
                padding: "24px",
                transition: "border-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "#3a3a3a";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "#2a2a2a";
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    backgroundColor: "#1e2d1e",
                    border: "2px solid #4ade80",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#4ade80",
                    fontWeight: 700,
                    fontSize: "14px",
                    flexShrink: 0,
                  }}
                >
                  {step.num}
                </div>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#ffffff",
                    margin: 0,
                  }}
                >
                  {step.title}
                </h3>
              </div>
              {step.content}
            </div>
          ))}
        </div>

        {/* Progress Tips */}
        <div
          style={{
            backgroundColor: "#111827",
            border: "1px solid #1e3a5f",
            borderLeft: "4px solid #3b82f6",
            borderRadius: "10px",
            padding: "20px 24px",
            marginTop: "32px",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
            <span style={{ fontSize: "20px", flexShrink: 0, lineHeight: 1 }}>ℹ️</span>
            <div>
              <p
                style={{
                  color: "#93c5fd",
                  fontWeight: 700,
                  fontSize: "15px",
                  margin: "0 0 12px",
                }}
              >
                Cómo funciona el proceso
              </p>
              <ul
                style={{
                  color: "#94a3b8",
                  fontSize: "14px",
                  lineHeight: 1.7,
                  margin: 0,
                  paddingLeft: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <li>
                  El script mueve tus fotos a la papelera en lotes, no todas de una
                  vez.
                </li>
                <li>
                  Debes{" "}
                  <strong style={{ color: "#bfdbfe" }}>
                    recargar Google Photos (F5)
                  </strong>{" "}
                  y volver a ejecutar el script para procesar el siguiente lote.
                </li>
                <li>
                  Repite este proceso hasta que no queden más fotos en la vista
                  principal.
                </li>
                <li>
                  Finalmente, ve a{" "}
                  <strong style={{ color: "#bfdbfe" }}>
                    Papelera → Vaciar papelera
                  </strong>{" "}
                  para eliminar permanentemente.
                </li>
                <li>
                  Las fotos permanecen en la papelera durante{" "}
                  <strong style={{ color: "#bfdbfe" }}>60 días</strong> si no la
                  vacías manualmente.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer
          style={{
            textAlign: "center",
            marginTop: "48px",
            paddingTop: "24px",
            borderTop: "1px solid #1e1e1e",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#1a1a1a",
              border: "1px solid #2a2a2a",
              borderRadius: "24px",
              padding: "10px 20px",
            }}
          >
            <span style={{ fontSize: "14px" }}>🔒</span>
            <p style={{ color: "#737373", fontSize: "13px", margin: 0 }}>
              Esta herramienta funciona{" "}
              <strong style={{ color: "#a3a3a3" }}>
                completamente en tu navegador
              </strong>
              . No se envían fotos ni datos a ningún servidor.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
