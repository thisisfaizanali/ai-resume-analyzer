import ResumeCard from "~/components/ResumeCard";
import {usePuterStore} from "~/lib/puter";
import {Link, useNavigate} from "react-router";
import {useEffect, useMemo, useState} from "react";
import {deleteResume, toggleResumeArchived} from "~/lib/utils";

const inputClass = "w-full !rounded-none border border-[oklch(1_0_0/14%)] !bg-[oklch(0.21_0.015_260)] p-3 !shadow-none text-sm !text-[oklch(0.96_0.006_260)] outline-none transition-colors focus:border-[oklch(0.85_0.19_140)]";

export const meta = () => ([
  { title: "Resumind | Archive" },
  { name: "description", content: "Resumes you've archived from your dashboard." },
])

export default function Archive() {
  const { auth, kv, fs } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'score-desc' | 'score-asc'>('date');

  const visibleResumes = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? resumes.filter((resume) => `${resume.companyName || ''} ${resume.jobTitle || ''}`.toLowerCase().includes(q))
      : resumes;

    return [...filtered].sort((a, b) => {
      if (sortBy === 'score-desc') return b.feedback.overallScore - a.feedback.overallScore;
      if (sortBy === 'score-asc') return a.feedback.overallScore - b.feedback.overallScore;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }, [resumes, query, sortBy]);

  useEffect(() => {
    if(!auth.isAuthenticated) navigate('/auth?next=/archive');
  }, [auth.isAuthenticated])

  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);

      const resumes = (await kv.list('resume:*', true)) as KVItem[];

      const parsedResumes = resumes?.map((resume) => (
          JSON.parse(resume.value) as Resume
      ))

      setResumes(parsedResumes?.filter((resume) => resume.archived) || []);
      setLoadingResumes(false);
    }

    loadResumes()
  }, []);

  const handleToggleArchive = async (id: string) => {
    await toggleResumeArchived(kv, id);
    setResumes((prev) => prev.filter((resume) => resume.id !== id));
  };

  const handleDelete = async (id: string) => {
    await deleteResume(kv, fs, id);
    setResumes((prev) => prev.filter((resume) => resume.id !== id));
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[oklch(0.16_0.014_260)] font-display">
      <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(oklch(1_0_0/5%)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="pointer-events-none absolute -top-[200px] -right-[150px] h-[600px] w-[600px] rounded-full [background:radial-gradient(circle,oklch(0.85_0.19_140/10%),transparent_70%)]" />

      <div className="relative z-10">
        <nav className="flex items-center justify-between border-b border-[oklch(1_0_0/8%)] px-8 py-6 md:px-14">
          <Link to="/" className="shrink-0 font-mono text-[17px] tracking-[0.02em] whitespace-nowrap text-[oklch(0.96_0.006_260)]">
            [ RESUMIND ]
          </Link>
          <div className="flex shrink-0 items-center gap-6 md:gap-9">
            <Link to="/" className="hidden font-mono text-xs tracking-[0.08em] whitespace-nowrap text-[oklch(0.63_0.014_260)] uppercase transition-colors hover:text-[oklch(0.96_0.006_260)] sm:inline">
              Dashboard
            </Link>
            <Link to="/archive" className="hidden font-mono text-xs tracking-[0.08em] whitespace-nowrap text-[oklch(0.96_0.006_260)] uppercase sm:inline">
              Archive
            </Link>
            <button onClick={auth.signOut} className="hidden font-mono text-xs tracking-[0.08em] whitespace-nowrap text-[oklch(0.63_0.014_260)] uppercase transition-colors hover:text-[oklch(0.72_0.19_20)] sm:inline">
              Log Out
            </button>
            <Link
              to="/upload"
              className="shrink-0 bg-[oklch(0.85_0.19_140)] px-[22px] py-3 text-[13px] font-bold whitespace-nowrap text-[oklch(0.16_0.014_260)] transition-[background,box-shadow] hover:bg-[oklch(0.9_0.19_140)] hover:shadow-[0_0_24px_oklch(0.85_0.19_140/40%)]"
            >
              Upload Resume
            </Link>
          </div>
        </nav>

        <div className="animate-[fadeUp_0.6s_ease_both] px-8 pt-20 pb-12 md:px-14">
          <p className="mb-[18px] flex items-center gap-2 font-mono text-[13px] tracking-[0.1em] text-[oklch(0.85_0.19_140)]">
            // ARCHIVED RESUMES
            <span className="inline-block h-3.5 w-2 animate-[blink_1.2s_step-end_infinite] bg-[oklch(0.85_0.19_140)]" />
          </p>
          <h1 className="!bg-none !bg-clip-border max-w-[920px] !text-5xl !leading-none !font-bold !tracking-[-1.5px] !text-[oklch(0.96_0.006_260)] md:!text-7xl lg:!text-[76px]">
            ARCHIVED APPLICATIONS
          </h1>
          <p className="mt-[22px] max-w-[560px] text-lg leading-normal text-[oklch(0.63_0.014_260)]">
            Resumes you've archived from your dashboard.
          </p>
        </div>

        {loadingResumes && (
          <div className="flex flex-col items-center gap-5 px-8 pt-[60px] pb-[120px] md:px-14">
            <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-[oklch(1_0_0/12%)] border-t-[oklch(0.85_0.19_140)]" />
            <p className="font-mono text-[13px] text-[oklch(0.63_0.014_260)]">loading your archive...</p>
          </div>
        )}

        {!loadingResumes && resumes.length > 0 && (
          <div className="flex flex-col gap-4 px-8 pb-6 sm:flex-row md:px-14">
            <input
              type="text"
              placeholder="Search by company or job title..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`${inputClass} sm:max-w-[360px]`}
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className={`${inputClass} sm:max-w-[220px]`}
            >
              <option value="date">Newest</option>
              <option value="score-desc">Score: High to Low</option>
              <option value="score-asc">Score: Low to High</option>
            </select>
          </div>
        )}

        {!loadingResumes && visibleResumes.length > 0 && (
          <div className="grid animate-[fadeUp_0.7s_ease_both] grid-cols-1 gap-6 px-8 pt-2 pb-[72px] sm:grid-cols-2 md:px-14 xl:grid-cols-3">
            {visibleResumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} onToggleArchive={handleToggleArchive} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {!loadingResumes && resumes.length === 0 && (
          <div className="flex flex-col items-center gap-6 px-8 pt-[60px] pb-[120px] text-center md:px-14">
            <p className="font-mono text-sm text-[oklch(0.63_0.014_260)]">No archived resumes.</p>
            <Link
              to="/"
              className="bg-[oklch(0.85_0.19_140)] px-8 py-4 text-[15px] font-bold text-[oklch(0.16_0.014_260)] transition-[background,box-shadow] hover:bg-[oklch(0.9_0.19_140)] hover:shadow-[0_0_24px_oklch(0.85_0.19_140/40%)]"
            >
              Back to Dashboard
            </Link>
          </div>
        )}

        {!loadingResumes && resumes.length > 0 && visibleResumes.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-8 pt-[20px] pb-[120px] text-center md:px-14">
            <p className="font-mono text-sm text-[oklch(0.63_0.014_260)]">No resumes match your search.</p>
          </div>
        )}
      </div>
    </main>
  );
}
