import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowLeft, ArrowRight, CalendarDays } from 'lucide-react';
import FormForm, { type FormSubmitData } from "../components/form"
import {type SurveyData} from "../lib/User"
import {USER} from "./home"


export default function Survey({survey}:any){
    const { link, name, longDescription, author, publishStamp, requiresScreen, allowedSubmits, screen, questions} = survey
    if (!USER.surveyData){
        USER.surveyData = {}
    }

    if (USER.surveyData[link] == undefined || null){
        USER.surveyData[link] = {id:link,submitted:false,submitTimes:0}
        USER.save()
    }
    const userSurvey = USER.surveyData[link]
    
    const [started, setStart] = useState(false)
    const [submitScreen, setSubmitScreen] = useState(userSurvey.submittedScreen || false)
    const [submitSurvey, setSubmitSurvey] = useState(userSurvey.submitted || false)
    const [passedScreen, setPassedScreen] = useState(userSurvey.passedScreen || false)
    const [noMoreAttempts, setNoMoreAttempts] = useState((userSurvey.submitTimes >= allowedSubmits) || false)
    console.log(noMoreAttempts,userSurvey.submitTimes,allowedSubmits,(userSurvey.submitTimes >= allowedSubmits))
    const handleScreenSubmit = (data: FormSubmitData) => {
        console.log('Received payload from form:', data);
        setStart(false);
        setSubmitScreen(true)
        userSurvey.submittedScreen = true;
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
        setStart(false);
        setSubmitSurvey(true);
        console.log(userSurvey)
        userSurvey.submitted = true
        userSurvey.submitTimes = userSurvey.submitTimes + 1;
        userSurvey.data = data.values;
        USER.save()
    }

    if (!noMoreAttempts && (userSurvey.submitTimes >= allowedSubmits)) {
        setNoMoreAttempts(true)
    }
    const handleSetStart = () => {
        if (userSurvey.submitTimes >= allowedSubmits) {
            console.log("Sorry, too many submits.")
            setNoMoreAttempts(true)
            setSubmitSurvey(false)
            setSubmitScreen(false)
            return
        }
        setStart(true)
    }

    const beginButton="flex p-8 aspect-5/3 rounded-2xl items-center justify-center border-primary-600 bg-primary-700/20 hover:bg-green-500/50"
    const endButton="absolute top-5 right-5 flex p-2 px-4 sm:px-8 lg:py-3 lg:px-12 rounded-2xl items-center justify-center border-primary-600 bg-primary-700/20 hover:bg-red-500/50"

    return (
        <div className="relative flex flex-col gap-4 pt-15 items-center justify-center py-10 px-8 sm:px-15 md:px-25">
            {started && (<button className={endButton} onClick={()=> setStart(false)}>Exit</button>)}
            <Link className="flex flex-row group absolute top-5 left-5 gap-2 justify-center items-center" to='/'>
                <ArrowLeft className="size-6 md:size-7 text-primary-400 transition duration-200 group-hover:-translate-x-2 group-hover:text-accent-300" aria-hidden="true" />
                <span className="invisible sm:visible text-sm sm:text-base md:text-lg">Home</span>
            </Link>
            <span className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl border-b-4 border-accent-300">{name}</span>
            {!started && !noMoreAttempts && (<p className="text-xs sm:text-sm text-primary-500 italic -mt-3 flex flex-row gap-2">{author} - {publishStamp[0]}/{publishStamp[1]}/{publishStamp[2]}</p>)}
            {passedScreen && submitScreen && !started && (
                <span className={`text-${(userSurvey.submitTimes >= allowedSubmits) ? 'red' : 'primary'}-400 -mt-2`}>Allowed submits: {userSurvey.submitTimes}/{allowedSubmits}</span>
            )}
            {!started && !noMoreAttempts && (<p className="text-sm md:text-lg text-primary-400 text-center max-w-2xl">{longDescription}</p>)}
            { requiresScreen ? (
                <div className='relative flex flex-col gap-4 items-center justify-center w-full'>
                    {!started && !submitScreen && !noMoreAttempts && (<span className="text-center">This survey requires screening.</span>)}
                    {!started && !submitScreen && !noMoreAttempts && (<button className={beginButton} onClick={handleSetStart}>Begin</button>)}
                    {noMoreAttempts && (<span className="text-center text-red-400">You've submitted as many times as you can.</span>)}
                    <div className="flex flex-col gap-12 p-2 w-full justify-center items-center">
                        {/* {started && (
                            // screen.map((q:any,i:number)=>(
                            //     <div className="flex flex-col items-left gap-3">
                            //         <h1 className='text-xl'>{q.question}</h1>
                            //     </div>
                            // ))
                            )} */}
                        {started && !submitScreen && (<FormForm schema={screen} onSubmit={handleScreenSubmit} isScreen={true} />)}
                        {!passedScreen && submitScreen && !submitSurvey && (
                            <div className="flex justify-center items-center">
                                <h1 className='text-red-200 text-lg sm:text-2xl'>I'm sorry. You are not eligible for this survey. Try another!</h1>
                            </div>
                        )}
                        {passedScreen && submitScreen && (
                            <div className="flex flex-col justify-center items-center gap-5">
                                {!started && !noMoreAttempts && !submitSurvey && (<h1 className='text-accent-200 text-lg sm:text-2xl'>Great! You're eligible for this survey!!</h1>)}
                                {!started && submitSurvey && (
                                    <h1 className="text-accent-300 text-lg sm:text-2xl">Submit successful!</h1>
                                )}
                                {!started && !noMoreAttempts && (<button className={beginButton} onClick={handleSetStart}>Begin</button>)}
                                {started && (<FormForm schema={questions} onSubmit={handleSurveySubmit} isScreen={false} />)}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div>
                    <span></span>
                </div>
            )}
        </div>
    )
}