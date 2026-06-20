// component/Solution.jsx
import { useState } from "react";

const LANG_META = {
  cpp:        { label: "C++",        icon: "🔵", monacoHint: "cpp"        },
  javascript: { label: "JavaScript", icon: "🟡", monacoHint: "javascript" },
  python:     { label: "Python",     icon: "🟢", monacoHint: "python"     },
};

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-white/5 rounded-lg ${className}`} />;
}

function SectionHeading({ children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-1 h-4 rounded-full bg-emerald-500 shrink-0" />
      <h3 className="text-[12px] font-black uppercase tracking-widest text-stone-500">{children}</h3>
    </div>
  );
}

function CopyButton({ code }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold
        border transition-all cursor-pointer
        ${copied
          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25"
          : "text-stone-600 bg-transparent border-white/8 hover:text-stone-300 hover:border-white/15"}`}
    >
      {copied ? (
        <>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

function CodeBlock({ code, language }) {
  // Very lightweight syntax-coloring via className hints for display
  return (
    <div className="relative group rounded-xl bg-[#080d0b] border border-white/[0.06] overflow-hidden">
      {/* Line numbers + code */}
      <div className="overflow-x-auto
        [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
        <pre className="p-4 text-[13px] font-mono leading-[1.75] text-stone-300 whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

function LangTab({ lang, meta, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3.5 py-2 text-[12px] font-semibold rounded-lg
        border transition-all cursor-pointer
        ${active
          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
          : "text-stone-600 bg-transparent border-white/8 hover:text-stone-300 hover:border-white/15"}`}
    >
      <span className="text-[14px] leading-none">{meta?.icon ?? "💻"}</span>
      {meta?.label ?? lang}
    </button>
  );
}

function EmptySolution() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center px-6">
      <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/8
        flex items-center justify-center text-2xl">
        🔒
      </div>
      <div>
        <p className="text-[14px] font-semibold text-stone-400 mb-1">Solution not available</p>
        <p className="text-[12px] text-stone-700 max-w-[240px] leading-relaxed">
          The reference solution for this problem hasn't been published yet.
        </p>
      </div>
    </div>
  );
}

export default function Solution({ problem, loading }) {
  const [activeLang, setActiveLang] = useState(null);

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading || !problem) {
    return (
      <div className="p-6 flex flex-col gap-4">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
        <Skeleton className="h-56 w-full mt-1" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    );
  }

  const solutions = problem.referenceSolution ?? [];
  if (solutions.length === 0) return <EmptySolution />;

  // Initialise active lang on first render
  const resolvedLang = activeLang
    ?? (solutions.find((s) => s.language === "cpp") ?? solutions[0])?.language;

  const currentSol = solutions.find((s) => s.language === resolvedLang) ?? solutions[0];

  return (
    <div className="p-5 flex flex-col gap-6 select-text">

      {/* ── Header ── */}
      <div>
        <span className="text-[11px] font-black uppercase tracking-widest text-emerald-500">Reference Solution</span>
        <h2 className="mt-1 text-[16px] font-black text-stone-100 tracking-tight">{problem.title}</h2>
      </div>

      <div className="w-full h-px bg-white/[0.04]" />

      {/* ── Language tabs ── */}
      <div>
        <SectionHeading>Language</SectionHeading>
        <div className="flex flex-wrap gap-2">
          {solutions.map((sol) => (
            <LangTab
              key={sol.language}
              lang={sol.language}
              meta={LANG_META[sol.language]}
              active={resolvedLang === sol.language}
              onClick={() => setActiveLang(sol.language)}
            />
          ))}
        </div>
      </div>

      {/* ── Code block ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <SectionHeading>
            {LANG_META[resolvedLang]?.label ?? resolvedLang} Solution
          </SectionHeading>
          <CopyButton code={currentSol.initialCode ?? ""} />
        </div>

        <CodeBlock
          code={currentSol.initialCode ?? "// No code available"}
          language={resolvedLang}
        />
      </div>

      {/* ── Explanation (if any per-solution) ── */}
      {currentSol.explanation && (
        <div>
          <SectionHeading>Explanation</SectionHeading>
          <div
            className="text-[13.5px] text-stone-400 leading-[1.8]
              [&_code]:text-emerald-400 [&_code]:bg-emerald-400/8 [&_code]:px-1.5 [&_code]:py-0.5
              [&_code]:rounded [&_code]:font-mono [&_code]:text-[12px]
              [&_strong]:text-stone-200 [&_strong]:font-semibold
              [&_p]:mb-3"
            dangerouslySetInnerHTML={{ __html: currentSol.explanation }}
          />
        </div>
      )}

      {/* ── Complexity ── */}
      {(currentSol.timeComplexity || currentSol.spaceComplexity) && (
        <div className="grid grid-cols-2 gap-3">
          {currentSol.timeComplexity && (
            <div className="rounded-xl bg-emerald-400/5 border border-emerald-400/15 p-3.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Time</p>
              <p className="text-[15px] font-black font-mono text-emerald-400">{currentSol.timeComplexity}</p>
            </div>
          )}
          {currentSol.spaceComplexity && (
            <div className="rounded-xl bg-amber-400/5 border border-amber-400/15 p-3.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">Space</p>
              <p className="text-[15px] font-black font-mono text-amber-400">{currentSol.spaceComplexity}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Warning note ── */}
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] px-4 py-3 flex gap-3">
        <svg className="text-stone-700 shrink-0 mt-0.5" width="13" height="13" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
        </svg>
        <p className="text-[11px] text-stone-700 leading-relaxed">
          Try solving the problem yourself before looking at the reference solution.
          Understanding the approach matters more than copying the code.
        </p>
      </div>

      <div className="h-4" />
    </div>
  );
}