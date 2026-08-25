import { ArrowRight, ArrowUpRight, Clapperboard, FileCheck2, Film, KeyRound, Mic2, ShieldCheck, Sparkles, Wand2, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

const Creators = () => (
  <div className="creators-page mx-auto max-w-[1440px] pb-16">
    <header className="creators-hero">
      <div className="creators-hero-copy">
        <Link to="/" className="marketing-back-link"><ArrowRight className="h-4 w-4 rotate-180" aria-hidden="true" /> Back to Discover</Link>
        <p className="marketing-kicker mt-10"><span className="marketing-kicker-dot" aria-hidden="true" /> For creators / Artists / Stars</p>
        <h1>Your sound<br /><em>has a face.</em></h1>
        <p className="creators-hero-lede">Star Lyrix is the creative home for artists turning original lyrics into visual stories, lyric videos, and Shorts—with the rights behind every release kept in the room.</p>
        <div className="marketing-hero-actions">
          <Link to="/auth" className="btn-primary marketing-primary-action"><Sparkles className="h-4 w-4" aria-hidden="true" /> Start creating <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
          <Link to="/submit" className="marketing-text-action"><FileCheck2 className="h-4 w-4" aria-hidden="true" /> Submit for review</Link>
        </div>
        <div className="creators-hero-note"><ShieldCheck className="h-4 w-4" aria-hidden="true" /><span>Original-first · rights-aware · no automatic publishing</span></div>
      </div>
      <div className="creators-hero-stage" aria-label="Star Lyrix artist creator pathway">
        <div className="creators-stage-orbit" aria-hidden="true" />
        <div className="creators-stage-mark"><span>ST</span></div>
        <p className="marketing-mono-label">THE ARTIST PATH / 001</p>
        <strong>Make the feeling<br /><em>visible.</em></strong>
        <div className="creators-stage-rule" aria-hidden="true" />
        <span className="creators-stage-caption">A release starts with a line worth keeping.</span>
      </div>
    </header>

    <section className="creators-intro" aria-labelledby="creators-intro-title">
      <div><p className="marketing-kicker">The artist layer</p><h2 id="creators-intro-title">One studio.<br /><span>Many ways in.</span></h2></div>
      <p>Whether you are an emerging artist, an independent label, a songwriter, or a visual storyteller, the path starts with your own work. Star Lyrix gives you a place to shape it, protect its context, and prepare it for the next frame.</p>
    </section>

    <section className="creators-features" aria-labelledby="creators-features-title">
      <div className="marketing-section-heading"><p className="marketing-kicker">The toolkit</p><h2 id="creators-features-title">Everything around<br /><span>the line.</span></h2><p className="mt-5 max-w-xl text-sm leading-7 text-[var(--marketing-sand)]">Start with what is available now. Follow the next pieces as the reviewed creative pipeline comes online.</p></div>
      <div className="creators-feature-grid">
        <FeatureCard status="available" icon={<Wand2 className="h-5 w-5" />} title="Original lyric studio" description="Shape original lyrics with the AI provider and creative direction you choose." href="/ai-lyrics" action="Open lyric studio" tone="gold" />
        <FeatureCard status="available" icon={<KeyRound className="h-5 w-5" />} title="Bring your own AI" description="Connect provider metadata privately. Your keys stay out of the browser and out of Star Lyrix content." href="/settings/ai" action="Manage providers" tone="rose" />
        <FeatureCard status="available" icon={<FileCheck2 className="h-5 w-5" />} title="Submit a release" description="Send a video for human rights and content review with an owner-scoped submission record." href="/submit" action="Open submission portal" tone="sage" />
        <FeatureCard status="available" icon={<ShieldCheck className="h-5 w-5" />} title="Rights-aware reading" description="Preview the public Reading Room boundary: catalog identity first, approved lyrics when available." href="/lyrics" action="Visit Reading Room" tone="gold" />
        <FeatureCard status="next" icon={<Film className="h-5 w-5" />} title="Lyric video direction" description="Turn a line into a visual language, shot list, and lyric-led world inside the reviewed production path." tone="rose" />
        <FeatureCard status="next" icon={<Clapperboard className="h-5 w-5" />} title="Shorts packaging" description="Prepare approved moments for vertical storytelling without confusing a draft with an official upload." tone="sage" />
        <FeatureCard status="next" icon={<Mic2 className="h-5 w-5" />} title="Voice and meaning" description="Add narration for behind-the-lyrics stories and artist context when the voice workflow is ready." tone="rose" />
        <FeatureCard status="review" icon={<Youtube className="h-5 w-5" />} title="Official channel pathway" description="Approved work may enter a future server-only publishing queue for the official @starlyrix channel." tone="gold" />
      </div>
    </section>

    <section className="creators-process" aria-labelledby="creators-process-title">
      <div className="creators-process-heading"><p className="marketing-kicker">The release path</p><h2 id="creators-process-title">From first line<br /><span>to first frame.</span></h2><p>Every stage has a different job. The creative work can move quickly; the rights decision cannot be skipped.</p></div>
      <div className="creators-process-steps">
        <ProcessStep number="01" title="Write" text="Create an original lyric draft in your private studio." tone="gold" />
        <ProcessStep number="02" title="Frame" text="Shape the scene, visual language, and release context." tone="rose" />
        <ProcessStep number="03" title="Submit" text="Share a review source and the rights basis behind it." tone="sage" />
        <ProcessStep number="04" title="Review" text="Human rights, content, and quality checks come first." tone="gold" />
        <ProcessStep number="05" title="Share" text="Only approved work can move toward publication." tone="rose" />
      </div>
    </section>

    <section className="creators-boundary" aria-labelledby="creators-boundary-title">
      <div className="creators-boundary-icon"><ShieldCheck className="h-6 w-6" aria-hidden="true" /></div>
      <div><p className="marketing-kicker">A promise to artists</p><h2 id="creators-boundary-title">Your work stays yours<br /><span>until you say what is allowed.</span></h2><p>Star Lyrix does not scrape lyrics, guess ownership, or call a submission official by default. Submitter permissions, review decisions, and future publishing actions are separate steps.</p></div>
      <Link to="/copyright" className="marketing-text-action">Read the rights guide <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
    </section>

    <section className="creators-final-cta" aria-labelledby="creators-final-title">
      <p className="marketing-kicker">For the next song</p><h2 id="creators-final-title">Build the world<br /><em>around the line.</em></h2><div className="marketing-hero-actions"><Link to="/auth" className="btn-primary marketing-primary-action">Enter Creator Studio <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link><Link to="/shorts" className="marketing-text-action">See the channel <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
    </section>
  </div>
);

type FeatureCardProps = { status: 'available' | 'review' | 'next'; icon: React.ReactNode; title: string; description: string; href?: string; action?: string; tone: 'gold' | 'rose' | 'sage' };

const FeatureCard: React.FC<FeatureCardProps> = ({ status, icon, title, description, href, action, tone }) => {
  const content = <><div className="creators-feature-top"><span className={`creators-status creators-status-${status}`}>{status === 'available' ? 'Available now' : status === 'review' ? 'Review path' : 'Coming next'}</span><span className={`creators-feature-icon creators-feature-${tone}`}>{icon}</span></div><h3>{title}</h3><p>{description}</p>{href && action ? <span className="creators-feature-action">{action}<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></span> : <span className="creators-feature-note">Pipeline phase</span>}</>;
  return href ? <Link to={href} className="creators-feature-card">{content}</Link> : <div className="creators-feature-card creators-feature-card-muted">{content}</div>;
};

const ProcessStep: React.FC<{ number: string; title: string; text: string; tone: string }> = ({ number, title, text, tone }) => <div className={`creators-process-step creators-process-${tone}`}><span className="creators-process-number">{number}</span><div><h3>{title}</h3><p>{text}</p></div></div>;

export default Creators;
