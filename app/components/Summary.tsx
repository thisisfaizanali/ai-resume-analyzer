const ScoreRow = ({ title, score }: { title: string, score: number }) => (
    <div className="flex items-center justify-between border-b border-[oklch(1_0_0/10%)] py-3 last:border-b-0">
        <span className="font-mono text-[15px] text-[oklch(0.96_0.006_260)]">{title}</span>
        <span className="font-mono font-bold text-[oklch(0.85_0.19_140)]">[{score}]</span>
    </div>
)

const Summary = ({ feedback }: { feedback: Feedback }) => {
    return (
        <div>
            <div className="mb-5 flex items-baseline gap-5">
                <p className="m-0 font-mono text-[52px] font-semibold text-[oklch(0.85_0.19_140)]">{feedback.overallScore}</p>
                <div>
                    <p className="m-0 font-display text-[15px] font-bold text-[oklch(0.96_0.006_260)]">YOUR RESUME SCORE</p>
                    <p className="m-0 text-xs text-[oklch(0.63_0.014_260)]">Calculated from the variables below</p>
                </div>
            </div>
            <div className="flex flex-col">
                <ScoreRow title="TONE & STYLE" score={feedback.toneAndStyle.score} />
                <ScoreRow title="CONTENT" score={feedback.content.score} />
                <ScoreRow title="STRUCTURE" score={feedback.structure.score} />
                <ScoreRow title="SKILLS" score={feedback.skills.score} />
            </div>
        </div>
    )
}
export default Summary
