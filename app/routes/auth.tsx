import {usePuterStore} from "~/lib/puter";
import {useEffect} from "react";
import {useLocation, useNavigate} from "react-router";

export const meta = () => ([
    { title: 'Resumind | Auth' },
    { name: 'description', content: 'Log into your account' },
])

const Auth = () => {
    const { isLoading, auth } = usePuterStore();
    const location = useLocation();
    const next = location.search.split('next=')[1];
    const navigate = useNavigate();

    useEffect(() => {
        if(auth.isAuthenticated) navigate(next);
    }, [auth.isAuthenticated, next])

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[oklch(0.16_0.014_260)] font-display">
            <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(oklch(1_0_0/5%)_1px,transparent_1px)] [background-size:28px_28px]" />

            <div className="relative z-10 w-[480px] max-w-[calc(100%-32px)] animate-[fadeUp_0.5s_ease_both] border border-[oklch(1_0_0/8%)] bg-[oklch(0.21_0.015_260)] p-14 text-center">
                <p className="mb-8 font-mono text-sm text-[oklch(0.63_0.014_260)]">[ RESUMIND ]</p>
                <h1 className="!bg-none !bg-clip-border mb-3 !text-[44px] !leading-none !font-bold !tracking-normal !text-[oklch(0.96_0.006_260)]">
                    WELCOME
                </h1>
                <p className="mb-7 text-[15px] text-[oklch(0.63_0.014_260)]">
                    Log in to continue your job journey.
                </p>
                <p className="mb-2 font-mono text-[11px] tracking-[0.08em] text-[oklch(0.85_0.19_140)] uppercase">
                    [ OAuth via Puter.js ]
                </p>

                {isLoading ? (
                    <button
                        disabled
                        className="w-full animate-[pulse-soft_1.4s_ease-in-out_infinite] bg-[oklch(0.85_0.19_140/60%)] p-[18px] text-[15px] font-bold text-[oklch(0.16_0.014_260)]"
                    >
                        SIGNING YOU IN...
                    </button>
                ) : auth.isAuthenticated ? (
                    <>
                        <p className="mb-5 font-mono text-[13px] text-[oklch(0.85_0.19_140)]">[OK] signed in via Puter</p>
                        <button
                            onClick={auth.signOut}
                            className="w-full cursor-pointer border border-[oklch(1_0_0/20%)] bg-[oklch(0.25_0.016_260)] p-[18px] text-[15px] font-bold text-[oklch(0.96_0.006_260)] transition-colors hover:border-[oklch(0.72_0.19_20)] hover:bg-[oklch(0.72_0.19_20/15%)] hover:text-[oklch(0.72_0.19_20)]"
                        >
                            LOG OUT &#8594;
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={auth.signIn}
                            className="mt-3 w-full cursor-pointer bg-[oklch(0.85_0.19_140)] p-[18px] text-[15px] font-bold text-[oklch(0.16_0.014_260)] transition-shadow hover:shadow-[0_0_24px_oklch(0.85_0.19_140/40%)]"
                        >
                            LOG IN WITH PUTER &#8594;
                        </button>
                        <p className="mt-4 text-xs text-[oklch(0.5_0.014_260)]">
                            You'll be redirected to Puter to authorize — no password needed here.
                        </p>
                    </>
                )}
            </div>
        </main>
    )
}

export default Auth
