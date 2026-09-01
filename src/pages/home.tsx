import allSurveys from '../assets/surveys.json';
import { Link } from 'react-router-dom'
import { ArrowUpRight, CalendarDays } from 'lucide-react';
import { motion } from 'motion/react';
import UserProfile from "../lib/User"

export const USER = UserProfile.initLoad()

const cardVariants = {
    initial: {opacity: 0, y: 18},
    hover: { y: -8, scale: 1.01 }
}
const arrowVariants = {
    inital: { x: 0, y: 0, scale:1 },
    hover: { x: 4, y: -4, scale:1.1}
}

export default function Home() {
    const card1 = "relative flex flex-col gap-3 rounded-2xl border border-primary-500 bg-primary-700/10 p-6 shadow-sm transition-colors duration-300"

    return (
        <div className='m-5 mt-10 flex items-center flex-col gap-10'>
            <title>Asappy Surveys</title>
            <p className="text-5xl text-primary-100">surveys</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 w-3/4 max-w-2xl">
                {allSurveys.map((survey, index) => (
                    survey.visible && (
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
                            <Link className={`${card1} group block h-full`} to={survey.link}>
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
                                <span className="text-xs ml-auto mt-auto -mb-2 text-primary-500 italic flex flex-row gap-2"><CalendarDays size={14} aria-hidden="true" />{survey.publishStamp[0]}/{survey.publishStamp[1]}/{survey.publishStamp[2]}</span>
                            </Link>
                        </motion.div>
                    )
                ))}
            </div>
        </div>
    )
}