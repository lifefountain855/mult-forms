import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function NotFound(){
    const card1 = "rounded-2xl justify-center items-center shadow-sm border flex flex-row gap-3 border-primary-500 bg-primary-700/10 p-6 aspect-8/3 group hover:bg-primary-700/30"
    return (
        <div className="flex flex-col gap-10 justify-center items-center h-screen">
            <title>Asappy Surveys - Not Found</title>
            <span className="text-center text-xl sm:text-3xl md:text-4xl lg:text-6xl mx-25">we couldnt find the page your looking for...</span>
            <Link className={card1} to="/">
                <ArrowLeft className="text-primary-400 transition duration-200 group-hover:-translate-x-2 group-hover:text-accent-300" aria-hidden="true" />
                <span>Go Home</span>
            </Link>
        </div>
    )
}