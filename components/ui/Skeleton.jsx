export default function Skeleton({ className = "h-4 w-full", shimmer = true }) {
  return (
    <div
      className={`relative overflow-hidden rounded-md bg-neutral-200 ${className}`}
    >
      {shimmer && (
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      )}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}


