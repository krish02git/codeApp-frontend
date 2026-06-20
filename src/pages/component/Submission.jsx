import { useEffect, useState } from "react";
import axiosClient from "../../utils/axiosClient";

const STATUS_STYLES = {
  Accepted:       "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "Wrong Answer": "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Error:          "text-red-400 bg-red-500/10 border-red-500/20",
  Pending:        "text-stone-300 bg-white/10 border-white/20",
};

export default function Submission({ problemId }) {
  const [submissions, setSubmissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!problemId) return;
    setLoading(true);
    setError(null);

    axiosClient
      .get(`/problem/submittedProblems/${problemId}`)
      .then(({ data }) => {
        if (Array.isArray(data)) {
          setSubmissions(data);
        } else {
          setSubmissions([]);
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message ?? err.message ?? "Failed to load submissions");
      })
      .finally(() => setLoading(false));
  }, [problemId]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-3 w-56 bg-white/10 rounded-full animate-pulse" />
        <div className="mt-3 h-3 w-40 bg-white/10 rounded-full animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-sm text-stone-300">
        <div className="text-red-400 font-semibold mb-2">Unable to load your submissions</div>
        <pre className="whitespace-pre-wrap break-all bg-[#0c120f] border border-white/10 rounded-lg p-3 text-[13px]">{error}</pre>
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="p-6 text-sm text-stone-300">
        <div className="text-stone-400">No submissions yet for this problem.</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {submissions.map((submission) => {
        const status = submission.status ?? "Pending";
        const badge = STATUS_STYLES[status] ?? STATUS_STYLES.Pending;

        return (
          <div key={submission._id} className="bg-[#0b1310] border border-white/10 rounded-xl p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex gap-2 items-center">
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${badge}`}>{status}</span>
                <span className="text-[12px] text-stone-400">{submission.language}</span>
              </div>
              <div className="flex gap-2 text-[12px] text-stone-400">
                <span>⏱ {submission.runtime} ms</span>
                <span>💾 {submission.memory} KB</span>
                <span>
                  ✅ {submission.testCasesPassed}/{submission.testCasesTotal}
                </span>
              </div>
            </div>

            {submission.errorMessage ? (
              <div className="mt-3 text-[12px] text-red-300">{submission.errorMessage}</div>
            ) : null}

            <details className="mt-3 bg-white/5 border border-white/10 rounded-lg">
              <summary className="px-3 py-2 cursor-pointer text-[13px] font-medium text-stone-200">
                View submitted code
              </summary>
              <pre className="p-3 text-[12px] leading-relaxed text-stone-200 overflow-x-auto bg-[#030504] border-t border-white/10">
                {submission.code}
              </pre>
            </details>

            <div className="mt-3 text-[11px] text-stone-500">
              Submitted: {new Date(submission.createdAt).toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );
}
