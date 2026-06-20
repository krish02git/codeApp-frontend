import { useRef, useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import Editor from "@monaco-editor/react";

import Description from "./component/Description";
import Editorial from "./component/Editorial";
import Solution from "./component/Solution";
import Submission from "./component/Submission";
import Chat from "./component/Chat";

import axiosClient from "../utils/axiosClient";
import useTheme from "../theme/useTheme";

const LANG_META = {
  cpp: { label: "C++", monacoLang: "cpp" },
  javascript: { label: "JavaScript", monacoLang: "javascript" },
  python: { label: "Python", monacoLang: "python" },
};

const LANG_ICON = {
  cpp: "🔵",
  javascript: "🟡",
  python: "🟢",
};

const TABS = ["Description", "Editorial", "Solution", "Submission", "Chat"];

const DIFF_STYLE = {
  Easy: { pill: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30", dot: "bg-emerald-400", glow: "shadow-emerald-500/20" },
  Medium: { pill: "text-amber-400   bg-amber-400/10   border-amber-400/30", dot: "bg-amber-400", glow: "shadow-amber-500/20" },
  Hard: { pill: "text-red-400     bg-red-400/10     border-red-400/30", dot: "bg-red-400", glow: "shadow-red-500/20" },
};

function Spinner({ white, size = 13 }) {
  return (
    <span
      style={{ width: size, height: size }}
      className={`inline-block rounded-full border-2 animate-spin shrink-0
        ${white ? "border-white/25 border-t-white" : "border-emerald-400/25 border-t-emerald-400"}`}
    />
  );
}

function IoRow({ label, value, variant }) {
  const valueColor =
    variant === "green" ? "text-emerald-400" :
      variant === "red" ? "text-red-400" : "text-stone-200";
  return (
    <div className="flex items-start gap-3">
      <span className="w-[68px] shrink-0 pt-[5px] text-[10px] font-bold uppercase tracking-widest text-stone-600">
        {label}
      </span>
      <pre className={`flex-1 bg-[#0a0f0d] border border-white/5 rounded-lg px-3 py-2
        text-[13px] font-mono whitespace-pre-wrap break-all leading-relaxed ${valueColor}`}>
        {value ?? ""}
      </pre>
    </div>
  );
}

function useHorizontalResize(initialPct = 42) {
  const [pct, setPct] = useState(initialPct);
  const dragging = useRef(false);
  const containerRef = useRef(null);
  const onMouseDown = useCallback((e) => {
    e.preventDefault(); dragging.current = true;
    document.body.style.cursor = "col-resize"; document.body.style.userSelect = "none";
  }, []);
  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setPct(Math.min(70, Math.max(25, ((e.clientX - rect.left) / rect.width) * 100)));
    };
    const onUp = () => { dragging.current = false; document.body.style.cursor = document.body.style.userSelect = ""; };
    window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);
  return { pct, containerRef, onMouseDown };
}

