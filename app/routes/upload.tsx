import {type FormEvent, useState} from 'react'
import {Link} from "react-router";
import FileUploader from "~/components/FileUploader";
import {usePuterStore} from "~/lib/puter";
import {useNavigate} from "react-router";
import {convertPdfToImage} from "~/lib/pdf2img";
import {generateUUID} from "~/lib/utils";
import {prepareInstructions} from "../../constants";

const inputClass = "w-full !rounded-none border border-[oklch(1_0_0/14%)] !bg-[oklch(0.21_0.015_260)] p-3.5 !shadow-none text-base !text-[oklch(0.96_0.006_260)] outline-none transition-colors focus:border-[oklch(0.85_0.19_140)] focus:shadow-[0_0_0_3px_oklch(0.85_0.19_140/15%)]";

const STEPS = [
    'Uploading the file...',
    'Converting to image...',
    'Uploading the image...',
    'Preparing data...',
    'Analyzing...',
];

const Upload = () => {
    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const currentStage = STEPS.indexOf(statusText);

    const handleFileSelect = (file: File | null) => {
        setFile(file)
    }

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file: File  }) => {
        setIsProcessing(true);

        setStatusText('Uploading the file...');
        const uploadedFile = await fs.upload([file]);
        if(!uploadedFile) return setStatusText('Error: Failed to upload file');

        setStatusText('Converting to image...');
        const imageFile = await convertPdfToImage(file);
        if(!imageFile.file) return setStatusText('Error: Failed to convert PDF to image');

        setStatusText('Uploading the image...');
        const uploadedImage = await fs.upload([imageFile.file]);
        if(!uploadedImage) return setStatusText('Error: Failed to upload image');

        setStatusText('Preparing data...');
        const uuid = generateUUID();
        const data = {
            id: uuid,
            resumePath: uploadedFile.path,
            imagePath: uploadedImage.path,
            companyName, jobTitle, jobDescription,
            feedback: '',
            createdAt: Date.now(),
        }
        await kv.set(`resume:${uuid}`, JSON.stringify(data));

        setStatusText('Analyzing...');

        const feedback = await ai.feedback(
            uploadedFile.path,
            prepareInstructions({ jobTitle, jobDescription })
        )
        if (!feedback) return setStatusText('Error: Failed to analyze resume');

        const feedbackText = typeof feedback.message.content === 'string'
            ? feedback.message.content
            : feedback.message.content.find((c) => c.type === 'text')?.text;
        if (!feedbackText) return setStatusText('Error: Failed to analyze resume');

        data.feedback = JSON.parse(feedbackText);
        await kv.set(`resume:${uuid}`, JSON.stringify(data));
        setStatusText('Analysis complete, redirecting...');
        navigate(`/resume/${uuid}`);
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if(!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if(!file) return;

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-[oklch(0.16_0.014_260)] font-display">
            <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(oklch(1_0_0/5%)_1px,transparent_1px)] [background-size:28px_28px]" />

            <div className="relative z-10">
                <nav className="flex items-center justify-between border-b border-[oklch(1_0_0/8%)] px-8 py-6 md:px-14">
                    <Link to="/" className="shrink-0 font-mono text-[17px] tracking-[0.02em] whitespace-nowrap text-[oklch(0.96_0.006_260)]">
                        [ RESUMIND ]
                    </Link>
                    <div className="flex shrink-0 items-center gap-6 md:gap-9">
                        <Link to="/" className="hidden font-mono text-xs tracking-[0.08em] whitespace-nowrap text-[oklch(0.63_0.014_260)] uppercase transition-colors hover:text-[oklch(0.96_0.006_260)] sm:inline">
                            Dashboard
                        </Link>
                        <Link to="/archive" className="hidden font-mono text-xs tracking-[0.08em] whitespace-nowrap text-[oklch(0.63_0.014_260)] uppercase transition-colors hover:text-[oklch(0.96_0.006_260)] sm:inline">
                            Archive
                        </Link>
                        <button onClick={auth.signOut} className="hidden font-mono text-xs tracking-[0.08em] whitespace-nowrap text-[oklch(0.63_0.014_260)] uppercase transition-colors hover:text-[oklch(0.72_0.19_20)] sm:inline">
                            Log Out
                        </button>
                        <Link
                            to="/upload"
                            className="shrink-0 bg-[oklch(0.85_0.19_140)] px-[22px] py-3 text-[13px] font-bold whitespace-nowrap text-[oklch(0.16_0.014_260)] transition-colors hover:bg-[oklch(0.9_0.19_140)]"
                        >
                            Upload Resume
                        </Link>
                    </div>
                </nav>

                <div className="mx-auto grid max-w-[1320px] animate-[fadeUp_0.6s_ease_both] grid-cols-1 gap-14 px-8 py-16 md:px-14 md:py-20 lg:grid-cols-2 lg:gap-[72px]">
                    <div>
                        <p className="mb-4 font-mono text-[13px] tracking-[0.1em] text-[oklch(0.85_0.19_140)]">// NEW ANALYSIS</p>
                        <h1 className="!bg-none !bg-clip-border mb-5 !text-4xl !leading-[1.05] !font-bold !tracking-normal !text-[oklch(0.96_0.006_260)] md:!text-[54px]">
                            SMART FEEDBACK FOR YOUR DREAM JOB
                        </h1>

                        {isProcessing ? (
                            <div className="mt-2 flex flex-col gap-3.5">
                                <p className="m-0 font-mono text-[11px] tracking-[0.08em] text-[oklch(0.63_0.014_260)] uppercase">Model: claude-sonnet-4</p>
                                {STEPS.map((label, i) => {
                                    const color = i < currentStage ? 'oklch(0.63 0.014 260)' : i === currentStage ? 'oklch(0.85 0.19 140)' : 'oklch(0.4 0.014 260)';
                                    const mark = i < currentStage ? '✓' : i === currentStage ? '>' : '·';
                                    return (
                                        <div key={label} className="flex items-center gap-3 font-mono text-sm" style={{ color }}>
                                            <span className="w-4">{mark}</span>
                                            <span>{label}</span>
                                        </div>
                                    );
                                })}
                                <div className="relative mt-1.5 h-1 w-full max-w-[420px] overflow-hidden bg-[oklch(1_0_0/10%)]">
                                    <div className="absolute top-0 left-0 h-full w-[30%] animate-[scan_1.4s_ease-in-out_infinite] bg-[oklch(0.85_0.19_140)]" />
                                </div>
                            </div>
                        ) : (
                            <p className="m-0 text-[17px] text-[oklch(0.63_0.014_260)]">
                                Drop your resume for an ATS score and improvement tips.
                            </p>
                        )}
                    </div>

                    {!isProcessing && (
                        <form onSubmit={handleSubmit} className="flex flex-col !gap-[22px]">
                            <div>
                                <label htmlFor="company-name" className="mb-2 block font-mono text-[11px] tracking-[0.08em] !text-[oklch(0.63_0.014_260)] uppercase">Company Name</label>
                                <input
                                    type="text" name="company-name" id="company-name" placeholder="e.g. Google"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label htmlFor="job-title" className="mb-2 block font-mono text-[11px] tracking-[0.08em] !text-[oklch(0.63_0.014_260)] uppercase">Job Title</label>
                                <input
                                    type="text" name="job-title" id="job-title" placeholder="e.g. Frontend Developer"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label htmlFor="job-description" className="mb-2 block font-mono text-[11px] tracking-[0.08em] !text-[oklch(0.63_0.014_260)] uppercase">Job Description</label>
                                <textarea
                                    rows={3} name="job-description" id="job-description" placeholder="Paste the listing..."
                                    className={`${inputClass} resize-none`}
                                />
                            </div>
                            <div>
                                <label htmlFor="uploader" className="mb-2 block font-mono text-[11px] tracking-[0.08em] !text-[oklch(0.63_0.014_260)] uppercase">Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>

                            <button
                                type="submit"
                                className="cursor-pointer bg-[oklch(0.85_0.19_140)] p-4 text-[15px] font-bold text-[oklch(0.16_0.014_260)] transition-shadow hover:bg-[oklch(0.9_0.19_140)] hover:shadow-[0_0_24px_oklch(0.85_0.19_140/40%)]"
                            >
                                ANALYZE RESUME &#8594;
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </main>
    )
}
export default Upload
