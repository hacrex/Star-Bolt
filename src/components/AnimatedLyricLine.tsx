import React from 'react';

type AnimatedLyricLineProps = {
  line: string;
  lineNumber: number;
  isActive: boolean;
  isPast: boolean;
  progress: number;
  onSelect: (lineNumber: number) => void;
};

const AnimatedLyricLine: React.FC<AnimatedLyricLineProps> = ({ line, lineNumber, isActive, isPast, progress, onSelect }) => {
  const safeProgress = Math.min(1, Math.max(0, progress));
  const lineRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    if (!isActive || !lineRef.current) return;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    lineRef.current.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  }, [isActive]);

  return (
    <button
      ref={lineRef}
      type="button"
      className={`reading-room-line ${isActive ? 'is-active' : ''} ${isPast ? 'is-past' : ''}`}
      onClick={() => onSelect(lineNumber)}
      aria-current={isActive ? 'time' : undefined}
      aria-pressed={isActive}
      style={{ '--lyric-progress': `${safeProgress * 100}%` } as React.CSSProperties}
    >
      <span className="reading-room-line-text">{line}</span>
      <span className="reading-room-line-progress" aria-hidden="true" />
    </button>
  );
};

export default AnimatedLyricLine;
