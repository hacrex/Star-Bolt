import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import ShortsGallery from '../components/ShortsGallery';

const CHANNEL_URL = 'https://www.youtube.com/@starlyrix';

const Shorts = () => (
  <div className="marketing-shorts-page mx-auto max-w-[1440px] pb-16">
    <header className="marketing-shorts-hero">
      <div className="marketing-shorts-hero-copy">
        <Link to="/" className="marketing-back-link"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Discover</Link>
        <p className="marketing-kicker mt-10"><span className="marketing-kicker-dot" aria-hidden="true" /> Star Lyrix / Channel archive</p>
        <h1>Short stories.<br /><em>Bright hooks.</em></h1>
        <p className="marketing-shorts-lede">A focused visual window into the official Star Lyrix channel. Watch a moment on YouTube, then come back when a line asks to be read.</p>
        <div className="marketing-hero-actions">
          <a href={CHANNEL_URL} target="_blank" rel="noreferrer" className="btn-primary marketing-primary-action"><Youtube className="h-4 w-4" aria-hidden="true" /> Open @starlyrix on YouTube <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>
          <Link to="/lyrics" className="marketing-text-action"><BookOpen className="h-4 w-4" aria-hidden="true" /> Enter the Reading Room</Link>
        </div>
        <div className="marketing-shorts-metadata"><span>CHANNEL / SHORTS</span><i aria-hidden="true" /><span>CURATED METADATA</span><i aria-hidden="true" /><span>WATCH ON YOUTUBE</span></div>
      </div>
      <div className="marketing-shorts-plaque" aria-label="Star Lyrix official channel plaque">
        <div className="marketing-shorts-plaque-orbit" aria-hidden="true" />
        <div className="marketing-shorts-plaque-mark"><span>SL</span></div>
        <p className="marketing-mono-label">THE OFFICIAL STAR LYRIX CHANNEL</p>
        <strong>@starlyrix</strong>
        <span className="marketing-shorts-plaque-note">Short visual stories for the words that stay.</span>
      </div>
    </header>

    <section className="marketing-shorts-stage" aria-labelledby="shorts-stage-title">
      <div className="marketing-section-heading marketing-section-heading-row">
        <div><p className="marketing-kicker">From the Star Lyrix channel</p><h2 id="shorts-stage-title">A little cinema<br /><span>for your scroll.</span></h2></div>
        <a href={CHANNEL_URL} target="_blank" rel="noreferrer" className="marketing-outline-action"><span>Visit the channel</span><ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>
      </div>
      <div className="marketing-shorts-gallery-frame"><ShortsGallery limit={12} showHeader={false} /></div>
      <p className="marketing-source-note"><span className="marketing-source-line" aria-hidden="true" /><span>Cached YouTube metadata · the channel is the source of playback · no public media is copied here</span></p>
    </section>

    <section className="marketing-shorts-return" aria-label="Continue exploring Star Lyrix">
      <div><p className="marketing-kicker">Keep the line close</p><h2>Find the song.<br /><span>Read the line.</span></h2></div>
      <Link to="/lyrics" className="marketing-primary-action btn-primary">Open Lyrics Reader <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
    </section>
  </div>
);

export default Shorts;
