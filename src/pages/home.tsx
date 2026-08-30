import allSurveys from '../assets/surveys.json';
import {Link} from 'react-router-dom'
import { ArrowUpRight, ArrowLeft, CalendarDays } from 'lucide-react';

export default function Home() {
    const card1 = "relative rounded-2xl shadow-sm border flex flex-col gap-3 border-primary-500 bg-primary-700/10 p-6 aspect-5/3 group hover:bg-primary-700/30"
    return (
        <div className='m-5 mt-10 flex items-center flex-col gap-10'>
            <p className="text-5xl text-primary-100">surveys</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 w-3/4 max-w-2xl">
                { allSurveys.map((survey)=>(
                    (survey.visible && 
                    <Link key={survey.link} className={card1} to={survey.link}>
                        <ArrowUpRight className="absolute top-5 right-5 text-primary-400 transition duration-200 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent-300" aria-hidden="true" />
                        <div className="flex flex-col">
                            <span className="text-2xl">{survey.name}</span>
                            <span className="text-sm text-primary-400 pr-4">{survey.author}</span>
                        </div>
                        <hr className="border-t-2 border-accent-200"></hr>
                        <div className="flex justify-center flex-col">
                            <span className="text-sm text-primary-300">{survey.description}</span>
                        </div>
                            <span className="text-xs ml-auto mt-auto -mb-2 text-primary-500 italic flex flex-row gap-2"><CalendarDays size={14} aria-hidden="true" />{survey.publishStamp[0]}/{survey.publishStamp[1]}/{survey.publishStamp[2]}</span>
                    </Link>
                    )
                ))}
            </div>
        </div>
    )
}