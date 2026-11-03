import { AnimatePresence, motion } from 'motion/react';
import { Link } from 'react-router-dom'
import { Menu, ShieldCheck, UserRound, X, LogOut } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { AdminDashButton, HomeButton, AccountButton } from './navbuttons'

interface ShowProps {
  home:boolean,
  admin:boolean,
  account:boolean
}

export default function MobileSidebar({ onSignOut, currentPage, show={home:true,admin:false,account:false}}: { onSignOut: () => void | Promise<void>, currentPage:string, show:ShowProps}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('keydown', closeOnEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative z-50 inline-flex size-11 items-center justify-center rounded-lg border border-primary-600 bg-primary-900 text-primary-100 hover:border-accent-400 hover:text-accent-200 sm:hidden"
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={open}
        aria-controls="mobile-sidebar"
      >
        {/* Line Container */}
        <div className="relative flex size-5 items-center justify-center">
          {/* Top Line */}
          <motion.div
            className="absolute h-[2px] w-full bg-current"
            animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          />
          
          {/* Middle Line */}
          <motion.div
            className="absolute h-[2px] w-full bg-current"
            animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.15 }}
          />
          
          {/* Bottom Line */}
          <motion.div
            className="absolute h-[2px] w-full bg-current"
            animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 6 }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation menu"
              className="fixed inset-0 z-40 bg-primary-950/70 backdrop-blur-sm sm:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              id="mobile-sidebar"
              aria-label="Navigation menu"
              className="fixed inset-y-0 right-0 z-40 flex w-[min(20rem,85vw)] flex-col border-l border-primary-700 bg-primary-900 px-6 pb-8 pt-28 shadow-2xl sm:hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 360, damping: 32 }}
            >
              <nav className="flex flex-1 flex-col gap-3">
                {/* {show.home && (<Link to="/" className={`inline-flex items-center gap-3 rounded-lg border border-primary-600 ${ currentPage=='home' ? 'bg-secondary-900' : 'bg-primary-950'} px-4 py-3 text-primary-100 hover:border-accent-400`}><HomeIcon className="size-5" />Home</Link>)} */}
                {show.home && (<HomeButton currentPage={currentPage}/>)}
                {show.account && (<AccountButton currentPage={currentPage}/>)}
                {show.admin && (<AdminDashButton currentPage={currentPage}/>)}
              </nav>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  void onSignOut();
                }}
                className="mt-auto inline-flex items-center gap-3 rounded-lg border border-primary-600 bg-primary-950 px-4 py-3 text-left text-primary-100 hover:border-accent-400 hover:text-accent-200"
              >
                <LogOut className="size-5" />
                Sign out
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
