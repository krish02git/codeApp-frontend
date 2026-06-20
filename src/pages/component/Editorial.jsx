// component/Editorial.jsx
import { useState } from "react";
import Description from "./Description";
import Solution from "./Solution";

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-white/5 rounded-lg ${className}`} />;
}

function SectionHeading({ children, icon }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon && <span className="text-[15px] leading-none">{icon}</span>}
      <span className="w-1 h-4 rounded-full bg-emerald-500 shrink-0" />
      <h3 className="text-[12px] font-black uppercase tracking-widest text-stone-500">{children}</h3>
    </div>
  );
}

function ComplexityBadge({ label, value, color }) {
  const colors = {
    emerald: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    amber:   "text-amber-400   bg-amber-400/10   border-amber-400/20",
    blue:    "text-blue-400    bg-blue-400/10    border-blue-400/20",
  };
  return (
    <div className={`flex flex-col items-center gap-1 px-5 py-3 rounded-xl border ${colors[color]}`}>
      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</span>
      <span className="text-[15px] font-black font-mono">{value}</span>
    </div>
  );
}

function StepCard({ number, title, description }) {
  return (
    <div className="flex gap-4 py-3.5 border-b border-white/[0.04] last:border-0">
      <div className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/30
        flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-[11px] font-black text-emerald-400">{number}</span>
      </div>
      <div className="flex-1 min-w-0">
        {title && <p className="text-[13px] font-semibold text-stone-200 mb-1">{title}</p>}
        <p className="text-[13px] text-stone-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function ApproachTab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2 text-[12px] font-semibold rounded-lg transition-all cursor-pointer
        ${active
          ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/30"
          : "text-stone-600 hover:text-stone-400 border border-transparent hover:border-white/8"}`}
    >
      {label}
    </button>
  );
}

function EmptyEditorial() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center px-6">
      <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/8
        flex items-center justify-center text-2xl">
        📝
      </div>
      <div>
        <p className="text-[14px] font-semibold text-stone-400 mb-1">No editorial yet</p>
        <p className="text-[12px] text-stone-700 max-w-[240px] leading-relaxed">
          The editorial for this problem hasn't been published yet. Check back later!
        </p>
      </div>
    </div>
  );
}

export default function Editorial({ problem, loading }) {

  const [activeApproach, setActiveApproach] = useState(0);

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading || !problem) {
    return (
      <div className="p-6 flex flex-col gap-5">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/5" />
        <div className="flex gap-3 mt-2">
          <Skeleton className="h-16 w-24" />
          <Skeleton className="h-16 w-24" />
        </div>
        <Skeleton className="h-32 w-full mt-2" />
      </div>
    );
  }

  const editorial = problem.editorial;
  const hasEditorial = Boolean(editorial);

  // If there is no editorial, show the same view as Description + Solution.
  if (!hasEditorial) {
    return (
      <div className="space-y-8">
        <Description problem={problem} loading={loading} error={null} />
        <Solution problem={problem} loading={loading} />
      </div>
    );
  }

  // Support both single editorial object and array of approaches
  const approaches = Array.isArray(editorial) ? editorial : [editorial];
  const current    = approaches[activeApproach] ?? approaches[0];

  return (
    <div className="space-y-8">
      <Description problem={problem} loading={loading} error={null} />
      <Solution problem={problem} loading={loading} />
      <div className="p-5 flex flex-col gap-6 select-text">

      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-black uppercase tracking-widest text-emerald-500">Editorial</span>
        </div>
        <h2 className="text-[16px] font-black text-stone-100 tracking-tight">{problem.title}</h2>
      </div>

      <div className="w-full h-px bg-white/[0.04]" />

      {/* ── Approach tabs (if multiple) ── */}
      {approaches.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {approaches.map((a, i) => (
            <ApproachTab
              key={i}
              label={a.title ?? `Approach ${i + 1}`}
              active={activeApproach === i}
              onClick={() => setActiveApproach(i)}
            />
          ))}
        </div>
      )}

      {/* ── Approach title ── */}
      {current.title && (
        <div>
          <SectionHeading>Approach</SectionHeading>
          <h3 className="text-[15px] font-bold text-stone-200">{current.title}</h3>
        </div>
      )}

      {/* ── Intuition / Overview ── */}
      {current.intuition && (
        <div>
          <SectionHeading>Intuition</SectionHeading>
          <div
            className="text-[13.5px] text-stone-400 leading-[1.8]
              [&_code]:text-emerald-400 [&_code]:bg-emerald-400/8 [&_code]:px-1.5 [&_code]:py-0.5
              [&_code]:rounded [&_code]:font-mono [&_code]:text-[12px]
              [&_strong]:text-stone-200 [&_strong]:font-semibold
              [&_p]:mb-3"
            dangerouslySetInnerHTML={{ __html: current.intuition }}
          />
        </div>
      )}

      {/* ── Algorithm steps ── */}
      {current.steps?.length > 0 && (
        <div>
          <SectionHeading>Algorithm</SectionHeading>
          <div className="bg-[#0a0f0d] border border-white/[0.06] rounded-xl px-4 py-1">
            {current.steps.map((step, i) => (
              <StepCard
                key={i}
                number={i + 1}
                title={typeof step === "object" ? step.title : undefined}
                description={typeof step === "object" ? step.description : step}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Complexity ── */}
      {(current.timeComplexity || current.spaceComplexity) && (
        <div>
          <SectionHeading>Complexity Analysis</SectionHeading>
          <div className="flex gap-3 flex-wrap">
            {current.timeComplexity  && <ComplexityBadge label="Time"  value={current.timeComplexity}  color="emerald" />}
            {current.spaceComplexity && <ComplexityBadge label="Space" value={current.spaceComplexity} color="amber"   />}
          </div>
          {current.complexityNote && (
            <p className="mt-3 text-[12px] text-stone-600 leading-relaxed">{current.complexityNote}</p>
          )}
        </div>
      )}

      {/* ── Explanation prose (optional free-form) ── */}
      {current.explanation && (
        <div>
          <SectionHeading>Explanation</SectionHeading>
          <div
            className="text-[13.5px] text-stone-400 leading-[1.8]
              [&_code]:text-emerald-400 [&_code]:bg-emerald-400/8 [&_code]:px-1.5 [&_code]:py-0.5
              [&_code]:rounded [&_code]:font-mono [&_code]:text-[12px]
              [&_strong]:text-stone-200 [&_strong]:font-semibold
              [&_p]:mb-3 [&_ul]:ml-4 [&_li]:list-disc [&_li]:mb-1"
            dangerouslySetInnerHTML={{ __html: current.explanation }}
          />
        </div>
      )}

      {/* ── Key takeaway ── */}
      {current.takeaway && (
        <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/15 px-4 py-3.5 flex gap-3">
          <span className="text-emerald-400 shrink-0 mt-0.5 text-[15px]">💡</span>
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-emerald-600 mb-1">Key Takeaway</p>
            <p className="text-[13px] text-stone-400 leading-relaxed">{current.takeaway}</p>
          </div>
        </div>
      )}

      <div className="h-4" />
    </div>
  </div>
  );
}