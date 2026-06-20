import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../../utils/axiosClient";

function Spinner() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
    </span>
  );
}

function BotAvatar() {
  return (
    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600
      flex items-center justify-center shrink-0 shadow-lg shadow-emerald-900/40 self-end mb-1">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
        <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7H3a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 12 2z"/>
        <path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/>
        <circle cx="9" cy="17" r="1" fill="white" stroke="none"/>
        <circle cx="15" cy="17" r="1" fill="white" stroke="none"/>
      </svg>
    </div>
  );
}

// ── Inline renderer: bold, inline-code, $math$, plain text ───────────────────
function renderInline(text, keyPrefix = "") {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\$[^$]+\$)/g);
  return parts.map((seg, j) => {
    if (seg.startsWith("**") && seg.endsWith("**"))
      return <strong key={`${keyPrefix}-${j}`} className="font-bold text-stone-100">{seg.slice(2, -2)}</strong>;
    if (seg.startsWith("`") && seg.endsWith("`"))
      return (
        <code key={`${keyPrefix}-${j}`} className="px-1.5 py-0.5 mx-0.5 rounded bg-black/40
          border border-white/10 text-[11px] font-mono text-emerald-300">
          {seg.slice(1, -1)}
        </code>
      );
    if (seg.startsWith("$") && seg.endsWith("$"))
      return (
        <code key={`${keyPrefix}-${j}`} className="px-1.5 py-0.5 mx-0.5 rounded bg-amber-500/10
          border border-amber-500/20 text-[11px] font-mono text-amber-300">
          {seg.slice(1, -1)}
        </code>
      );
    return <span key={`${keyPrefix}-${j}`}>{seg}</span>;
  });
}

// ── Block renderer: handles full markdown ─────────────────────────────────────
function renderContent(text) {
  if (!text) return null;
  const lines = text.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trimStart();

    // ── fenced code block ```
    if (line.startsWith("```")) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre key={`code-${i}`} className="my-2 bg-black/50 border border-white/8 rounded-xl
          px-4 py-3 text-[12px] font-mono text-emerald-300 whitespace-pre-wrap overflow-x-auto
          leading-relaxed">
          {codeLines.join("\n")}
        </pre>
      );
      i++;
      continue;
    }

    // ── heading ###
    const h = line.match(/^(#{1,3})\s+(.*)/);
    if (h) {
      const lvl = h[1].length;
      const cls = lvl === 1
        ? "text-[15px] font-black text-stone-100 mt-4 mb-1.5"
        : lvl === 2
          ? "text-[14px] font-extrabold text-stone-100 mt-3 mb-1"
          : "text-[13px] font-bold text-emerald-400 mt-2.5 mb-0.5";
      elements.push(<p key={`h-${i}`} className={cls}>{renderInline(h[2], `h-${i}`)}</p>);
      i++;
      continue;
    }

    // ── horizontal rule ---
    if (line.match(/^-{3,}$/) || line.match(/^\*{3,}$/)) {
      elements.push(<hr key={`hr-${i}`} className="border-white/8 my-3" />);
      i++;
      continue;
    }

    // ── bullet list  * or -
    if (line.match(/^[-*]\s+/)) {
      const items = [];
      while (i < lines.length && lines[i].trimStart().match(/^[-*]\s+/)) {
        const content = lines[i].trimStart().replace(/^[-*]\s+/, "");
        items.push(
          <li key={`li-${i}`} className="flex items-start gap-2 text-stone-300 text-[13px]">
            <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="leading-relaxed">{renderInline(content, `li-${i}`)}</span>
          </li>
        );
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="flex flex-col gap-1.5 my-1.5 ml-0.5">{items}</ul>
      );
      continue;
    }

    // ── numbered list  1. 2.
    if (line.match(/^\d+\.\s+/)) {
      const items = [];
      let n = 1;
      while (i < lines.length && lines[i].trimStart().match(/^\d+\.\s+/)) {
        const content = lines[i].trimStart().replace(/^\d+\.\s+/, "");
        items.push(
          <li key={`nl-${i}`} className="flex items-start gap-2 text-stone-300 text-[13px]">
            <span className="shrink-0 w-5 h-5 rounded-md bg-emerald-500/15 border border-emerald-500/25
              text-emerald-400 text-[10px] font-black flex items-center justify-center mt-0.5">
              {n++}
            </span>
            <span className="leading-relaxed">{renderInline(content, `nl-${i}`)}</span>
          </li>
        );
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="flex flex-col gap-1.5 my-1.5 ml-0.5">{items}</ol>
      );
      continue;
    }

    // ── blank line → small gap
    if (line.trim() === "") {
      elements.push(<div key={`gap-${i}`} className="h-2" />);
      i++;
      continue;
    }

    // ── plain paragraph
    elements.push(
      <p key={`p-${i}`} className="text-[13px] text-stone-300 leading-relaxed">
        {renderInline(line, `p-${i}`)}
      </p>
    );
    i++;
  }

  return <div className="flex flex-col gap-0.5">{elements}</div>;
}

