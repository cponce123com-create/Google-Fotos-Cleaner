import { useState, useEffect, useRef } from "react";

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

// ─── Icons ──────────────────────────────────────────────────────────────────

function IconTrash() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

function IconExternalLink() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function IconCopy() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function IconAlertTriangle() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function IconChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// ─── Animated counter ────────────────────────────────────────────────────────

function useInView(ref: React.RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref]);
  return inView;
}

// ─── Copy button ─────────────────────────────────────────────────────────────

function CopyButton({ text, onCopied }: { text: string; onCopied?: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    onCopied?.();
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? "Script copiado" : "Copiar script"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        backgroundColor: copied ? "#4ade80" : "rgba(74,222,128,0.1)",
        color: copied ? "#0f0f0f" : "#4ade80",
        border: `1px solid ${copied ? "#4ade80" : "rgba(74,222,128,0.4)"}`,
        borderRadius: "7px",
        padding: "7px 16px",
        fontSize: "13px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s ease",
        fontFamily: "Inter, sans-serif",
        letterSpacing: "0.01em",
      }}
    >
      {copied ? <IconCheck /> : <IconCopy />}
      {copied ? "Copiado!" : "Copiar Script"}
    </button>
  );
}

// ─── Code block with syntax-like coloring ────────────────────────────────────

