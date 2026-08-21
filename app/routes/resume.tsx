import {Link, useNavigate, useParams} from "react-router";
import {useEffect, useState} from "react";
import {usePuterStore} from "~/lib/puter";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import {updateResumeDetails} from "~/lib/utils";

const inputClass = "w-full !rounded-none border border-[oklch(1_0_0/14%)] !bg-[oklch(0.21_0.015_260)] p-2.5 !shadow-none text-sm !text-[oklch(0.96_0.006_260)] outline-none transition-colors focus:border-[oklch(0.85_0.19_140)]";

export const meta = () => ([
    { title: 'Resumind | Review ' },
    { name: 'description', content: 'Detailed overview of your resume' },
])

function downloadFeedbackAsText(companyName: string, jobTitle: string, feedback: Feedback) {
    const sections: [string, { score: number; tips: { type: string; tip: string; explanation?: string }[] }][] = [
        ['ATS', feedback.ATS],
        ['Tone & Style', feedback.toneAndStyle],
        ['Content', feedback.content],
        ['Structure', feedback.structure],
        ['Skills', feedback.skills],
    ];

    const lines = [
        `Resume Feedback${companyName ? ` — ${companyName}` : ''}${jobTitle ? ` (${jobTitle})` : ''}`,
        `Overall Score: ${feedback.overallScore}/100`,
        '',
        ...sections.flatMap(([label, section]) => [
            `${label}: ${section.score}/100`,
            ...section.tips.map((tip) => `  - [${tip.type}] ${tip.tip}${tip.explanation ? `\n    ${tip.explanation}` : ''}`),
            '',
        ]),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${companyName || 'resume'}-feedback.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

const Resume = () => {
    const { auth, isLoading, fs, kv } = usePuterStore();
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [companyName, setCompanyName] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editCompanyName, setEditCompanyName] = useState('');
    const [editJobTitle, setEditJobTitle] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if(!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
    }, [isLoading])

    useEffect(() => {
        const loadResume = async () => {
            const resume = await kv.get(`resume:${id}`);

            if(!resume) return;

            const data = JSON.parse(resume);

            const resumeBlob = await fs.read(data.resumePath);
            if(!resumeBlob) return;

            const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
            const resumeUrl = URL.createObjectURL(pdfBlob);
            setResumeUrl(resumeUrl);

            const imageBlob = await fs.read(data.imagePath);
            if(!imageBlob) return;
            const imageUrl = URL.createObjectURL(imageBlob);
            setImageUrl(imageUrl);

            setFeedback(data.feedback);
            setCompanyName(data.companyName || '');
            setJobTitle(data.jobTitle || '');
        }

        loadResume();
    }, [id]);

    const startEditing = () => {
        setEditCompanyName(companyName);
        setEditJobTitle(jobTitle);
        setIsEditing(true);
    };

    const saveEdits = async () => {
        if (!id) return;
        await updateResumeDetails(kv, id, { companyName: editCompanyName, jobTitle: editJobTitle });
        setCompanyName(editCompanyName);
        setJobTitle(editJobTitle);
        setIsEditing(false);
    };

    return (
        <main className="min-h-screen bg-[oklch(0.16_0.014_260)] font-display">
            <nav className="flex items-center gap-2.5 border-b border-[oklch(1_0_0/8%)] px-8 py-5 md:px-14">
                <Link to="/" className="flex items-center gap-2.5 no-underline transition-opacity hover:opacity-70">
                    <span className="font-mono text-[15px] text-[oklch(0.85_0.19_140)]">&#8592;</span>
                    <span className="font-mono text-xs tracking-[0.06em] text-[oklch(0.96_0.006_260)] uppercase">Back to Homepage</span>
                </Link>
            </nav>
            <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="flex items-center justify-center bg-[oklch(0.12_0.012_260)] p-8 lg:sticky lg:top-0 lg:h-[calc(100vh-65px)] md:p-14">
                    {imageUrl && resumeUrl && (
                        <div className="relative animate-[fadeUp_0.6s_ease_both]">
                            <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={imageUrl}
                                    className="block w-full max-w-[400px] border border-[oklch(0.85_0.19_140/45%)] shadow-[0_0_50px_oklch(0.85_0.19_140/14%)]"
                                    title="resume"
                                />
                            </a>
                            {feedback && (
                                <div className="absolute -top-3.5 -right-3.5 bg-[oklch(0.85_0.19_140)] px-3.5 py-2 font-mono text-base font-bold text-[oklch(0.16_0.014_260)]">
                                    {feedback.overallScore}/100
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-9 p-8 md:p-14">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <h2 className="!bg-none !bg-clip-border m-0 !text-[34px] !font-bold !text-[oklch(0.96_0.006_260)]">RESUME REVIEW</h2>
                            {!isEditing && (companyName || jobTitle) && (
                                <p className="mt-2 truncate font-mono text-sm text-[oklch(0.63_0.014_260)]">
                                    {companyName}{companyName && jobTitle ? ' — ' : ''}{jobTitle}
                                </p>
                            )}
                        </div>
                        {!isEditing && (
                            <button
                                onClick={startEditing}
                                className="shrink-0 border border-[oklch(1_0_0/14%)] px-3 py-1.5 font-mono text-[11px] tracking-[0.06em] text-[oklch(0.63_0.014_260)] uppercase transition-colors hover:border-[oklch(0.96_0.006_260/40%)] hover:text-[oklch(0.96_0.006_260)]"
                            >
                                ✎ edit
                            </button>
                        )}
                    </div>

                    {isEditing && (
                        <div className="flex flex-col gap-3 border border-[oklch(1_0_0/8%)] bg-[oklch(0.21_0.015_260)] p-5 sm:flex-row sm:items-end">
                            <div className="flex-1">
                                <label className="mb-1.5 block font-mono text-[11px] tracking-[0.08em] text-[oklch(0.63_0.014_260)] uppercase">Company Name</label>
                                <input
                                    type="text"
                                    value={editCompanyName}
                                    onChange={(e) => setEditCompanyName(e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="mb-1.5 block font-mono text-[11px] tracking-[0.08em] text-[oklch(0.63_0.014_260)] uppercase">Job Title</label>
                                <input
                                    type="text"
                                    value={editJobTitle}
                                    onChange={(e) => setEditJobTitle(e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="cursor-pointer border border-[oklch(1_0_0/20%)] bg-[oklch(0.25_0.016_260)] px-4 py-2.5 text-[13px] font-bold text-[oklch(0.96_0.006_260)] transition-colors hover:border-[oklch(1_0_0/40%)]"
                                >
                                    CANCEL
                                </button>
                                <button
                                    onClick={saveEdits}
                                    className="cursor-pointer bg-[oklch(0.85_0.19_140)] px-4 py-2.5 text-[13px] font-bold text-[oklch(0.16_0.014_260)] transition-shadow hover:shadow-[0_0_24px_oklch(0.85_0.19_140/40%)]"
                                >
                                    SAVE
                                </button>
                            </div>
                        </div>
                    )}

                    {feedback && (
                        <button
                            onClick={() => downloadFeedbackAsText(companyName, jobTitle, feedback)}
                            className="w-fit cursor-pointer border border-[oklch(1_0_0/14%)] px-3.5 py-2 font-mono text-[11px] tracking-[0.06em] text-[oklch(0.63_0.014_260)] uppercase transition-colors hover:border-[oklch(0.96_0.006_260/40%)] hover:text-[oklch(0.96_0.006_260)]"
                        >
                            ⬇ download feedback
                        </button>
                    )}

                    {feedback ? (
                        <div className="flex animate-[fadeUp_0.6s_ease_both] flex-col gap-9">
                            <Summary feedback={feedback} />
                            <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
                            <Details feedback={feedback} />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-5 py-16">
                            <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-[oklch(1_0_0/12%)] border-t-[oklch(0.85_0.19_140)]" />
                            <p className="font-mono text-[13px] text-[oklch(0.63_0.014_260)]">loading your review...</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
export default Resume
