import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import FormForm, { type FormSubmitData } from "../components/form"
import {USER} from "./home"

export default function Survey({survey, route}: any){
    const { link, name, longDescription, author, visible, publishStamp, requiresScreen, allowedSubmits, screen, questions} = survey
    const location = useLocation();
    const currentRoute = route ?? (location.pathname.endsWith('/screening') ? 'screening' : 'start');
    const screeningPath = `/${link}/screening`;
    const startPath = `/${link}/start`;
    const isScreeningRoute = currentRoute === 'screening';
    const isStartRoute = currentRoute === 'start';

    if (!USER.surveyData){
        USER.surveyData = {}
    }

    if (USER.surveyData[link] == undefined || null){
        USER.surveyData[link] = {id:link,submitted:false,submitTimes:0}
        USER.save()
    }
    const userSurvey = USER.surveyData[link]

    const [submitScreen, setSubmitScreen] = useState(userSurvey.submittedScreen || false)
    const [submitSurvey, setSubmitSurvey] = useState(userSurvey.submitted || false)
    const [passedScreen, setPassedScreen] = useState(userSurvey.passedScreen || false)
    const [noMoreAttempts, setNoMoreAttempts] = useState((userSurvey.submitTimes >= allowedSubmits) || false)

    useEffect(() => {
        setNoMoreAttempts(userSurvey.submitTimes >= allowedSubmits)
    }, [allowedSubmits, userSurvey.submitTimes])

    const handleScreenSubmit = (data: FormSubmitData) => {
        console.log('Received payload from form:', data);
        setSubmitScreen(true)
        userSurvey.submittedScreen = true;
        userSurvey.screenData = data;
        if (data.isFlagged){
            setPassedScreen(false);
            userSurvey.passedScreen = false;
        } else {
            setPassedScreen(true);
            userSurvey.passedScreen = true;
        }
        USER.save()
    };

    const handleSurveySubmit = (data: FormSubmitData) => {
        console.log('Received payload from form:', data);
        setSubmitSurvey(true);
        userSurvey.submitted = true
        userSurvey.submitTimes = userSurvey.submitTimes + 1;
        userSurvey.data = data.values;
        USER.save()
    }

    const beginButton = "flex p-8 aspect-5/3 rounded-2xl items-center justify-center border-primary-600 bg-primary-700/20"

    if (requiresScreen && isStartRoute && !noMoreAttempts && (!submitScreen || !passedScreen)) {
        return <Navigate to={screeningPath} replace />;
    }

    return (
        <div className="relative flex flex-col gap-4 pt-15 items-center justify-center py-10 px-8 sm:px-15 md:px-25">
            <title>{`Asappy Surveys - ${name}`}</title>

            <motion.div
                whileHover={{ x: -4 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                className="absolute top-5 left-5"
            >
                <Link className="flex flex-row group gap-2 justify-center items-center" to='/'>
                    <ArrowLeft className="size-6 md:size-7 text-primary-400 group-hover:text-accent-300" aria-hidden="true" />
                    <span className="invisible sm:visible text-sm sm:text-base md:text-lg">Home</span>
                </Link>
            </motion.div>

            <span className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl border-b-4 border-accent-300">{name}</span>

            {!noMoreAttempts && (
                <p className="text-xs sm:text-sm text-primary-500 italic -mt-3 flex flex-row gap-2">
                    {author} - {publishStamp.join('/')}
                </p>
            )}

            {!noMoreAttempts && (
                <span className={`text-${userSurvey.submitTimes >= allowedSubmits ? 'red' : 'primary'}-400 -mt-2`}>
                    Allowed submits: {userSurvey.submitTimes}/{allowedSubmits}
                </span>
            )}

            {!visible && (
                <span className='text-primary-500 italic'>This is a private survey sent by a link.</span>
            )}

            {!noMoreAttempts && (
                <p className="text-sm md:text-lg text-primary-400 text-center max-w-2xl">{longDescription}</p>
            )}

            {noMoreAttempts && (
                <span className="text-center text-red-400">You've submitted as many times as you can.</span>
            )}

            <div className='relative flex flex-col gap-4 items-center justify-center w-full'>
                {requiresScreen && isScreeningRoute && !submitScreen && !noMoreAttempts && (
                    <FormForm schema={screen} onSubmit={handleScreenSubmit} isScreen={true} />
                )}

                {requiresScreen && isScreeningRoute && submitScreen && !passedScreen && !submitSurvey && (
                    <div className="flex justify-center items-center">
                        <h1 className='text-center text-red-200 text-lg sm:text-2xl'>I'm sorry. You are not eligible for this survey. Try another!</h1>
                    </div>
                )}

                {requiresScreen && isScreeningRoute && submitScreen && passedScreen && !submitSurvey && (
                    <div className="flex flex-col justify-center items-center gap-5">
                        <h1 className='text-center text-accent-200 text-lg sm:text-2xl'>Great! You're eligible for this survey!!</h1>
                        <Link className={beginButton} to={startPath}>
                            Continue to survey
                        </Link>
                    </div>
                )}

                {(!requiresScreen || (passedScreen && submitScreen)) && isStartRoute && !submitSurvey && !noMoreAttempts && (
                    <FormForm schema={questions} onSubmit={handleSurveySubmit} isScreen={false} />
                )}

                {submitSurvey && (
                    <h1 className="text-accent-300 text-lg sm:text-2xl">Submit successful!</h1>
                )}
            </div>
        </div>
    );
}