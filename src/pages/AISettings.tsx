import React from 'react';
import { Check, KeyRound, Link2, Loader2, LockKeyhole, Plus, RefreshCw, ShieldCheck, Trash2, Wifi, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AI_PROVIDERS, getAIProvider, type AIProviderId } from '../lib/aiProviders';
import { useAIStore } from '../store/aiStore';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../components/Toast';

const AISettings = () => {
  const { user } = useAuthStore();
  const { providers, providersLoading, loading, error, loadProviders, connectProvider, testProvider, removeProvider, setDefaultProvider, setProviderEnabled } = useAIStore();
  const { showToast } = useToast();
  const [selectedProvider, setSelectedProvider] = React.useState<AIProviderId>('openai');
  const [modelName, setModelName] = React.useState(getAIProvider('openai').defaultModel);
  const [baseUrl, setBaseUrl] = React.useState('');
  const [apiKey, setApiKey] = React.useState('');
  const [showConnect, setShowConnect] = React.useState(false);
  const [testing, setTesting] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;
    void loadProviders().catch(() => undefined);
  }, [loadProviders, user]);

  const definition = getAIProvider(selectedProvider);
  const connected = providers.find((provider) => provider.provider === selectedProvider);

  const chooseProvider = (provider: AIProviderId) => {
    setSelectedProvider(provider);
    const nextDefinition = getAIProvider(provider);
    setModelName(providers.find((item) => item.provider === provider)?.model_name || nextDefinition.defaultModel);
    setBaseUrl(providers.find((item) => item.provider === provider)?.base_url || '');
    setApiKey('');
    setShowConnect(true);
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      showToast('Enter a provider key to test the connection', 'error');
      return;
    }
    setTesting(true);
    try {
      await testProvider({ provider: selectedProvider, modelName: modelName.trim(), baseUrl: baseUrl.trim() || undefined, apiKey: apiKey.trim() });
      showToast('Connection successful. Your key was not saved by this test.', 'success');
    } catch {
      showToast('Connection test failed. Check the provider details.', 'error');
    } finally {
      setTesting(false);
    }
  };

  const handleConnect = async () => {
    if (!apiKey.trim()) {
      showToast('Enter a provider key to connect', 'error');
      return;
    }
    try {
      await connectProvider({ provider: selectedProvider, modelName: modelName.trim(), baseUrl: baseUrl.trim() || undefined, apiKey: apiKey.trim() });
      setApiKey('');
      setShowConnect(false);
      showToast(`${definition.name} connected securely`, 'success');
    } catch {
      showToast('Provider was not connected. No key was stored in the browser.', 'error');
    }
  };

  const handleRemove = async (provider: AIProviderId) => {
    if (!window.confirm(`Remove ${getAIProvider(provider).name} from your Star Lyrix account?`)) return;
    try {
      await removeProvider(provider);
      showToast(`${getAIProvider(provider).name} removed`, 'success');
    } catch {
      showToast('The provider could not be removed', 'error');
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Private control room</p>
          <h1 className="section-heading mt-2">AI provider settings.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">Bring your own provider for original lyric work. Star Lyrix stores only provider metadata in the app database; your raw key stays in the server-side secret vault.</p>
        </div>
        <Link to="/creator" className="btn-secondary"><Link2 className="h-4 w-4" /> Creator Studio</Link>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="space-y-3" aria-labelledby="providers-heading">
          <div className="mb-4 flex items-center justify-between"><div><p className="eyebrow">AI providers</p><h2 id="providers-heading" className="mt-2 text-xl font-semibold text-[var(--text-primary)]">Your connected tools</h2></div>{providersLoading && <Loader2 className="h-5 w-5 animate-spin text-[var(--gold-light)]" aria-label="Loading providers" />}</div>
          {AI_PROVIDERS.map((provider) => {
            const item = providers.find((entry) => entry.provider === provider.id);
            return (
              <article key={provider.id} className={`surface-card flex flex-col gap-4 p-5 transition-colors ${item?.is_default ? 'border-[rgba(242,195,91,0.48)]' : ''}`}>
                <div className="flex items-start justify-between gap-4"><div className="flex min-w-0 items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--gold-light)]"><KeyRound className="h-4 w-4" /></span><div className="min-w-0"><h3 className="font-semibold text-[var(--text-primary)]">{provider.name}</h3><p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{provider.description}</p></div></div><span className={`shrink-0 rounded-full border px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.1em] ${item?.enabled ? 'border-[rgba(112,180,132,0.35)] text-[#9dd2ac]' : 'border-[var(--border-subtle)] text-[var(--text-muted)]'}`}>{item?.enabled ? 'Connected' : 'Not connected'}</span></div>
                {item && <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]"><span className="search-chip">{item.model_name}</span><span className="search-chip">Key stored server-side</span>{item.is_default && <span className="gold-chip">Default</span>}</div>}
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="btn-secondary text-xs" onClick={() => chooseProvider(provider.id)}><RefreshCw className="h-3.5 w-3.5" /> {item ? 'Change key' : 'Add API key'}</button>
                  {item && <><button type="button" className="btn-secondary text-xs" onClick={() => void setDefaultProvider(provider.id)} disabled={loading || item.is_default}>{item.is_default ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />} {item.is_default ? 'Default provider' : 'Make default'}</button><button type="button" className="icon-button !p-2" aria-label={`${item.enabled ? 'Disable' : 'Enable'} ${provider.name}`} title={`${item.enabled ? 'Disable' : 'Enable'} provider`} onClick={() => void setProviderEnabled(provider.id, !item.enabled)} disabled={loading}>{item.enabled ? <X className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}</button><button type="button" className="icon-button !p-2 text-red-200" aria-label={`Remove ${provider.name}`} title={`Remove ${provider.name}`} onClick={() => void handleRemove(provider.id)} disabled={loading}><Trash2 className="h-4 w-4" /></button></>}
                </div>
              </article>
            );
          })}
        </section>

        <aside className="space-y-5">
          <section className="glass-panel p-5"><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[var(--gold-light)]" /><p className="eyebrow">Secret boundary</p></div><p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">Keys are sent over an authenticated request, tested server-side, and never returned to the browser. Provider errors are reduced to safe action codes.</p><div className="mt-4 flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-[#9dd2ac]"><LockKeyhole className="h-3.5 w-3.5" /> Vault-backed when migration is applied</div></section>
          <section className="surface-card p-5"><p className="eyebrow">Usage clarity</p><p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">Each generation records its provider and model. Exact billing is shown only when the provider returns reliable usage data.</p><Link to="/ai-lyrics" className="mt-4 inline-flex text-sm font-semibold text-[var(--gold-light)]">Open lyric studio →</Link></section>
        </aside>
      </div>

      {showConnect && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="connect-provider-title"><div className="surface-card w-full max-w-lg p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Connect provider</p><h2 id="connect-provider-title" className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{definition.name}</h2></div><button type="button" className="icon-button" aria-label="Close provider dialog" onClick={() => { setShowConnect(false); setApiKey(''); }}><X className="h-4 w-4" /></button></div><div className="mt-6 grid gap-4"><label className="block"><span className="ai-studio-field-label">Model name</span><input value={modelName} onChange={(event) => setModelName(event.target.value)} className="ai-studio-control" autoComplete="off" /></label>{definition.supportsBaseUrl && <label className="block"><span className="ai-studio-field-label">HTTPS base URL</span><input value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} placeholder="https://gateway.example.com/v1" className="ai-studio-control" inputMode="url" autoComplete="off" /></label>}<label className="block"><span className="ai-studio-field-label">API key <span className="normal-case tracking-normal text-[var(--text-muted)]">(never shown again)</span></span><input type="password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder={definition.keyPlaceholder} className="ai-studio-control" autoComplete="new-password" /></label></div><div className="mt-6 flex flex-wrap justify-end gap-2"><button type="button" className="btn-secondary" onClick={() => void handleTest()} disabled={testing || loading || !apiKey.trim()}>{testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wifi className="h-4 w-4" />} Test connection</button><button type="button" className="btn-primary" onClick={() => void handleConnect()} disabled={loading || !apiKey.trim()}><LockKeyhole className="h-4 w-4" /> {loading ? 'Securing…' : connected ? 'Replace key' : 'Connect securely'}</button></div>{error && <p className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100" role="alert">{error}</p>}<p className="mt-5 text-xs leading-5 text-[var(--text-muted)]">Never paste a service-role key here. Use a provider key scoped for this account and review the provider’s own terms and usage controls.</p></div></div>}
    </div>
  );
};

export default AISettings;
