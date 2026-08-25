import React from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Film,
  Heart,
  KeyRound,
  Music2,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Wand2,
  Youtube,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ShortsGallery from '../components/ShortsGallery';

const MOODS = ['# CINEMATIC', '# MELANCHOLY', '# LATE_NIGHT', '# ETHEREAL', '# SOFT_FOCUS', '# MAIN_CHARACTER'];

const BENTO_ART = [
  { title: 'Velvet after midnight', label: 'Visual study / 01', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=82' },
  { title: 'Echoes in the room', label: 'Visual study / 02', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=82' },
  { title: 'City rain, slow frame', label: 'Visual study / 03', image: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1200&q=82' },
];

const Home = () => (
  <div className="marketing-home mx-auto max-w-[1440px] pb-16">
    <section className="marketing-hero" aria-labelledby="marketing-hero-title">
      <div className="marketing-hero-copy">
        <p className="marketing-kicker"><span className="marketing-kicker-dot" aria-hidden="true" /> Star Lyrix / Creator Studio</p>
        <h1 id="marketing-hero-title">Turn a lyric into a <em>world.</em></h1>
        <p className="marketing-hero-lede">A cinematic home for the words that stay with you—and the creators ready to give them a visual life.</p>
        <div className="marketing-hero-actions">
          <Link to="/auth" className="btn-primary marketing-primary-action"><Sparkles className="h-4 w-4" aria-hidden="true" /> Start creating <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
          <Link to="/lyrics" className="marketing-text-action"><BookOpen className="h-4 w-4" aria-hidden="true" /> Enter the Reading Room</Link>
          <Link to="/shorts" className="marketing-text-action"><Youtube className="h-4 w-4" aria-hidden="true" /> Watch Shorts</Link>
        </div>
        <div className="marketing-hero-footnote"><span className="marketing-footnote-mark">01</span><span>Original-first. Rights-aware. No autoplay.</span></div>
      </div>

      <div className="marketing-hero-stage" aria-label="Star Lyrix cinematic visual preview">
        <img src="/metaimage.webp" alt="Star Lyrix golden music artwork" className="marketing-hero-image" width="1600" height="900" fetchPriority="high" />
        <div className="marketing-hero-veil" aria-hidden="true" />
        <div className="marketing-hero-ring marketing-hero-ring-one" aria-hidden="true" />
        <div className="marketing-hero-ring marketing-hero-ring-two" aria-hidden="true" />
        <div className="marketing-hero-stage-top"><span>STUDIO NOTE / 001</span><span className="marketing-live-dot"><span aria-hidden="true" /> Live in the words</span></div>
        <div className="marketing-hero-quote"><span className="marketing-quote-mark">“</span><p>Where music meets words, a story begins.</p><span className="marketing-quote-credit">Star Lyrix / Cinema for your ears</span></div>
        <div className="marketing-hero-stage-bottom"><span><Music2 className="h-3.5 w-3.5" aria-hidden="true" /> Visual worlds for original lyrics</span><span>01 / 03</span></div>
      </div>
    </section>

    <div className="marketing-marquee" aria-label="Star Lyrix public surfaces">
      <span>Original lyrics</span><i aria-hidden="true" />
      <span>Authorized reading</span><i aria-hidden="true" />
      <span>Short visual stories</span><i aria-hidden="true" />
      <span>BYOK creator studio</span><i aria-hidden="true" />
      <span>Original lyrics</span>
    </div>

    <section className="marketing-discovery" aria-labelledby="marketing-discovery-title">
      <div className="marketing-section-heading marketing-section-heading-row"><div><p className="marketing-kicker">Cinema for your ears</p><h2 id="marketing-discovery-title">Find your<br /><span>atmosphere.</span></h2></div><Link to="/search" className="marketing-outline-action"><Search className="h-4 w-4" aria-hidden="true" /> Explore the archive <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></div>
      <div className="marketing-discovery-grid">
        <Link to="/shorts" className="marketing-discovery-feature group"><img src="https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1800&q=84" alt="Cinematic stage lights over a music crowd" loading="lazy" decoding="async" width="1800" height="1100" /><span className="marketing-discovery-overlay" aria-hidden="true" /><span className="marketing-discovery-badge">FEATURED / THE VISUAL ARCHIVE</span><div className="marketing-discovery-feature-copy"><h3>The architecture of a feeling.</h3><p>Long-form lyric worlds, short visual moments, and the space between them.</p><span className="marketing-text-action">Enter the archive <ArrowRight className="h-4 w-4" aria-hidden="true" /></span></div></Link>
        <Link to="/lyrics" className="marketing-discovery-lyric group"><div className="marketing-discovery-card-top"><span className="marketing-mono-label">LYRIC OF THE DAY</span><Heart className="h-4 w-4" aria-hidden="true" /></div><p className="marketing-discovery-quote">“Let the quiet carry what the noise could not.”</p><div className="marketing-discovery-card-bottom"><span><strong>Original study</strong><small>Star Lyrix / Reading Room</small></span><span className="marketing-round-arrow"><ArrowUpRight className="h-4 w-4" aria-hidden="true" /></span></div></Link>
        {BENTO_ART.map((card) => <Link key={card.title} to="/search" className="marketing-discovery-tile group"><img src={card.image} alt="" loading="lazy" decoding="async" width="1200" height="800" /><span className="marketing-discovery-overlay" aria-hidden="true" /><span className="marketing-mono-label">{card.label}</span><div><h3>{card.title}</h3><span className="marketing-tile-arrow"><ArrowUpRight className="h-4 w-4" aria-hidden="true" /></span></div></Link>)}
      </div>
      <div className="marketing-mood-strip"><span className="marketing-mood-label"><Music2 className="h-4 w-4" aria-hidden="true" /> Find your atmosphere</span><div className="marketing-mood-chips">{MOODS.map((mood) => <Link key={mood} to={`/search?q=${encodeURIComponent(mood.replace('# ', '').replace(/_/g, ' '))}`} className="marketing-mood-chip">{mood}</Link>)}</div></div>
    </section>

    <section className="marketing-paths" aria-labelledby="marketing-paths-title">
      <div className="marketing-section-heading"><p className="marketing-kicker">The Star Lyrix loop</p><h2 id="marketing-paths-title">One line.<br /><span>Many worlds.</span></h2></div>
      <div className="marketing-path-grid"><PathCard href="/auth" number="01" icon={<Wand2 className="h-5 w-5" />} title="Write" text="Shape an original lyric draft with the AI provider you choose." tone="gold" /><PathCard href="/lyrics" number="02" icon={<Film className="h-5 w-5" />} title="Frame" text="Move from a feeling to a scene, a visual language, a story." tone="rose" /><PathCard href="/shorts" number="03" icon={<Youtube className="h-5 w-5" />} title="Share" text="Cut the moment into Shorts when the rights are clear." tone="sage" /></div>
    </section>

    <section className="marketing-channel-section" aria-labelledby="marketing-channel-title">
      <div className="marketing-section-heading marketing-section-heading-row"><div><p className="marketing-kicker">From the Star Lyrix channel</p><h2 id="marketing-channel-title">Short stories.<br /><span>Bright hooks.</span></h2></div><a href="https://www.youtube.com/@starlyrix" target="_blank" rel="noreferrer" className="marketing-outline-action"><Youtube className="h-4 w-4" aria-hidden="true" /> Visit @starlyrix <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a></div>
      <div className="marketing-channel-layout"><article className="marketing-channel-feature"><div className="marketing-channel-feature-art"><div className="marketing-channel-feature-orbit" aria-hidden="true" /><div className="marketing-channel-feature-center"><Play className="h-7 w-7 fill-current" aria-hidden="true" /><span>PLAY THE FEELING</span></div></div><div className="marketing-channel-feature-copy"><p className="marketing-mono-label">CHANNEL / SHORTS</p><h3>Lyrics you can see.</h3><p>A curated window into the visual world behind Star Lyrix. The full gallery lives on YouTube.</p><a href="https://www.youtube.com/@starlyrix" target="_blank" rel="noreferrer" className="marketing-text-action">Watch on YouTube <ArrowRight className="h-4 w-4" aria-hidden="true" /></a></div></article><div className="marketing-channel-rail" aria-label="Shorts visual rail"><RailCard number="01" title="A line worth replaying" /><RailCard number="02" title="A feeling in motion" /><RailCard number="03" title="The hook stays" /></div></div>
      <div className="marketing-shorts-gallery-shell"><ShortsGallery limit={3} compact showHeader={false} /></div>
    </section>

    <section className="marketing-reader-section" aria-labelledby="marketing-reader-title"><div className="marketing-reader-copy"><p className="marketing-kicker">Public Reading Room</p><h2 id="marketing-reader-title">The words are<br /><span>the interface.</span></h2><p>Find the song, keep the words in the right room. Search catalog identity with Spotify, then read lyrics only when an approved source makes them available.</p><Link to="/lyrics" className="marketing-primary-action btn-primary"><BookOpen className="h-4 w-4" aria-hidden="true" /> Open Lyrics Reader <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link><div className="marketing-source-note"><span className="marketing-source-line" aria-hidden="true" /><span>Spotify for identity · licensed lyrics when available</span></div></div><div className="marketing-reading-card"><div className="marketing-reading-top"><span className="marketing-mono-label">READING ROOM / PREVIEW</span><span className="marketing-reading-status"><span aria-hidden="true" /> READY</span></div><div className="marketing-reading-meta"><div className="marketing-reading-art"><span>SL</span></div><div><h3>Where music meets words</h3><p>Star Lyrix / Original study</p></div></div><div className="marketing-lyric-lines"><p className="muted">A little light finds the room</p><p className="active">and every quiet word glows gold.</p><p>Stay for the line that stays.</p></div><div className="marketing-reading-progress"><span /><span>00:18</span><span>01:42</span></div><div className="marketing-reading-bottom"><span><ShieldCheck className="h-4 w-4" aria-hidden="true" /> Rights-aware display</span><Link to="/lyrics" aria-label="Open full Lyrics Reader"><ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></div></div></section>

    <section className="marketing-create-section" aria-labelledby="marketing-create-title"><div className="marketing-create-ghost" aria-hidden="true">CREATE</div><div className="marketing-create-content"><p className="marketing-kicker">For artists, writers, and visual dreamers</p><h2 id="marketing-create-title">Make something<br /><em>that sounds like you.</em></h2><p>Your private studio for original lyric work, provider control, and the first frame of a visual story.</p><div className="flex flex-wrap items-center gap-4"><Link to="/auth" className="marketing-primary-action btn-primary"><KeyRound className="h-4 w-4" aria-hidden="true" /> Enter Creator Studio <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link><Link to="/submit" className="marketing-text-action">Submit a video <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div></div><div className="marketing-create-mark"><span>ST</span><small>STAR<br />LYRIX</small></div></section>

    <section className="marketing-trust" aria-label="Star Lyrix content principles"><div><Check className="h-4 w-4" aria-hidden="true" /><span>Original-first AI</span></div><div><Check className="h-4 w-4" aria-hidden="true" /><span>Licensed lyrics when available</span></div><div><Check className="h-4 w-4" aria-hidden="true" /><span>Authorized playback only</span></div><div><Check className="h-4 w-4" aria-hidden="true" /><span>No scraped lyric pages</span></div></section>
  </div>
);

const PathCard: React.FC<{ href: string; number: string; icon: React.ReactNode; title: string; text: string; tone: string }> = ({ href, number, icon, title, text, tone }) => <Link to={href} className={`marketing-path-card marketing-path-${tone}`}><div className="marketing-path-top"><span>{number}</span><span className="marketing-path-icon">{icon}</span></div><h3>{title}</h3><p>{text}</p><span className="marketing-path-arrow" aria-hidden="true"><ArrowUpRight className="h-4 w-4" /></span></Link>;

const RailCard: React.FC<{ number: string; title: string }> = ({ number, title }) => <a href="https://www.youtube.com/@starlyrix" target="_blank" rel="noreferrer" className="marketing-rail-card"><span className="marketing-mono-label">{number} / SHORT</span><span className="marketing-rail-visual"><span className="marketing-rail-play"><Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" /></span></span><strong>{title}</strong><span className="marketing-rail-link">Watch <ArrowUpRight className="h-3 w-3" aria-hidden="true" /></span></a>;

export default Home;