function useVerticalResize(initialPx = 240) {
  const [px, setPx] = useState(initialPx);
  const dragging = useRef(false);
  const onMouseDown = useCallback((e) => {
    e.preventDefault(); dragging.current = true;
    document.body.style.cursor = "row-resize"; document.body.style.userSelect = "none";
  }, []);
  useEffect(() => {
    const onMove = (e) => { if (!dragging.current) return; setPx(Math.min(420, Math.max(120, window.innerHeight - e.clientY))); };
    const onUp = () => { dragging.current = false; document.body.style.cursor = document.body.style.userSelect = ""; };
    window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);
  return { px, onMouseDown };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function ProblemPage() {
  const { isLight } = useTheme();
  const params = useParams();
  const problemId = params.id ?? params.problemId;
  const navigate = useNavigate();
  const editorRef = useRef(null);

  const [problem, setProblem] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [languages, setLanguages] = useState([]);
  const [activeLang, setActiveLang] = useState(null);
  const [langDropOpen, setLangDropOpen] = useState(false);
  const codeMapRef = useRef({});
  const [editorKey, setEditorKey] = useState(0);

  const [activeTab, setActiveTab] = useState("Description");
  const [activeTC, setActiveTC] = useState(0);
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateScreen = () => setIsMobile(window.innerWidth < 1024);
    updateScreen();
    window.addEventListener("resize", updateScreen);
    return () => window.removeEventListener("resize", updateScreen);
  }, []);

  const [runStatus, setRunStatus] = useState(null);
  const [runResult, setRunResult] = useState(null);
  const [subStatus, setSubStatus] = useState(null);
  const [subResult, setSubResult] = useState(null);

  const { pct, containerRef, onMouseDown: onHDrag } = useHorizontalResize(42);
  const { px: consolePx, onMouseDown: onVDrag } = useVerticalResize(240);

  useEffect(() => {
    if (!langDropOpen) return;
    const h = (e) => { if (!e.target.closest("[data-lang-dropdown]")) setLangDropOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [langDropOpen]);

  useEffect(() => {
    if (!problemId) { setFetchError("No problem ID in URL."); setLoading(false); return; }
    setLoading(true); setFetchError(null); setProblem(null);
    setLanguages([]); setActiveLang(null); codeMapRef.current = {};

    axiosClient.get(`/problem/problemById/${problemId}`)
      .then(({ data }) => {
        setProblem(data);
        const startCodeList = (data.startCode?.length > 0) ? data.startCode : (data.referenceSolution ?? []);
        const langs = (startCodeList ?? []).map((sc) => ({
          value: sc.language,
          label: LANG_META[sc.language]?.label ?? sc.language,
          monacoLang: LANG_META[sc.language]?.monacoLang ?? sc.language,
          initialCode: sc.initialCode ?? "",
        }));
        langs.forEach((l) => { codeMapRef.current[l.value] = l.initialCode; });
        setLanguages(langs);
        if (langs.length > 0) {
          const preferred = langs.find((l) => l.value === "cpp") ?? langs[0];
          setActiveLang(preferred);
          setEditorKey((k) => k + 1);
        }
      })
      .catch((err) => {
        const status = err.response?.status;
        let msg = err.response?.data?.message ?? err.message ?? "Failed to load problem";
        if (status === 401 || status === 403) msg = `Auth error (${status})`;
        else if (status === 404) msg = `Problem not found (404) — ID "${problemId}"`;
        else if (!err.response) msg = "Network error — backend not running or baseURL wrong";
        setFetchError(msg);
      })
      .finally(() => setLoading(false));
  }, [problemId]);

  function selectLang(lang) {
    if (activeLang?.value === lang.value) { setLangDropOpen(false); return; }
    if (activeLang && editorRef.current) codeMapRef.current[activeLang.value] = editorRef.current.getValue();
    setActiveLang(lang); setLangDropOpen(false);
    setRunResult(null); setRunStatus(null); setEditorKey((k) => k + 1);
  }

  function handleEditorMount(editor) { editorRef.current = editor; }

  const currentCode = activeLang ? (codeMapRef.current[activeLang.value] ?? "") : "";

  function getCode() {
    const editorValue = editorRef.current?.getValue?.() ?? "";
    if (activeTab === "Editorial") {
      const ref = problem?.referenceSolution?.find((r) => r.language === activeLang?.value);
      if (ref?.initialCode?.trim()) return ref.initialCode;
    }
    return editorValue.trim() ? editorValue : currentCode;
  }

  const handleRun = useCallback(async () => {
    if (!activeLang) return;
    setRunStatus("running"); setRunResult(null); setSubStatus(null); setSubResult(null);
    try {
      const { data } = await axiosClient.post(`/submission/run/${problemId}`, { code: getCode(), language: activeLang.value });
      setRunResult(data);
      const ok = Array.isArray(data.results) ? data.results.every((r) => r.passed) : data.status === "passed" || data.passed === true;
      setRunStatus(ok ? "passed" : "failed");
    } catch (err) {
      const msg = err.response?.status === 429 ? "Rate limit — slow down ⏱" : err.response?.data?.message ?? err.message ?? "Run failed";
      setRunResult({ error: msg }); setRunStatus("error");
    }
  }, [activeLang, problemId]);

  const handleSubmit = useCallback(async () => {
    if (!activeLang) return;
    setSubStatus("running"); setSubResult(null);
    try {
      const { data } = await axiosClient.post(`/submission/submit/${problemId}`, { code: getCode(), language: activeLang.value });
      setSubResult(data);
      const ok = ["accepted", "Accepted"].includes(data.status) || data.accepted === true || data.passed === true;
      setSubStatus(ok ? "accepted" : "rejected");
    } catch (err) {
      const msg = err.response?.status === 429 ? "Rate limit — slow down ⏱" : err.response?.data?.message ?? err.message ?? "Submit failed";
      setSubResult({ error: msg }); setSubStatus("error");
    }
  }, [activeLang, problemId]);

  const testCases = problem?.visibleTestCases ?? [];
  const busy = runStatus === "running" || subStatus === "running";
  const tcResult = (i) => runResult?.results?.[i] ?? null;
  const diffStyle = DIFF_STYLE[problem?.difficulty] ?? DIFF_STYLE.Easy;

  const submitLabel = () => {
    if (subStatus === "running") return "Judging…";
    if (subStatus === "accepted") return "Accepted!";
    if (subStatus === "rejected") return "Wrong Answer";
    if (subStatus === "error") return "Error";
    return "Submit";
  };
  const submitCls = () => {
    if (subStatus === "accepted") return "from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 shadow-emerald-900/50";
    if (subStatus === "rejected" || subStatus === "error") return "from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-red-900/50";
    return "from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-emerald-900/50";
  };
  // chathistory
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", content: "Hi! I'm your coding assistant. Ask me anything about this problem!", typing: false },
  ]);
  const renderTab = () => {
    switch (activeTab) {
      case "Description": return <Description problem={problem} loading={loading} error={fetchError} />;
      case "Editorial": return <Editorial problem={problem} loading={loading} />;
      case "Solution": return <Solution problem={problem} loading={loading} />;
      case "Submission": return <Submission problem={problem} loading={loading} problemId={problemId} />;
      case "Chat": return (
        <Chat
          problem={problem}
          loading={loading}
          messages={chatMessages}
          setMessages={setChatMessages}
        />
      );
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-screen min-h-screen bg-[#060807] text-stone-300 overflow-auto select-none">

      {/* ════ NAVBAR ════ */}
      <header className="flex flex-col bg-[#0a0d0c] border-b border-white/6 shrink-0">

        {/* ── Row 1: Back · Logo · Problem title + difficulty ── */}
        <div className="flex items-center gap-3 px-4 py-3">

          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-stone-400
              hover:text-emerald-400 hover:bg-emerald-400/8 border border-transparent
              hover:border-emerald-400/20 transition-all cursor-pointer shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </button>

          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-white/8 shrink-0" />

          {/* Logo */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5
            border border-white/8 text-[12px] font-bold text-stone-300 shrink-0">
            <span className="text-emerald-400">&lt;</span>
            code
            <span className="text-emerald-400">/&gt;</span>
          </div>

          {/* Divider */}
          {problem && <div className="hidden sm:block w-px h-6 bg-white/8 shrink-0" />}

          {/* Problem title + difficulty */}
          {problem && (
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Difficulty badge — always fully visible */}
              <span className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg
                text-[12px] font-black uppercase tracking-wider border shadow-lg
                ${diffStyle.pill} ${diffStyle.glow}`}>
                <span className={`w-2 h-2 rounded-full ${diffStyle.dot}`} />
                {problem.difficulty}
              </span>

              {/* Title */}
              <span className="text-[15px] font-semibold text-stone-100 truncate">
                {problem.title}
              </span>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && !problem && (
            <div className="flex items-center gap-3 flex-1">
              <div className="h-7 w-20 rounded-lg bg-white/5 animate-pulse" />
              <div className="h-5 w-48 rounded bg-white/5 animate-pulse" />
            </div>
          )}
        </div>

        {/* ── Row 2: Language · Run · Submit (right-aligned on desktop) ── */}
        <div className="flex items-center gap-2 px-4 pb-3 sm:justify-end">

          {/* Language Dropdown */}
          <div className="relative flex-1 sm:flex-none sm:w-[155px]" data-lang-dropdown>
            <button
              onClick={() => setLangDropOpen((p) => !p)}
              disabled={loading}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-semibold
                border transition-all cursor-pointer
                disabled:opacity-40 disabled:cursor-not-allowed
                ${langDropOpen
                  ? "bg-emerald-500/12 border-emerald-500/40 text-emerald-300"
                  : "text-stone-300 bg-[#111714] border-white/12 hover:border-emerald-500/30 hover:text-emerald-300"}`}
            >
              <span className="text-[16px] leading-none shrink-0">
                {loading ? "⏳" : (LANG_ICON[activeLang?.value] ?? "💻")}
              </span>
              <span className="flex-1 text-left truncate">
                {loading ? "Loading…" : (activeLang?.label ?? "Language")}
              </span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
                className={`text-stone-500 shrink-0 transition-transform duration-150 ${langDropOpen ? "rotate-180" : ""}`}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {langDropOpen && (
              <div className="absolute top-[calc(100%+6px)] left-0 sm:left-auto sm:right-0 w-48
                bg-[#0d1210] border border-white/12 rounded-xl overflow-hidden
                z-[9999] shadow-2xl shadow-black/80">
                <div className="px-3 pt-2.5 pb-1.5 border-b border-white/6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-600">Language</span>
                </div>
                {languages.length === 0 ? (
                  <div className="px-3 py-3 text-[12px] text-stone-600">No languages available</div>
                ) : (
                  languages.map((l) => (
                    <button key={l.value} onClick={() => selectLang(l)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px]
                        transition-colors cursor-pointer
                        ${activeLang?.value === l.value
                          ? "text-emerald-400 bg-emerald-500/12 font-semibold"
                          : "text-stone-400 hover:text-stone-200 hover:bg-white/5"}`}>
                      <span className="text-[15px] shrink-0">{LANG_ICON[l.value] ?? "💻"}</span>
                      {l.label}
                      {activeLang?.value === l.value && (
                        <svg className="ml-auto shrink-0" width="12" height="12" viewBox="0 0 24 24"
                          fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Run */}
          <button onClick={handleRun} disabled={busy || loading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-bold shrink-0
              text-stone-200 bg-white/6 border border-white/10
              hover:bg-emerald-500/15 hover:border-emerald-500/40 hover:text-emerald-300
              disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
            {runStatus === "running" ? <Spinner /> : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z" /></svg>
            )}
            Run
          </button>

          {/* Submit */}
          <button onClick={handleSubmit} disabled={busy || loading}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-bold shrink-0
              text-white bg-gradient-to-r shadow-lg
              disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer ${submitCls()}`}>
            {subStatus === "running" ? <Spinner white /> :
              subStatus === "accepted" ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
              )}
            {submitLabel()}
          </button>
        </div>
      </header>

      {/* ════ BODY ════ */}
      <div ref={containerRef} className="flex flex-col lg:flex-row flex-1 overflow-hidden">

        {/* LEFT PANEL */}
        <div className="flex flex-col overflow-hidden bg-[#060807] border-r border-white/[0.05] min-w-0"
          style={{ width: isMobile ? "100%" : `${pct}%`, minWidth: 0, maxWidth: isMobile ? "100%" : "68%" }}>

          <div className="flex flex-wrap items-center gap-0.5 px-2 pt-1 pb-2 bg-[#0a0d0c] border-b border-white/[0.06] shrink-0">
            {TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`relative px-3.5 py-2.5 text-[13px] font-medium rounded-t-md transition-colors cursor-pointer
                  ${activeTab === tab ? "text-emerald-400" : "text-stone-600 hover:text-stone-400"}`}>
                {tab}
                {activeTab === tab && <span className="absolute bottom-0 inset-x-2 h-[2px] bg-emerald-500 rounded-full" />}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto select-text">
            {renderTab()}
          </div>
        </div>

        {/* HORIZONTAL DRAG */}
        <div onMouseDown={onHDrag}
          className="hidden lg:flex w-[5px] shrink-0 cursor-col-resize hover:bg-emerald-500/20 active:bg-emerald-500/40 transition-colors group relative">
          <div className="absolute inset-y-0 left-[2px] w-px bg-white/[0.05] group-hover:bg-emerald-500/30 transition-colors" />
        </div>

        {/* RIGHT PANEL */}
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">

          {/* Editor header */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#0a0d0c] border-b border-white/[0.06] shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[15px] leading-none">{LANG_ICON[activeLang?.value] ?? "💻"}</span>
              <span className="text-[12px] font-semibold text-stone-400">{activeLang?.label ?? "—"}</span>
              {loading && <span className="text-[11px] text-stone-600 animate-pulse ml-1">Loading…</span>}
            </div>
            <span className="text-[11px] text-stone-700 font-mono">
              {activeLang
                ? `solution.${activeLang.value === "cpp" ? "cpp" : activeLang.value === "javascript" ? "js" : "py"}`
                : ""}
            </span>
          </div>

          <div className="flex-1 overflow-hidden">
            <Editor
              key={editorKey}
              height="100%"
              language={activeLang?.monacoLang ?? "plaintext"}
              defaultValue={currentCode}
              theme={isLight ? "vs" : "vs-dark"}
              onMount={handleEditorMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineHeight: 22,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                fontFamily: "'Fira Code','Cascadia Code','JetBrains Mono',monospace",
                fontLigatures: true,
                renderLineHighlight: "line",
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                padding: { top: 18, bottom: 18 },
                scrollbar: { verticalScrollbarSize: 4, horizontalScrollbarSize: 4 },
              }}
            />
          </div>

          {/* VERTICAL DRAG */}
          <div onMouseDown={onVDrag}
            className="h-[5px] shrink-0 cursor-row-resize hover:bg-emerald-500/20 active:bg-emerald-500/40 transition-colors group relative">
            <div className="absolute inset-x-0 top-[2px] h-px bg-white/[0.05] group-hover:bg-emerald-500/30 transition-colors" />
          </div>

          {/* CONSOLE */}
          <div className="shrink-0 flex flex-col bg-[#060807] overflow-hidden" style={{ height: consolePx }}>

            <div className="flex items-center justify-between px-4 py-2 bg-[#0a0d0c] border-b border-white/[0.06] shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-widest text-stone-600 mr-1">Testcases</span>
                {testCases.map((_, i) => {
                  const r = tcResult(i);
                  return (
                    <button key={i} onClick={() => setActiveTC(i)}
                      className={`flex items-center gap-1.5 px-3 py-1 text-[12px] font-semibold
                        rounded-md border transition-all cursor-pointer
                        ${activeTC === i
                          ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-400"
                          : "bg-transparent border-white/8 text-stone-600 hover:text-stone-300 hover:border-white/15"}`}>
                      {r
                        ? <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${r.passed ? "bg-emerald-400" : "bg-red-400"}`} />
                        : <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-stone-700" />}
                      Case {i + 1}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                {runStatus === "passed" && <span className="flex items-center gap-1.5 text-[12px] font-bold text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> All cases passed</span>}
                {runStatus === "failed" && <span className="flex items-center gap-1.5 text-[12px] font-bold text-red-400"><span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Wrong answer</span>}
                {runStatus === "error" && <span className="text-[12px] font-bold text-amber-400">Runtime error</span>}
                <button onClick={() => setConsoleOpen((p) => !p)}
                  className="text-[11px] font-semibold text-stone-600 hover:text-stone-400
                    flex items-center gap-1 transition-colors cursor-pointer px-2 py-1 rounded hover:bg-white/5">
                  {consoleOpen
                    ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6 6-6-6" /></svg>
                    : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 9l-6-6-6 6" /></svg>}
                  Console
                </button>
              </div>
            </div>

            {consoleOpen && (
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3
                [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
                {loading ? (
                  <div className="flex items-center gap-2 text-stone-700 text-xs"><Spinner size={11} /> Loading test cases…</div>
                ) : testCases.length === 0 ? (
                  <span className="text-stone-700 text-xs">No visible test cases.</span>
                ) : (
                  <>
                    <IoRow label="Input" value={testCases[activeTC]?.input} />
                    <IoRow label="Expected" value={testCases[activeTC]?.output} />
                    {runStatus === "running" && (
                      <div className="flex items-center gap-2.5 text-[12px] text-emerald-400">
                        <Spinner /> Running test cases…
                      </div>
                    )}
                    {runStatus === "error" && (
                      <div className="text-[12px] text-amber-400 bg-amber-500/8 border border-amber-500/20 rounded-lg px-3 py-2 font-mono">
                        ✗ {runResult?.error}
                      </div>
                    )}
                    {(runStatus === "passed" || runStatus === "failed") && (() => {
                      const r = tcResult(activeTC);
                      if (!r) return null;
                      const outputValue = r.passed
                        ? (r.output ? `${r.output} Testcase passed` : "Testcase passed")
                        : (r.output ? `${r.output} Testcase failed` : "Testcase failed");
                      return <IoRow label="Output" value={outputValue} variant={r.passed ? "green" : "red"} />;
                    })()}
                    {subStatus && subStatus !== "running" && (
                      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold
                        ${subStatus === "accepted"
                          ? "bg-emerald-500/8 border border-emerald-500/20 text-emerald-400"
                          : "bg-red-500/8 border border-red-500/20 text-red-400"}`}>
                        {subStatus === "accepted"
                          ? "✓ Accepted — all test cases passed!"
                          : subStatus === "rejected"
                            ? `✗ Wrong Answer${subResult?.failedCase ? ` on case ${subResult.failedCase}` : ""}`
                            : `✗ ${subResult?.error}`}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProblemPage;
