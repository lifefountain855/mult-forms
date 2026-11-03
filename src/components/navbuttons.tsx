import { Link } from 'react-router-dom'
import { ShieldCheck, HomeIcon, UserRound } from 'lucide-react'

const defaultStyle='inline-flex items-center gap-3 rounded-lg border px-4 py-3 hover:border-accent-400'
const defaultText='border-primary-600 text-primary-100'
const onBg='bg-primary-800'
const offBg='bg-primary-950'

export function AdminDashButton({ currentPage }: { currentPage: string }) {
    return (<Link
        to="/admin/results"
        className={`${defaultStyle} ${currentPage == 'admin' ? onBg : offBg } text-accent-200 border-accent-800`}>
        <ShieldCheck className="size-5" />
        Results
    </Link>)
}
export function HomeButton({ currentPage }: { currentPage: string }) {
    return (<Link
        to="/"
        className={`${defaultStyle} ${defaultText} ${currentPage == 'home' ? onBg : offBg }`}>
        <HomeIcon className="size-5" />
        Home
    </Link>)
}
export function AccountButton({ currentPage }: { currentPage: string }) {
    return (<Link
        to="/account"
        className={`${defaultStyle} ${defaultText} ${currentPage == 'account' ? onBg : offBg }`}
    >
        <UserRound className="size-4" />
        Account
    </Link>)
}