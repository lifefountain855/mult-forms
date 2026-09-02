import { Link } from 'react-router-dom'
import { ArrowUpRight, CalendarDays, Home as HomeIcon, LogIn, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import UserProfile from '../lib/User';
import { supabase } from '../lib/supabase';
import type { SurveyDefinition } from '../lib/surveys';
import Toast from '../components/toast';
import MobileSidebar from '../components/mobile-sidebar';

const cardVariants = {
    initial: {opacity: 0, y: 18},
    hover: { y: -8, scale: 1.01 }
};

const arrowVariants = {
    inital: { x: 0, y: 0, scale:1 },
    hover: { x: 4, y: -4, scale:1.1}
};

export default function Home({ surveys }: { surveys: SurveyDefinition[] }) {
    const [user, setUser] = useState<UserProfile>(new UserProfile());
    const [sessionEmail, setSessionEmail] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        UserProfile.initLoad().then((profile) => {
            if (isMounted) {
                setUser(profile);
                setLoading(false);
            }
        }).catch((loadError: Error) => {
            if (isMounted) {
                setError(loadError.message);
                setLoading(false);
            }
        });

        supabase.auth.getSession().then(({ data }) => {
            if (isMounted) {
                setSessionEmail(data.session?.user?.email ?? null);
            }
        });

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (isMounted) {
                setSessionEmail(session?.user?.email ?? null);
                UserProfile.initLoad().then((profile) => setUser(profile)).catch((loadError: Error) => {
                    if (isMounted) setError(loadError.message);
                });
            }
        });

        return () => {
            isMounted = false;
            authListener.subscription.unsubscribe();
        };
    }, []);

    const handleSignOut = async () => {
        setError(null);
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) {
            setError(signOutError.message);
            return;
        }
        setSessionEmail(null);
        setUser(new UserProfile());
        setMessage('Signed out successfully.');
    };

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center p-8 text-primary-300">Loading your profile...</div>;
    }

    const card1 = "relative flex flex-col gap-3 rounded-2xl border border-primary-500 bg-primary-700/10 p-6 shadow-sm transition-colors duration-300";
    const surveyState = user.surveyData ?? {};
    const orderedSurveys = [...surveys].sort((left, right) => {
        if (left.visible !== right.visible) {
            return left.visible ? -1 : 1;
        }

        const leftDate = left.publishStamp[2] * 10000 + left.publishStamp[1] * 100 + left.publishStamp[0];
        const rightDate = right.publishStamp[2] * 10000 + right.publishStamp[1] * 100 + right.publishStamp[0];
        return rightDate - leftDate;
    });

    return (
        <div className='m-5 mt-0 pt-15 flex items-center flex-col gap-10'>
            <title>Asappy Surveys</title>
            {message && <Toast message={message} />}
            {error && <Toast message={error} tone="error" />}
            <div className="flex w-full max-w-2xl items-center justify-between gap-3">
                <p className="text-5xl text-primary-100">surveys</p>
                {sessionEmail ? (
                    <>
                    <div className="hidden items-center gap-2 sm:flex">
                        {user.admin && (
                            <Link
                                to="/admin/results"
                                className="inline-flex items-center gap-2 rounded-lg border border-accent-700 px-3 py-2 text-sm text-accent-200 hover:border-accent-400"
                            >
                                <ShieldCheck className="size-4" />
                                Results
                            </Link>
                        )}
                        <button
                            type="button"
                            onClick={handleSignOut}
                            className="inline-flex items-center gap-2 rounded-lg border border-primary-600 bg-primary-900 px-4 py-2 text-sm text-primary-100 hover:border-accent-400 hover:text-accent-200"
                        >
                            <LogOut className="size-4" />
                            Sign out
                        </button>
                    </div>
                    <MobileSidebar onSignOut={handleSignOut} currentPage='home' show={{home:true,admin:user.admin,account:true}}/>
                    </>
                ) : (
                    <Link
                        to="/auth"
                        className="inline-flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-primary-950 hover:bg-accent-400"
                    >
                        <LogIn className="size-4" />
                        Sign in
                    </Link>
                )}
            </div>

            {sessionEmail && (
                <p className="text-sm text-primary-300">Signed in as {sessionEmail}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 w-3/4 max-w-2xl">
                {orderedSurveys.map((survey, index) => (
                    (survey.visible || user.admin) && (
                        (() => {
                            const state = surveyState[survey.link];
                            const failedScreening = survey.requiresScreen && state?.submittedScreen && !state.passedScreen;
                            const maxAttemptsReached = (state?.submitTimes ?? 0) >= survey.allowedSubmits;
                            const disabled = failedScreening || maxAttemptsReached;
                            const destination = `/${survey.link}/${survey.requiresScreen ? (state?.passedScreen ? 'start' : 'screening') : 'start'}`;
                            const disabledReason = failedScreening
                                ? 'You did not pass screening'
                                : 'Maximum submissions reached';

                            return (
                            <motion.div
                                key={survey.link}
                                variants={cardVariants}
                                initial='initial'
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.42, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                                whileHover={disabled ? undefined : 'hover'}
                                whileTap={disabled ? undefined : { scale: 0.99 }}
                                className="h-full"
                            >
                            {disabled ? (
                                <div
                                    className={`${card1} h-full cursor-not-allowed border-primary-800 bg-primary-900/60 opacity-55 grayscale`}
                                    aria-disabled="true"
                                    title={disabledReason}
                                >
                                    <div className="absolute top-5 right-5 text-primary-600"><ArrowUpRight aria-hidden="true" /></div>
                                    <div className="flex flex-col">
                                        <span className="text-2xl">{survey.name}</span>
                                        <span className="text-sm text-primary-500 pr-4">{survey.author}</span>
                                    </div>
                                    <hr className="border-t-2 border-primary-700" />
                                    <span className="text-sm text-primary-500">{survey.description}</span>
                                    <span className="mt-auto text-xs italic text-primary-500">{disabledReason}</span>
                                    <span className="text-xs ml-auto -mb-2 text-primary-600 flex flex-row gap-2"><CalendarDays size={14} aria-hidden="true" />{survey.publishStamp[0]}/{survey.publishStamp[1]}/{survey.publishStamp[2]}</span>
                                </div>
                            ) : (
                                <Link className={`${card1} group block h-full`} to={destination}>
                                <motion.div
                                    variants={arrowVariants}
                                    transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                                    className="absolute top-5 right-5 text-primary-400 group-hover:text-accent-300"
                                >
                                    <ArrowUpRight aria-hidden="true" />
                                </motion.div>
                                <div className="flex flex-col">
                                    <span className="text-2xl">{survey.name}</span>
                                    <span className="text-sm text-primary-400 pr-4">{survey.author}</span>
                                </div>
                                <hr className="border-t-2 border-accent-200"></hr>
                                <div className="flex justify-center flex-col">
                                    <span className="text-sm text-primary-300">{survey.description}</span>
                                </div>
                                <span className="text-xs ml-auto mt-auto -mb-2 text-primary-500 italic flex flex-row gap-2">{survey.visible ? '' : '~~invisble to user~~'}<CalendarDays size={14} aria-hidden="true" />{survey.publishStamp[0]}/{survey.publishStamp[1]}/{survey.publishStamp[2]}</span>
                                </Link>
                            )}
                            </motion.div>
                            );
                        })()
                    )
                ))}
            </div>
        </div>
    )
}