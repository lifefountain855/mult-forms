interface ToastProps {
  message: string;
  tone?: 'success' | 'error';
}

export default function Toast({ message, tone = 'success' }: ToastProps) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`fixed right-4 top-4 z-50 max-w-sm rounded-lg border px-4 py-3 text-sm shadow-lg ${
        tone === 'error'
          ? 'border-red-400/50 bg-red-950 text-red-200'
          : 'border-accent-400/50 bg-primary-900 text-accent-200'
      }`}
    >
      {message}
    </div>
  );
}
