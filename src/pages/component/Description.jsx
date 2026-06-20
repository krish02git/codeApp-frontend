// component/Description.jsx

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-white/5 rounded-lg ${className}`} />;
}

function Badge({ children, color = "stone" }) {
  const colors = {
    stone:   "text-stone-400 bg-white/5 border-white/8",
    emerald: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    amber:   "text-amber-400 bg-amber-400/10 border-amber-400/20",
    blue:    "text-blue-400 bg-blue-400/10 border-blue-400/20",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${colors[color]}`}>
      {children}
    </span>
  );
}

function SectionHeading({ children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-1 h-4 rounded-full bg-emerald-500 shrink-0" />
      <h3 className="text-[12px] font-black uppercase tracking-widest text-stone-500">{children}</h3>
    </div>
  );
}

function ConstraintRow({ label, value }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 w-32 shrink-0">{label}</span>
      <span className="text-[13px] font-mono text-stone-300">{value}</span>
    </div>
  );
}

function ExampleBlock({ index, input, output, explanation }) {
  return (
    <div className="rounded-xl bg-[#0a0f0d] border border-white/[0.06] overflow-hidden mb-3">
      <div className="px-4 py-2 bg-white/[0.02] border-b border-white/[0.06] flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30
          flex items-center justify-center text-[10px] font-black text-emerald-400">
          {index + 1}
        </span>
        <span className="text-[11px] font-bold uppercase tracking-widest text-stone-600">Example {index + 1}</span>
      </div>
      <div className="p-4 flex flex-col gap-2.5">
        <div className="flex items-start gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-stone-600 pt-[3px] w-20 shrink-0">Input</span>
          <pre className="flex-1 text-[13px] font-mono text-stone-200 whitespace-pre-wrap break-all leading-relaxed">{input}</pre>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-stone-600 pt-[3px] w-20 shrink-0">Output</span>
          <pre className="flex-1 text-[13px] font-mono text-emerald-400 whitespace-pre-wrap break-all leading-relaxed">{output}</pre>
        </div>
        {explanation && (
          <div className="flex items-start gap-3 pt-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-600 pt-[3px] w-20 shrink-0">Note</span>
            <p className="flex-1 text-[12px] text-stone-500 leading-relaxed">{explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Description({ problem, loading, error }) {

  // ── Error state ─────────────────────────────────────────────────────────
  if (!loading && error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/8 border border-red-500/20 rounded-xl p-4 flex gap-3">
          <svg className="text-red-400 shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
          </svg>
          <div>
            <p className="text-[13px] font-semibold text-red-400 mb-1">Failed to load problem</p>
            <p className="text-[12px] font-mono text-stone-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading || !problem) {
    return (
      <div className="p-6 flex flex-col gap-4">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-24 w-full mt-2" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    );
  }

  const examples = problem.visibleTestCases ?? [];
  const constraints = problem.constraints ?? [];

  return (
    <div className="p-5 flex flex-col gap-6 select-text">

      {/* ── Title + meta ── */}
      <div className="flex flex-col gap-3">
        <h1 className="text-[17px] font-black text-stone-100 leading-snug tracking-tight">
          {problem.title}
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          {problem.tags?.map((tag) => (
            <Badge key={tag} color="stone">{tag}</Badge>
          ))}
          {problem.companies?.map?.((co) => (
            <Badge key={co} color="blue">{co}</Badge>
          ))}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-[12px] text-stone-600">
          {problem.acceptanceRate != null && (
            <span className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              {problem.acceptanceRate}% acceptance
            </span>
          )}
          {problem.totalSolved != null && (
            <span className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              {problem.totalSolved.toLocaleString()} solved
            </span>
          )}
        </div>
      </div>

      <div className="w-full h-px bg-white/[0.04]" />

      {/* ── Problem statement ── */}
      {problem.description && (
        <div>
          <SectionHeading>Problem Statement</SectionHeading>
          <div
            className="text-[13.5px] text-stone-400 leading-[1.8] tracking-[0.01em]
              [&_code]:text-emerald-400 [&_code]:bg-emerald-400/8 [&_code]:px-1.5 [&_code]:py-0.5
              [&_code]:rounded [&_code]:font-mono [&_code]:text-[12px]
              [&_strong]:text-stone-200 [&_strong]:font-semibold
              [&_em]:text-stone-300
              [&_ul]:mt-2 [&_ul]:ml-4 [&_ul]:space-y-1
              [&_li]:list-disc [&_li]:text-stone-400
              [&_p]:mb-3"
            dangerouslySetInnerHTML={{ __html: problem.description }}
          />
        </div>
      )}

      {/* ── Examples ── */}
      {examples.length > 0 && (
        <div>
          <SectionHeading>Examples</SectionHeading>
          {examples.map((tc, i) => (
            <ExampleBlock
              key={i}
              index={i}
              input={tc.input}
              output={tc.output}
              explanation={tc.explanation}
            />
          ))}
        </div>
      )}

      {/* ── Constraints ── */}
      {constraints.length > 0 && (
        <div>
          <SectionHeading>Constraints</SectionHeading>
          <div className="rounded-xl bg-[#0a0f0d] border border-white/[0.06] px-4 py-1 divide-y divide-white/[0.04]">
            {constraints.map((c, i) => (
              <div key={i} className="py-2.5 text-[13px] font-mono text-stone-400 leading-relaxed
                [&_code]:text-amber-400">
                <span className="text-stone-600 mr-2 select-none">•</span>
                {c}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Follow-up ── */}
      {problem.followUp && (
        <div className="rounded-xl bg-amber-400/5 border border-amber-400/15 px-4 py-3.5 flex gap-3">
          <svg className="text-amber-400 shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
          </svg>
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-amber-500 mb-1">Follow-up</p>
            <p className="text-[13px] text-stone-400 leading-relaxed">{problem.followUp}</p>
          </div>
        </div>
      )}

      {/* bottom padding */}
      <div className="h-4" />
    </div>
  );
}