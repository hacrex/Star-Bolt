import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useSongStore } from '../store/songStore';
import { ArrowRight, BookOpen, Globe2, Music2, Play, Plus, Share2, Wand2 } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import FeaturedCarousel from '../components/FeaturedCarousel';
import CategorySection from '../components/CategorySection';
import FeaturedArtist from '../components/FeaturedArtist';
import TopNewSongs from '../components/TopNewSongs';
import TrendingSection from '../components/TrendingSection';

const Home = () => {
  const { songs, loading, fetchSongs } = useSongStore();
  const { user } = useAuthStore();

  React.useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  return (
    <div className="space-y-14">
      <section className="relative overflow-hidden rounded-[2rem] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-6 py-12 shadow-[var(--shadow-glow)] sm:px-10 sm:py-16 lg:px-16">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[rgba(212,168,67,0.12)] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-1/3 h-72 w-72 rounded-full bg-[rgba(212,168,67,0.06)] blur-3xl" />
        <div className="relative grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="eyebrow">Discover / Create / Share</p>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[1.08] tracking-[-0.04em] text-[var(--text-primary)] sm:text-6xl">
              Find the words that <span className="text-[var(--gold-light)]">stay with you.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              A warmer home for lyrics, lyric videos, and the people who make music feel bigger than a moment.
            </p>
            <div className="mt-8">
              <SearchBar />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/search" className="btn-primary"><BookOpen className="h-4 w-4" /> Explore lyrics</Link>
              <Link to="/videos" className="btn-secondary"><Play className="h-4 w-4" /> Watch Star Lyrix</Link>
              <Link to="/ai-lyrics" className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-[var(--gold-light)] transition-colors hover:bg-[var(--bg-elevated)]"><Wand2 className="h-4 w-4" /> Create lyrics <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>

          <div className="relative hidden min-h-[280px] lg:block">
            <div className="absolute right-0 top-0 w-64 rotate-[-6deg] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5 shadow-[var(--shadow-card)]">
              <p className="eyebrow">Now playing</p>
              <div className="mt-8 flex items-end gap-1" aria-hidden="true">
                {[28, 52, 38, 70, 46, 84, 34, 62, 48, 76, 40, 58].map((height, index) => <span key={index} className="w-1.5 rounded-full bg-[var(--gold-primary)]" style={{ height }} />)}
              </div>
              <p className="mt-7 text-sm font-semibold text-[var(--text-primary)]">Your next favorite line</p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">A little light for the late-night scroll.</p>
            </div>
            <div className="absolute bottom-0 left-0 w-60 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-deep)] p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]"><span>Community pulse</span><span className="text-[var(--gold-light)]">+24%</span></div>
              <div className="mt-4 flex items-end gap-2" aria-hidden="true">
                {[32, 44, 28, 52, 40, 68, 58, 78].map((height, index) => <span key={index} className="flex-1 rounded-t bg-[var(--gold-muted)] opacity-70" style={{ height }} />)}
              </div>
              <p className="mt-4 text-sm font-semibold text-[var(--text-primary)]">Fresh voices, every day.</p>
            </div>
          </div>
        </div>

        <div className="relative mt-12 grid gap-3 border-t border-[var(--border-subtle)] pt-6 sm:grid-cols-3">
          <HeroMetric value="10+" label="languages to explore" />
          <HeroMetric value="24/7" label="lyrics discovery" />
          <HeroMetric value="100%" label="community energy" />
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div><p className="eyebrow">Made for the moment</p><h2 className="section-heading mt-2">A better way to find your next line</h2></div>
          <Link to="/ai-lyrics" className="hidden items-center gap-1 text-sm font-semibold text-[var(--gold-light)] hover:text-[var(--text-primary)] sm:inline-flex">Explore tools <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <FeatureCard icon={<Wand2 className="h-5 w-5" />} title="Create something original" body="Shape a mood, genre, and voice into lyrics that are yours to keep." href="/ai-lyrics" link="Try the generator" />
          <FeatureCard icon={<Globe2 className="h-5 w-5" />} title="Read across languages" body="Move between translations and discover the meaning behind every verse." href="/search" link="Browse translations" />
          <FeatureCard icon={<Share2 className="h-5 w-5" />} title="Keep the feeling moving" body="Save, share, and return to the songs that made you pause." href="/search" link="Start exploring" />
        </div>
      </section>

      <FeaturedCarousel />
      {!user && <FeaturedArtist />}
      <CategorySection />

      <div className="grid gap-8 lg:grid-cols-2">
        <TrendingSection />
        <TopNewSongs />
      </div>

      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div><p className="eyebrow">Freshly added</p><h2 className="section-heading mt-2">Latest songs</h2></div>
          <div className="flex gap-2">
            {user && <Link to="/add-song" className="btn-secondary text-sm"><Plus className="h-4 w-4" /> Add song</Link>}
            <Link to="/ai-lyrics" className="btn-primary text-sm"><Wand2 className="h-4 w-4" /> Generate</Link>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full flex justify-center py-16" role="status" aria-label="Loading songs"><div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--gold-primary)] border-t-transparent" /></div>
          ) : songs.length > 0 ? (
            songs.map((song) => (
              <Link key={song.id} to={`/songs/${song.id}`} className="surface-card surface-card-hover group overflow-hidden">
                {song.thumbnail_url ? <img src={song.thumbnail_url} alt={song.title} className="h-52 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" /> : <div className="flex h-52 items-center justify-center bg-[var(--bg-elevated)]"><Music2 className="h-12 w-12 text-[var(--gold-muted)]" /></div>}
                <div className="p-5"><h3 className="text-lg font-semibold text-[var(--text-primary)]">{song.title}</h3><p className="mt-1 text-sm text-[var(--text-secondary)]">{song.artist}</p>{song.album && <p className="mt-3 text-xs uppercase tracking-[0.12em] text-[var(--text-muted)]">{song.album}</p>}</div>
              </Link>
            ))
          ) : <div className="surface-card col-span-full p-12 text-center text-[var(--text-secondary)]">No songs available yet.</div>}
        </div>
      </section>
    </div>
  );
};

const HeroMetric: React.FC<{ value: string; label: string }> = ({ value, label }) => <div className="flex items-center gap-3"><span className="text-xl font-bold text-[var(--gold-light)]">{value}</span><span className="text-xs uppercase tracking-[0.12em] text-[var(--text-muted)]">{label}</span></div>;

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; body: string; href: string; link: string }> = ({ icon, title, body, href, link }) => <Link to={href} className="surface-card surface-card-hover group p-6"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(212,168,67,0.1)] text-[var(--gold-light)]">{icon}</span><h3 className="mt-5 text-lg font-semibold text-[var(--text-primary)]">{title}</h3><p className="mt-2 min-h-14 text-sm leading-6 text-[var(--text-secondary)]">{body}</p><span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[var(--gold-light)]">{link}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span></Link>;

export default Home;