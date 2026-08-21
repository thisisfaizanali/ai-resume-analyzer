import {Link} from "react-router";
import {useEffect, useState} from "react";
import {createPortal} from "react-dom";
import {usePuterStore} from "~/lib/puter";

const BAR_HEIGHTS = [8, 14, 20, 26, 32];

const scoreColor = (score: number) => {
    if (score > 70) return "oklch(0.85 0.19 140)";
    if (score > 49) return "oklch(0.8 0.19 80)";
    return "oklch(0.75 0.19 25)";
};

const ResumeCard = ({ resume: { id, companyName, jobTitle, feedback, imagePath, archived }, onToggleArchive, onDelete }: { resume: Resume, onToggleArchive?: (id: string) => void, onDelete?: (id: string) => void }) => {
    const { fs } = usePuterStore();
    const [resumeUrl, setResumeUrl] = useState('');
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const score = feedback.overallScore;
    const color = scoreColor(score);
    const filledBars = Math.min(5, Math.max(0, Math.round(score / 20)));

    useEffect(() => {
        const loadResume = async () => {
            const blob = await fs.read(imagePath);
            if(!blob) return;
            let url = URL.createObjectURL(blob);
            setResumeUrl(url);
        }

        loadResume();
    }, [imagePath]);

    return (
        <>
        <Link
            to={`/resume/${id}`}
            className="block border border-[oklch(1_0_0/8%)] bg-[oklch(0.21_0.015_260)] transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-1.5 hover:border-[var(--score-color)]/50 hover:shadow-[0_16px_40px_oklch(0_0_0/40%)]"
            style={{ "--score-color": color } as React.CSSProperties}
        >
            <div className="flex items-start justify-between gap-2 p-5">
                <div className="min-w-0">
                    <p className="mb-1 truncate font-display text-xl font-bold text-[oklch(0.96_0.006_260)]">
                        {companyName || "Resume"}
                    </p>
                    {jobTitle && (
                        <p className="truncate font-mono text-[13px] text-[oklch(0.63_0.014_260)]">{jobTitle}</p>
                    )}
                </div>
                <div className="shrink-0 text-right">
                    <p className="font-mono text-[22px] font-semibold" style={{ color }}>{score}/100</p>
                    <div className="mt-2 flex items-end justify-end gap-[3px]">
                        {BAR_HEIGHTS.map((height, i) => (
                            <div
                                key={height}
                                style={{
                                    width: 6,
                                    height,
                                    background: i < filledBars ? color : "oklch(1 0 0 / 12%)",
                                }}
                            />
                        ))}
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                        {onToggleArchive && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onToggleArchive(id);
                                }}
                                className="border border-[oklch(1_0_0/14%)] px-2.5 py-1 font-mono text-[11px] tracking-[0.06em] text-[oklch(0.63_0.014_260)] uppercase transition-colors hover:border-[oklch(0.96_0.006_260/40%)] hover:text-[oklch(0.96_0.006_260)]"
                            >
                                {archived ? "↺ restore" : "⤓ archive"}
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setConfirmingDelete(true);
                                }}
                                className="border border-[oklch(1_0_0/14%)] px-2.5 py-1 font-mono text-[11px] tracking-[0.06em] text-[oklch(0.63_0.014_260)] uppercase transition-colors hover:border-[oklch(0.72_0.19_20)] hover:text-[oklch(0.72_0.19_20)]"
                            >
                                ✕ delete
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {resumeUrl && (
                <img
                    src={resumeUrl}
                    alt="resume"
                    className="box-border block h-[300px] w-full object-cover object-top px-5 pb-5 [filter:grayscale(0.35)_contrast(1.05)_brightness(0.95)]"
                />
            )}
        </Link>
        {confirmingDelete && onDelete && createPortal(
            <div
                className="fixed inset-0 z-50 flex animate-[fadeIn_0.15s_ease_both] items-center justify-center bg-[oklch(0_0_0/60%)] p-4"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setConfirmingDelete(false);
                }}
            >
                <div
                    className="w-[420px] max-w-full animate-[fadeUp_0.2s_ease_both] border border-[oklch(1_0_0/8%)] bg-[oklch(0.21_0.015_260)] p-8 text-center font-display"
                    onClick={(e) => e.stopPropagation()}
                >
                    <p className="mb-2 font-mono text-[11px] tracking-[0.08em] text-[oklch(0.72_0.19_20)] uppercase">[ Delete resume ]</p>
                    <h2 className="mb-3 text-2xl font-bold text-[oklch(0.96_0.006_260)]">
                        {companyName || "This application"}
                    </h2>
                    <p className="mb-7 text-sm leading-normal text-[oklch(0.63_0.014_260)]">
                        This will permanently remove the resume and its feedback. This cannot be undone.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setConfirmingDelete(false);
                            }}
                            className="flex-1 cursor-pointer border border-[oklch(1_0_0/20%)] bg-[oklch(0.25_0.016_260)] p-3 text-[13px] font-bold text-[oklch(0.96_0.006_260)] transition-colors hover:border-[oklch(1_0_0/40%)]"
                        >
                            CANCEL
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setConfirmingDelete(false);
                                onDelete(id);
                            }}
                            className="flex-1 cursor-pointer bg-[oklch(0.72_0.19_20)] p-3 text-[13px] font-bold text-[oklch(0.16_0.014_260)] transition-shadow hover:shadow-[0_0_24px_oklch(0.72_0.19_20/40%)]"
                        >
                            DELETE
                        </button>
                    </div>
                </div>
            </div>,
            document.body
        )}
        </>
    )
}
export default ResumeCard
