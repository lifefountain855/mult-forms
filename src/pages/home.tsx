import { Link } from 'react-router-dom'
import { ArrowUpRight, CalendarDays, LogIn, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import UserProfile from '../lib/User';
import { supabase } from '../lib/supabase';
import type { SurveyDefinition } from '../lib/surveys';

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

    useEffect(() => {
        let isMounted = true;

        UserProfile.initLoad().then((profile) => {
            if (isMounted) {
                setUser(profile);
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
                UserProfile.initLoad().then((profile) => setUser(profile));
            }
        });

        return () => {
            isMounted = false;
            authListener.subscription.unsubscribe();
        };
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setSessionEmail(null);
        setUser(new UserProfile());
    };

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
        <div className='m-5 mt-10 flex items-center flex-col gap-10'>
            <title>Asappy Surveys</title>
            <div className="flex w-full max-w-2xl items-center justify-between gap-3">
                <p className="text-5xl text-primary-100">surveys</p>
                {sessionEmail ? (
                    <button
                        type="button"
                        onClick={handleSignOut}
                        className="inline-flex items-center gap-2 rounded-lg border border-primary-600 bg-primary-900 px-4 py-2 text-sm text-primary-100 hover:border-accent-400 hover:text-accent-200"
                    >
                        <LogOut className="size-4" />
                        Sign out
                    </button>
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
                        <motion.div
                            key={survey.link}
                            variants={cardVariants}
                            initial='initial'
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.42, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                            whileHover='hover'
                            whileTap={{ scale: 0.99 }}
                            className="h-full"
                        >
                            <Link
                                className={`${card1} group block h-full`}
                                to={`/${survey.link}/${survey.requiresScreen ? (surveyState[survey.link]?.passedScreen ? 'start' : 'screening') : 'start'}`}
                            >
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
                        </motion.div>
                    )
                ))}
            </div>
        </div>
    )
}