function CodeBlock({ code, onCopied }: { code: string; onCopied?: () => void }) {
  const lines = code.split("\n");

  return (
    <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", border: "1px solid #2d2d2d" }}>
      {/* Toolbar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#161b22",
        borderBottom: "1px solid #21262d",
        padding: "10px 16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ display: "flex", gap: "6px" }}>
            {["#ff5f56", "#ffbd2e", "#27c93f"].map((c, i) => (
              <div key={i} style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: c }} />
            ))}
          </div>
          <span style={{ color: "#6e7681", fontSize: "12px", fontFamily: "monospace", marginLeft: "4px" }}>
            google-photos-cleaner.js
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ color: "#484f58", fontSize: "12px" }}>{lines.length} líneas</span>
          <CopyButton text={code} onCopied={onCopied} />
        </div>
      </div>

      {/* Code area */}
      <div style={{ backgroundColor: "#0d1117", overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: "600px" }}>
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} style={{ lineHeight: "1.65" }}>
                <td style={{
                  padding: "0 16px 0 16px",
                  userSelect: "none",
                  color: "#484f58",
                  fontSize: "12px",
                  fontFamily: "'Menlo','Monaco','Courier New',monospace",
                  textAlign: "right",
                  minWidth: "40px",
                  borderRight: "1px solid #21262d",
                  verticalAlign: "top",
                  paddingTop: i === 0 ? "16px" : "0",
                  paddingBottom: i === lines.length - 1 ? "16px" : "0",
                }}>
                  {i + 1}
                </td>
                <td style={{
                  padding: `${i === 0 ? "16px" : "0"} 20px ${i === lines.length - 1 ? "16px" : "0"} 20px`,
                  verticalAlign: "top",
                }}>
                  <span style={{
                    color: "#c9d1d9",
                    fontSize: "12.5px",
                    fontFamily: "'Menlo','Monaco','Courier New',monospace",
                    whiteSpace: "pre",
                    display: "block",
                  }}>
                    {colorize(line)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function colorize(line: string): React.ReactNode {
  // Very simple keyword coloring
  const keywords = /\b(function|async|await|let|const|var|if|return|new|true|false|null|undefined)\b/g;
  const strings = /((['"`])(?:(?!\2)[^\\]|\\.)*\2)/g;
  const comments = /(\/\/.*$)/;
  const numbers = /\b(\d+)\b/g;

  if (comments.test(line)) {
    const [pre, ...rest] = line.split("//");
    return (
      <>
        {pre}
        <span style={{ color: "#6e7681" }}>{"//" + rest.join("//")}</span>
      </>
    );
  }

  // Tokenize simple pattern
  const parts: React.ReactNode[] = [];
  let last = 0;
  const allMatches: Array<{ index: number; end: number; type: string; text: string }> = [];

  let m: RegExpExecArray | null;

  const kwRe = new RegExp(keywords.source, "g");
  while ((m = kwRe.exec(line)) !== null) {
    allMatches.push({ index: m.index, end: m.index + m[0].length, type: "keyword", text: m[0] });
  }
  const strRe = new RegExp(strings.source, "g");
  while ((m = strRe.exec(line)) !== null) {
    allMatches.push({ index: m.index, end: m.index + m[0].length, type: "string", text: m[0] });
  }
  const numRe = new RegExp(numbers.source, "g");
  while ((m = numRe.exec(line)) !== null) {
    allMatches.push({ index: m.index, end: m.index + m[0].length, type: "number", text: m[0] });
  }

  // Sort and deduplicate overlapping ranges
  allMatches.sort((a, b) => a.index - b.index);
  const clean: typeof allMatches = [];
  let cursor = 0;
  for (const match of allMatches) {
    if (match.index >= cursor) {
      clean.push(match);
      cursor = match.end;
    }
  }

  last = 0;
  for (const { index, end, type, text } of clean) {
    if (index > last) parts.push(line.slice(last, index));
    const color = type === "keyword" ? "#ff7b72" : type === "string" ? "#a5d6ff" : "#79c0ff";
    parts.push(<span key={index} style={{ color }}>{text}</span>);
    last = end;
  }
  if (last < line.length) parts.push(line.slice(last));

  return parts.length ? <>{parts}</> : <>{line}</>;
}

// ─── FAQ Accordion ───────────────────────────────────────────────────────────

const faqs = [
  {
    q: "¿El script borra mis fotos permanentemente?",
    a: "No. El script mueve las fotos a la papelera de Google Photos. Permanecen allí durante 60 días. Para eliminarlas permanentemente debes ir a Papelera → Vaciar papelera.",
  },
  {
    q: "¿Por qué tengo que ejecutar el script varias veces?",
    a: "Google Photos carga las fotos en grupos (lotes). El script procesa un lote cada vez. Después de cada ejecución, recarga la página (F5) y vuelve a ejecutarlo para procesar el siguiente grupo.",
  },
  {
    q: "¿Funciona en todos los navegadores?",
    a: "Sí, funciona en Chrome, Edge, Firefox y Safari. Chrome o Edge son los más recomendados por su compatibilidad con la consola de desarrollador.",
  },
  {
    q: "¿El script accede a mis datos o contraseña?",
    a: "No. El script se ejecuta únicamente en tu navegador, dentro de la pestaña de Google Photos que ya tienes abierta. No envía ningún dato a ningún servidor externo.",
  },
  {
    q: "¿Qué pasa si el script dice 'No se encontraron fotos'?",
    a: "Asegúrate de estar en la vista principal de Google Photos (photos.google.com), no en un álbum ni en la papelera. Recarga la página y vuelve a intentarlo.",
  },
  {
    q: "¿Puedo recuperar las fotos después de ejecutar el script?",
    a: "Sí, mientras no hayas vaciado la papelera. Ve a Google Photos → Papelera y selecciona las fotos que quieras restaurar.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        borderBottom: "1px solid #2a2a2a",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          backgroundColor: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "18px 0",
          textAlign: "left",
          color: "#e5e5e5",
          fontSize: "15px",
          fontWeight: 500,
          fontFamily: "Inter, sans-serif",
        }}
      >
        <span>{q}</span>
        <span style={{ color: "#4ade80", flexShrink: 0 }}>
          <IconChevronDown open={open} />
        </span>
      </button>
      {open && (
        <div
          style={{
            color: "#a3a3a3",
            fontSize: "14px",
            lineHeight: 1.7,
            paddingBottom: "18px",
          }}
        >
          {a}
        </div>
      )}
    </div>
  );
}

// ─── Step card ────────────────────────────────────────────────────────────────

function StepCard({
  num,
  total,
  title,
  done,
  children,
}: {
  num: number;
  total: number;
  title: string;
  done?: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref as React.RefObject<HTMLElement>);
  const isLast = num === total;

  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        gap: "0",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.45s ease ${(num - 1) * 0.08}s, transform 0.45s ease ${(num - 1) * 0.08}s`,
      }}
    >
      {/* Left rail — number + connecting line */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexShrink: 0,
          width: "44px",
          marginRight: "20px",
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            backgroundColor: done ? "#4ade80" : "#1e2d1e",
            border: `2px solid ${done ? "#4ade80" : "#4ade80"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: done ? "#0f0f0f" : "#4ade80",
            fontWeight: 700,
            fontSize: "14px",
            flexShrink: 0,
            transition: "background-color 0.3s ease",
            zIndex: 1,
            position: "relative",
          }}
        >
          {done ? <IconCheck /> : num}
        </div>
        {!isLast && (
          <div
            style={{
              flex: 1,
              width: "2px",
              backgroundColor: done ? "#4ade80" : "#2a2a2a",
              marginTop: "8px",
              minHeight: "28px",
              transition: "background-color 0.3s ease",
            }}
          />
        )}
      </div>

      {/* Card content */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#1a1a1a",
          border: "1px solid #2a2a2a",
          borderRadius: "12px",
          padding: "22px 24px",
          marginBottom: isLast ? "0" : "16px",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = "#3d3d3d";
          el.style.boxShadow = "0 4px 20px rgba(0,0,0,0.4)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = "#2a2a2a";
          el.style.boxShadow = "none";
        }}
      >
        <h3
          style={{
            fontSize: "16px",
            fontWeight: 600,
            color: "#ffffff",
            margin: "0 0 16px",
            lineHeight: 1.3,
          }}
        >
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const markDone = (step: number) =>
    setCompletedSteps((prev) => new Set([...prev, step]));

  const progress = Math.round((completedSteps.size / 4) * 100);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f0f0f",
        color: "#e5e5e5",
        fontFamily: "'Inter', sans-serif",
        paddingBottom: "80px",
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(74,222,128,0.08) 0%, transparent 70%), linear-gradient(180deg, #111111 0%, #0f0f0f 100%)",
          borderBottom: "1px solid #1a1a1a",
          padding: "56px 24px 48px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: "680px", margin: "0 auto", position: "relative" }}>
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "rgba(74,222,128,0.1)",
              border: "1px solid rgba(74,222,128,0.25)",
              borderRadius: "20px",
              padding: "5px 14px",
              marginBottom: "20px",
              fontSize: "12px",
              fontWeight: 600,
              color: "#4ade80",
              letterSpacing: "0.02em",
            }}
          >
            <IconShield />
            100% Gratis · Sin registro · Funciona en tu navegador
          </div>

          {/* Icon + Title */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "16px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                backgroundColor: "#4ade80",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0f0f0f",
                boxShadow: "0 0 24px rgba(74,222,128,0.35)",
              }}
            >
              <IconTrash />
            </div>
            <h1
              style={{
                fontSize: "clamp(24px, 4vw, 32px)",
                fontWeight: 700,
                color: "#ffffff",
                margin: 0,
                letterSpacing: "-0.6px",
              }}
            >
              Google Photos Cleaner
            </h1>
          </div>

          <p
            style={{
              color: "#737373",
              fontSize: "16px",
              lineHeight: 1.65,
              margin: "0 auto",
              maxWidth: "500px",
            }}
          >
            Elimina en masa todas tus fotos y vídeos de Google Photos usando un
            script que se ejecuta directamente en tu navegador.
          </p>
        </div>
      </header>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 20px" }}>

        {/* ── Progress bar ───────────────────────────────────────────── */}
        {completedSteps.size > 0 && (
          <div
            style={{
              marginTop: "28px",
              backgroundColor: "#1a1a1a",
              border: "1px solid #2a2a2a",
              borderRadius: "12px",
              padding: "16px 20px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#a3a3a3" }}>Progreso</span>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#4ade80" }}>
                {completedSteps.size} / 4 pasos
              </span>
            </div>
            <div style={{ backgroundColor: "#0f0f0f", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  backgroundColor: "#4ade80",
                  borderRadius: "4px",
                  transition: "width 0.5s ease",
                  boxShadow: "0 0 8px rgba(74,222,128,0.5)",
                }}
              />
            </div>
            {progress === 100 && (
              <p style={{ margin: "10px 0 0", fontSize: "13px", color: "#4ade80", fontWeight: 600 }}>
                ¡Listo! Ahora ve a la Papelera de Google Photos y vacíala para eliminar permanentemente.
              </p>
            )}
          </div>
        )}

        {/* ── Warning Banner ─────────────────────────────────────────── */}
        <div
          style={{
            backgroundColor: "#1a0a0a",
            border: "1px solid rgba(220,38,38,0.4)",
            borderLeft: "4px solid #dc2626",
            borderRadius: "12px",
            padding: "20px 22px",
            marginTop: "28px",
            marginBottom: "32px",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
            <span style={{ color: "#ef4444", flexShrink: 0, marginTop: "1px" }}>
              <IconAlertTriangle />
            </span>
            <div>
              <p style={{ color: "#fca5a5", fontWeight: 700, fontSize: "15px", margin: "0 0 8px" }}>
                Advertencia: Esta acción es irreversible
              </p>
              <p style={{ color: "#f87171", fontSize: "14px", margin: "0 0 14px", lineHeight: 1.65 }}>
                Las fotos eliminadas <strong>no se pueden recuperar</strong> una vez vaciada la papelera.
                Haz una copia de seguridad de todo lo que quieras conservar antes de continuar.
              </p>
              <a
                href="https://takeout.google.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#4ade80",
                  fontSize: "14px",
                  fontWeight: 600,
                  textDecoration: "none",
                  borderBottom: "1px solid rgba(74,222,128,0.3)",
                  paddingBottom: "1px",
                }}
              >
                Descargar copia de seguridad con Google Takeout
                <IconExternalLink />
              </a>
            </div>
          </div>
        </div>

        {/* ── Steps header ───────────────────────────────────────────── */}
        <h2
          style={{
            fontSize: "19px",
            fontWeight: 700,
            color: "#ffffff",
            margin: "0 0 24px",
            letterSpacing: "-0.3px",
          }}
        >
          Guía paso a paso
        </h2>

        {/* ── Step 1 ─────────────────────────────────────────────────── */}
        <StepCard num={1} total={4} title="Abre Google Photos en una nueva pestaña" done={completedSteps.has(1)}>
          <p style={{ color: "#a3a3a3", marginBottom: "18px", lineHeight: 1.65, fontSize: "14px" }}>
            Haz clic en el botón de abajo para abrir Google Photos. Asegúrate de
            haber iniciado sesión con tu cuenta de Google.
          </p>
          <a
            href="https://photos.google.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => markDone(1)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#4ade80",
              color: "#0f0f0f",
              fontWeight: 700,
              padding: "12px 24px",
              borderRadius: "9px",
              textDecoration: "none",
              fontSize: "15px",
              transition: "all 0.2s ease",
              boxShadow: "0 0 16px rgba(74,222,128,0.2)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.opacity = "0.88";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 24px rgba(74,222,128,0.4)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.opacity = "1";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 16px rgba(74,222,128,0.2)";
            }}
          >
            Abrir Google Photos
            <IconExternalLink />
          </a>
        </StepCard>

        {/* ── Step 2 ─────────────────────────────────────────────────── */}
        <StepCard num={2} total={4} title="Abre la Consola del Navegador" done={completedSteps.has(2)}>
          <p style={{ color: "#a3a3a3", marginBottom: "14px", lineHeight: 1.65, fontSize: "14px" }}>
            Con Google Photos abierto, abre las herramientas del desarrollador usando
            el atajo de teclado de tu navegador:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
            {[
              { browser: "Chrome / Edge", icon: "🌐", shortcut: "F12  ·  Ctrl+Shift+J (Win) / Cmd+Option+J (Mac)" },
              { browser: "Firefox", icon: "🦊", shortcut: "F12  ·  Ctrl+Shift+K (Win) / Cmd+Option+K (Mac)" },
              { browser: "Safari", icon: "🧭", shortcut: 'Preferencias → Avanzado → "Mostrar menú Desarrollar" → Cmd+Option+C' },
            ].map((item) => (
              <div
                key={item.browser}
                style={{
                  backgroundColor: "#0f0f0f",
                  border: "1px solid #252525",
                  borderRadius: "9px",
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <span style={{ fontSize: "18px", flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ color: "#4ade80", fontWeight: 600, fontSize: "13px", marginBottom: "3px" }}>
                    {item.browser}
                  </div>
                  <div style={{ color: "#c9d1d9", fontSize: "13px", fontFamily: "'Menlo','Monaco',monospace" }}>
                    {item.shortcut}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ color: "#5a5a5a", fontSize: "13px", lineHeight: 1.55, margin: 0 }}>
            Ve a la pestaña <strong style={{ color: "#737373" }}>Console</strong> dentro de las herramientas del desarrollador.
          </p>
          <button
            onClick={() => markDone(2)}
            style={{
              marginTop: "14px",
              backgroundColor: "transparent",
              border: "1px solid #2a2a2a",
              borderRadius: "7px",
              padding: "8px 16px",
              color: "#737373",
              fontSize: "13px",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#4ade80";
              (e.currentTarget as HTMLButtonElement).style.color = "#4ade80";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#2a2a2a";
              (e.currentTarget as HTMLButtonElement).style.color = "#737373";
            }}
          >
            ✓ Consola abierta
          </button>
        </StepCard>

        {/* ── Step 3 ─────────────────────────────────────────────────── */}
        <StepCard num={3} total={4} title="Copia el Script" done={completedSteps.has(3)}>
          <p style={{ color: "#a3a3a3", marginBottom: "16px", lineHeight: 1.65, fontSize: "14px" }}>
            Haz clic en <strong style={{ color: "#4ade80" }}>Copiar Script</strong> para copiar el código al portapapeles:
          </p>
          <CodeBlock code={SCRIPT} onCopied={() => markDone(3)} />
        </StepCard>

        {/* ── Step 4 ─────────────────────────────────────────────────── */}
        <StepCard num={4} total={4} title="Pega el Script y Presiona Enter" done={completedSteps.has(4)}>
          <p style={{ color: "#a3a3a3", marginBottom: "16px", lineHeight: 1.65, fontSize: "14px" }}>
            En la consola de Google Photos, ejecuta el script:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
            {[
              { num: "1", text: 'Haz clic dentro de la consola (donde aparece el símbolo ">").' },
              { num: "2", text: "Pega con Ctrl+V (Windows/Linux) o Cmd+V (Mac)." },
              { num: "3", text: "Presiona Enter para ejecutar." },
              { num: "4", text: "Espera el mensaje de confirmación del script. Puede tardar unos segundos." },
            ].map((item) => (
              <div
                key={item.num}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  backgroundColor: "#0f0f0f",
                  border: "1px solid #252525",
                  borderRadius: "9px",
                  padding: "12px 16px",
                }}
              >
                <span
                  style={{
                    backgroundColor: "rgba(74,222,128,0.12)",
                    color: "#4ade80",
                    fontWeight: 700,
                    fontSize: "12px",
                    borderRadius: "5px",
                    padding: "2px 8px",
                    flexShrink: 0,
                    marginTop: "1px",
                  }}
                >
                  {item.num}
                </span>
                <span style={{ color: "#d4d4d4", fontSize: "14px", lineHeight: 1.55 }}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={() => markDone(4)}
            style={{
              backgroundColor: "transparent",
              border: "1px solid #2a2a2a",
              borderRadius: "7px",
              padding: "8px 16px",
              color: "#737373",
              fontSize: "13px",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#4ade80";
              (e.currentTarget as HTMLButtonElement).style.color = "#4ade80";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#2a2a2a";
              (e.currentTarget as HTMLButtonElement).style.color = "#737373";
            }}
          >
            ✓ Script ejecutado
          </button>
        </StepCard>

        {/* ── Progress Tips ──────────────────────────────────────────── */}
        <div
          style={{
            backgroundColor: "#0c1320",
            border: "1px solid rgba(59,130,246,0.25)",
            borderLeft: "4px solid #3b82f6",
            borderRadius: "12px",
            padding: "20px 22px",
            marginTop: "32px",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "13px" }}>
            <span style={{ color: "#3b82f6", flexShrink: 0, marginTop: "1px" }}>
              <IconInfo />
            </span>
            <div>
              <p style={{ color: "#93c5fd", fontWeight: 700, fontSize: "15px", margin: "0 0 12px" }}>
                Cómo funciona el proceso
              </p>
              <ul style={{ color: "#7ea8c9", fontSize: "14px", lineHeight: 1.75, margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <li>El script mueve tus fotos a la papelera en <strong style={{ color: "#93c5fd" }}>lotes</strong>, no todas de una vez.</li>
                <li>Debes <strong style={{ color: "#93c5fd" }}>recargar Google Photos (F5)</strong> y volver a ejecutar el script para procesar el siguiente lote.</li>
                <li>Repite hasta que no queden más fotos en la vista principal.</li>
                <li>Finalmente, ve a <strong style={{ color: "#93c5fd" }}>Papelera → Vaciar papelera</strong> para eliminar permanentemente.</li>
                <li>Las fotos permanecen en la papelera durante <strong style={{ color: "#93c5fd" }}>60 días</strong> si no la vacías manualmente.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── FAQ ───────────────────────────────────────────────────── */}
        <div style={{ marginTop: "44px" }}>
          <h2
            style={{
              fontSize: "19px",
              fontWeight: 700,
              color: "#ffffff",
              margin: "0 0 4px",
              letterSpacing: "-0.3px",
            }}
          >
            Preguntas frecuentes
          </h2>
          <p style={{ color: "#5a5a5a", fontSize: "14px", margin: "0 0 20px" }}>
            Dudas habituales sobre el proceso de limpieza
          </p>
          <div
            style={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #2a2a2a",
              borderRadius: "12px",
              padding: "0 24px",
            }}
          >
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>

        {/* ── Footer ────────────────────────────────────────────────── */}
        <footer
          style={{
            textAlign: "center",
            marginTop: "52px",
            paddingTop: "28px",
            borderTop: "1px solid #1e1e1e",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#141414",
              border: "1px solid #252525",
              borderRadius: "24px",
              padding: "10px 20px",
              marginBottom: "16px",
            }}
          >
            <span style={{ color: "#4ade80" }}><IconShield /></span>
            <p style={{ color: "#5a5a5a", fontSize: "13px", margin: 0 }}>
              Esta herramienta funciona{" "}
              <strong style={{ color: "#737373" }}>completamente en tu navegador</strong>.
              No se envían fotos ni datos a ningún servidor.
            </p>
          </div>
          <p style={{ color: "#3a3a3a", fontSize: "12px", margin: 0 }}>
            Usa esta herramienta bajo tu propia responsabilidad. Haz siempre una copia de seguridad primero.
          </p>
        </footer>
      </div>
    </div>
  );
}
