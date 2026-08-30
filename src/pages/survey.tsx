import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowLeft, ArrowRight, CalendarDays } from 'lucide-react';
import FormForm, { type FormSubmitData } from "../components/form"
// import type FormSubmitData from './screening';

export default function Survey({survey}:any){
    const { name, longDescription, author, publishStamp, requiresScreen, allowedSubmits, screen, questions} = survey
    const [started, setStart] = useState(false)
    const [submitScreen, setSubmitScreen] = useState(false)
    const [submitSurvey, setSubmitSurvey] = useState(false)
    const [passedScreen, setPassedScreen] = useState(false)
    const handleScreenSubmit = (data: FormSubmitData) => {
        console.log('Received payload from form:', data);
        setStart(false);
        setSubmitScreen(true)
        if (data.isFlagged){setPassedScreen(false)} else setPassedScreen(true);
    };
    const handleSurveySubmit = (data: FormSubmitData) => {
        console.log('Received payload from form:', data);
        setStart(false);
        setSubmitSurvey(true);
    }
    
    const beginButton="flex p-8 aspect-5/3 rounded-2xl items-center justify-center border-primary-600 bg-primary-700/20 hover:bg-green-500/50"
    const endButton="flex p-3 aspect-5/3 rounded-2xl items-center justify-center border-primary-600 bg-primary-700/20 hover:bg-red-500/50"

    return (
        <div className="relative flex flex-col gap-4 pt-15 items-center justify-center py-10 px-8 sm:px-15 md:px-25">
            <Link className="flex flex-row group absolute top-5 left-5 gap-2 justify-center items-center" to='/'>
                <ArrowLeft className="size-4 sm:size-6 md:size-7 text-primary-400 transition duration-200 group-hover:-translate-x-2 group-hover:text-accent-300" aria-hidden="true" />
                <span className="text-sm sm:text-base md:text-lg">Home</span>
            </Link>
            <span className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl border-b-4 border-accent-300">{name}</span>
            {!started && !submitScreen && (<p className="text-xs sm:text-sm text-primary-500 italic -mt-3 flex flex-row gap-2">{author} - {publishStamp[0]}/{publishStamp[1]}/{publishStamp[2]}</p>)}
            {!started && !submitScreen && (<p className="text-sm md:text-lg text-primary-400">{longDescription}</p>)}
            { requiresScreen ? (
                <div className='relative flex flex-col gap-4 items-center justify-center w-full'>
                    {!started && !submitScreen && (<span>This survey requires screening questions.</span>)}
                    {!started && !submitScreen && (<button className={beginButton} onClick={()=> setStart(true)}>Begin</button>)}
                    {started && (<button className={endButton} onClick={()=> setStart(false)}>Exit</button>)}
                    <div className="flex flex-col gap-12 p-2 w-full justify-center items-center">
                        {/* {started && (
                            // screen.map((q:any,i:number)=>(
                            //     <div className="flex flex-col items-left gap-3">
                            //         <h1 className='text-xl'>{q.question}</h1>
                            //     </div>
                            // ))
                            )} */}
                        {started && (<FormForm schema={screen} onSubmit={handleScreenSubmit} isScreen={true} />)}
                        {!passedScreen && submitScreen && (
                            <div className="flex justify-center items-center">
                                <h1 className='text-red-200 text-lg sm:text-2xl'>I'm sorry. You are not eligible for this survey. Try another!</h1>
                            </div>
                        )}
                        {passedScreen && submitScreen && (
                            <div className="flex justify-center items-center">
                                <h1 className='text-accent-200 text-lg sm:text-2xl'>Great! You're eligible for this survey!!</h1>
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