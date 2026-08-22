import React from 'react';
import { ArrowUpRight, BookOpen, Compass, Library, Search, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Command = {
  label: string;
  hint: string;
  href: string;
  icon: React.ElementType;
};

const COMMANDS: Command[] = [
  { label: 'Discover', hint: 'Find a new feeling', href: '/', icon: Compass },
  { label: 'Read lyrics', hint: 'Open the infinite field', href: '/search', icon: BookOpen },
  { label: 'Create lyrics', hint: 'Open your lyric studio', href: '/ai-lyrics', icon: Sparkles },
  { label: 'Your library', hint: 'Playlists and saved work', href: '/playlists', icon: Library },
];

const CommandPalette: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = React.useState('');
  const [activeIndex, setActiveIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const filtered = COMMANDS.filter((command) => `${command.label} ${command.hint}`.toLowerCase().includes(query.toLowerCase()));

  React.useEffect(() => {
    if (!open) return;
    setQuery('');
    setActiveIndex(0);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, Math.max(filtered.length - 1, 0)));
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
      }
      if (event.key === 'Enter' && filtered[activeIndex]) {
        navigate(filtered[activeIndex].href);
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex, filtered, navigate, onClose, open]);

  if (!open) return null;

  return (
    <div className="command-palette-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <section className="command-palette" role="dialog" aria-modal="true" aria-labelledby="command-palette-title">
        <div className="command-palette-search">
          <Search className="h-5 w-5" aria-hidden="true" />
          <label htmlFor="command-palette-input" className="sr-only">Search Star Lyrix</label>
          <input ref={inputRef} id="command-palette-input" value={query} onChange={(event) => { setQuery(event.target.value); setActiveIndex(0); }} placeholder="Search Star Lyrix or jump to…" />
          <kbd>ESC</kbd>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close command palette"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-3 pb-3 pt-4"><p id="command-palette-title" className="eyebrow px-3">Quick jump</p></div>
        <div className="command-palette-list">
          {filtered.length > 0 ? filtered.map((command, index) => { const Icon = command.icon; return <button type="button" key={command.href} className={`command-palette-item ${index === activeIndex ? 'is-active' : ''}`} onMouseEnter={() => setActiveIndex(index)} onClick={() => { navigate(command.href); onClose(); }}><span className="command-palette-icon"><Icon className="h-4 w-4" /></span><span className="min-w-0 text-left"><strong>{command.label}</strong><small>{command.hint}</small></span><ArrowUpRight className="ml-auto h-4 w-4" /></button>; }) : <p className="px-6 py-8 text-center text-sm text-[var(--text-muted)]">No quick jumps found. Try a song, mood, or action.</p>}
        </div>
        <div className="command-palette-footer"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> open</span><span><kbd>/</kbd> command search</span></div>
      </section>
    </div>
  );
};

export default CommandPalette;