// ── Typewriter ────────────────────────────────────────────────────────────────
function TypewriterMessage({ fullText, onDone }) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayed("");

    const charsPerTick = Math.max(1, Math.ceil(fullText.length / 400));
    const interval = setInterval(() => {
      indexRef.current += charsPerTick;
      const next = fullText.slice(0, indexRef.current);
      setDisplayed(next);
      if (next.length >= fullText.length) {
        clearInterval(interval);
        setDisplayed(fullText);
        onDone?.();
      }
    }, 16);

    return () => clearInterval(interval);
  }, [fullText]);

  return (
    <>
      {renderContent(displayed)}
      {displayed.length < fullText.length && (
        <span className="inline-block w-[2px] h-[13px] bg-emerald-400 ml-0.5
          align-middle animate-pulse rounded-full" />
      )}
    </>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function Chat({ problem, loading, messages, setMessages }) {
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({ mode: "onChange" });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const onSubmit = async ({ message }) => {
    setMessages((prev) => [...prev, { role: "user", content: message, typing: false }]);
    reset();
    setThinking(true);

    try {
      const { data } = await axiosClient.post("/chat/ai", {
        message,
        problem: problem
          ? { title: problem.title, description: problem.description }
          : null,
      });

      const reply =
        data?.reply ?? data?.message ?? data?.content ??
        "Sorry, I couldn't generate a response. Try again!";

      setThinking(false);
      setMessages((prev) => [...prev, { role: "assistant", content: reply, typing: true }]);
    } catch (err) {
      const errMsg = err.response?.data?.message ?? err.message ?? "Connection error";
      setThinking(false);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ ${errMsg}`, typing: true },
      ]);
    }
  };

  const markDone = (idx) => {
    setMessages((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, typing: false } : m))
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#060807]">

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4
        [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/8 [&::-webkit-scrollbar-thumb]:rounded-full">

        {messages.map((msg, idx) => {
          const isBot = msg.role === "assistant";
          return (
            <div key={idx} className={`flex items-end gap-2 ${isBot ? "justify-start" : "justify-end"}`}>

              {isBot && <BotAvatar />}

              <div className={`relative max-w-[85%] px-4 py-3 text-[13px] leading-relaxed
                ${isBot
                  ? "bg-[#0f1a14] border border-white/8 text-stone-300 rounded-2xl rounded-bl-sm shadow-lg shadow-black/30"
                  : "bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-2xl rounded-br-sm shadow-lg shadow-emerald-900/40"
                }`}>
                {isBot && msg.typing
                  ? <TypewriterMessage fullText={msg.content} onDone={() => markDone(idx)} />
                  : renderContent(msg.content)
                }
              </div>

              {!isBot && (
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-stone-600 to-stone-700
                  flex items-center justify-center shrink-0 shadow-md self-end mb-1">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                </div>
              )}
            </div>
          );
        })}

        {thinking && (
          <div className="flex items-end gap-2 justify-start">
            <BotAvatar />
            <div className="bg-[#0f1a14] border border-white/8 rounded-2xl rounded-bl-sm
              px-4 py-3 shadow-lg shadow-black/30">
              <Spinner />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div className="shrink-0 px-4 py-3 border-t border-white/6 bg-[#0a0d0c]">
        {errors.message && (
          <p className="text-[11px] text-red-400/80 mb-1.5 ml-1">{errors.message.message}</p>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="flex items-end gap-2">
          <textarea
            rows={1}
            placeholder="Ask for a hint, explain your approach…"
            disabled={thinking || loading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (isValid && !thinking) handleSubmit(onSubmit)();
              }
            }}
            {...register("message", {
              required: "Please type a message",
              minLength: { value: 2, message: "Message too short" },
            })}
            className="flex-1 resize-none bg-[#111714] border border-white/10 rounded-xl
              px-4 py-2.5 text-[13px] text-stone-200 placeholder-stone-600
              focus:outline-none focus:border-emerald-500/40 focus:bg-[#131a15]
              disabled:opacity-40 transition-all leading-relaxed
              [&::-webkit-scrollbar]:hidden max-h-32 overflow-y-auto"
            style={{ fieldSizing: "content" }}
          />
          <button
            type="submit"
            disabled={thinking || loading || !isValid}
            className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0
              bg-gradient-to-br from-emerald-500 to-emerald-600
              hover:from-emerald-400 hover:to-emerald-500
              disabled:opacity-30 disabled:cursor-not-allowed
              shadow-lg shadow-emerald-900/40 transition-all cursor-pointer"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </form>
        <p className="text-[10px] text-stone-700 mt-1.5 ml-1">
          Press <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/8 text-[9px]">Enter</kbd> to send ·{" "}
          <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/8 text-[9px]">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}