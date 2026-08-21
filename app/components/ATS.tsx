import React from 'react'

interface Suggestion {
  type: "good" | "improve";
  tip: string;
}

interface ATSProps {
  score: number;
  suggestions: Suggestion[];
}

const ATS: React.FC<ATSProps> = ({ score, suggestions }) => {
  const verdict = score > 69
    ? 'GREAT JOB'
    : score > 49
      ? 'GOOD START'
      : 'NEEDS IMPROVEMENT';

  return (
    <div className="border border-[oklch(1_0_0/8%)] bg-[oklch(0.21_0.015_260)] p-6">
      <p className="m-0 mb-1.5 font-mono text-[11px] tracking-[0.08em] text-[oklch(0.63_0.014_260)] uppercase">ATS Score</p>
      <p className="m-0 mb-3.5 font-display text-[26px] font-bold text-[oklch(0.96_0.006_260)]">{score}/100 — {verdict}</p>
      <p className="m-0 mb-3.5 text-sm text-[oklch(0.63_0.014_260)]">
        This score reflects how well your resume performs in Applicant Tracking Systems.
      </p>

      <div className="flex flex-col gap-2 font-mono text-[13px]">
        {suggestions.map((suggestion, index) => (
          <p key={index} className="m-0" style={{ color: suggestion.type === "good" ? "oklch(0.85 0.19 140)" : "oklch(0.8 0.19 80)" }}>
            [{suggestion.type === "good" ? "OK" : "!!"}] {suggestion.tip}
          </p>
        ))}
      </div>
    </div>
  )
}

export default ATS
