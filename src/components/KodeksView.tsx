/**
 * 🛠️ KodeksView — App Studio 2.0: Kodeks buduje apkę, Ty patrzysz i decydujesz.
 *
 * Lewa kolumna: projekty (nowy / wybór). Środek: zadanie dla Kodeksa + dziennik kroków
 * na żywo (model → pliki → build → test → gotowe). Prawa: podgląd zbudowanej apki
 * (iframe z mostu, /apki/<id>/), zrzut z puppeteera, historia iteracji, „Cofnij".
 *
 * Nic tu nie generuje kodu w przeglądarce — całość robi most (services/AppStudio.js).
 * Gdy most śpi, mówimy to wprost zamiast udawać pustą listę.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bot, Hammer, Loader2, Plus, RotateCcw, Trash2, ExternalLink, RefreshCw, Camera } from 'lucide-react';
import { adresPodgladu, adresZrzutu, buduj, cofnij, nowyProjekt, projekt as pobierzProjekt, projekty as pobierzProjekty, silniki as pobierzSilniki, usunProjekt, type Krok, type Projekt, type ProjektLista, type Silnik } from '../services/kodeks';

const KOLOR: Record<string, string> = { model: 'text-cyan-300', postep: 'text-slate-500', pliki: 'text-emerald-300', build: 'text-emerald-300', test: 'text-emerald-300', blad: 'text-rose-300', koniec: 'text-amber-300', start: 'text-slate-400', stan: 'text-slate-400' };

const PRZYKLADY = [
    'Lista zadań z priorytetami, filtrem „do zrobienia/zrobione" i zapisem w localStorage.',
    'Licznik oddechu 4-7-8: koło rośnie 4 s, stoi 7 s, maleje 8 s; Start/Stop; licznik cykli.',
    'Kalkulator GRV: przelicznik godzin pracy na GRV z tabelą stawek i historią.',
];

const KodeksView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [lista, setLista] = useState<ProjektLista[] | null>(null);
    const [mostOffline, setMostOffline] = useState(false);
    const [wybrany, setWybrany] = useState<Projekt | null>(null);
    const [nazwa, setNazwa] = useState('');
    const [opis, setOpis] = useState('');
    const [zadanie, setZadanie] = useState('');
    const [kroki, setKroki] = useState<Krok[]>([]);
    const [pracuje, setPracuje] = useState(false);
    const [zrzutT, setZrzutT] = useState(Date.now());
    const [podgladT, setPodgladT] = useState(Date.now());
    const [blad, setBlad] = useState<string | null>(null);
    // Silnik Kodeksa: lokalny domyślnie; chmura to świadomy wybór (kod wychodzi z Katedry).
    const [silniki, setSilniki] = useState<Silnik[]>([]);
    const [silnik, setSilnik] = useState<string>('');
    const dziennikRef = useRef<HTMLDivElement>(null);

    const odswiezListe = useCallback(async () => {
        try { setLista(await pobierzProjekty()); setMostOffline(false); }
        catch { setLista([]); setMostOffline(true); }
    }, []);
    const odswiezProjekt = useCallback(async (id: string) => {
        try { const p = await pobierzProjekt(id); setWybrany(p); setZrzutT(Date.now()); setPodgladT(Date.now()); if (p.zadanieWToku) setPracuje(true); }
        catch (e) { setBlad((e as Error).message); }
    }, []);

    useEffect(() => { void odswiezListe(); }, [odswiezListe]);
    useEffect(() => { pobierzSilniki().then((s) => { setSilniki(s); setSilnik((s.find((x) => x.domyslny) ?? s[0])?.model ?? ''); }).catch(() => setSilniki([])); }, []);
    useEffect(() => { dziennikRef.current?.scrollTo({ top: dziennikRef.current.scrollHeight }); }, [kroki]);

    const utworz = async () => {
        setBlad(null);
        try {
            const p = await nowyProjekt(nazwa, opis);
            setNazwa(''); setOpis('');
            await odswiezListe();
            await odswiezProjekt(p.id);
            setKroki([]);
            if (opis.trim()) setZadanie(opis.trim());
        } catch (e) { setBlad((e as Error).message); }
    };

    const zlec = async () => {
        if (!wybrany || !zadanie.trim()) return;
        setPracuje(true); setBlad(null); setKroki([]);
        try {
            await buduj(wybrany.id, zadanie.trim(), (k) => {
                setKroki((prev) => k.typ === 'postep' && prev.at(-1)?.typ === 'postep' ? [...prev.slice(0, -1), k] : [...prev, k]);
                if (k.typ === 'test' || k.typ === 'koniec') { setZrzutT(Date.now()); setPodgladT(Date.now()); }
            }, silnik || undefined);
        } catch (e) { setBlad((e as Error).message); }
        finally { setPracuje(false); await odswiezProjekt(wybrany.id); await odswiezListe(); }
    };

    const cofnijZmiane = async () => {
        if (!wybrany) return;
        try { const r = await cofnij(wybrany.id); setKroki((p) => [...p, { typ: 'stan', tekst: `↩ cofnięto do ${r.commit}${r.build.ok ? ', dist przebudowany' : ' — build padł: ' + r.build.etap}` }]); await odswiezProjekt(wybrany.id); }
        catch (e) { setBlad((e as Error).message); }
    };

    const usun = async () => {
        if (!wybrany || !window.confirm(`Usunąć projekt „${wybrany.nazwa}" razem z jego kodem? Tego nie da się cofnąć.`)) return;
        try { await usunProjekt(wybrany.id); setWybrany(null); setKroki([]); await odswiezListe(); }
        catch (e) { setBlad((e as Error).message); }
    };

    return (
        <div className="min-h-screen bg-[#05070d] text-white font-sans">
            <header className="flex items-center gap-3 px-5 py-3 border-b border-white/10 bg-black/60 backdrop-blur">
                <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/10 text-slate-300" title="Wróć"><ArrowLeft className="w-4 h-4" /></button>
                <Bot className="w-5 h-5 text-emerald-400" />
                <div>
                    <h1 className="text-lg font-bold leading-tight">Kodeks buduje</h1>
                    <p className="text-[11px] text-slate-400">TeOgochi od kodu pisze apkę w piaskownicy mostu, sprawdza ją w przeglądarce i poprawia sam — Ty zatwierdzasz albo cofasz.</p>
                </div>
                <button onClick={odswiezListe} className="ml-auto p-2 rounded-lg hover:bg-white/10 text-slate-400" title="Odśwież"><RefreshCw className="w-4 h-4" /></button>
            </header>

            {mostOffline && <div className="mx-5 mt-4 rounded-xl border border-amber-500/40 bg-amber-950/30 px-4 py-3 text-sm text-amber-200">Most (127.0.0.1:3001) nie odpowiada — Kodeks mieszka w moście, bez niego to studio nic nie zbuduje. Uruchom Katedrę.</div>}
            {blad && <div className="mx-5 mt-4 rounded-xl border border-rose-500/40 bg-rose-950/30 px-4 py-3 text-sm text-rose-200">{blad}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_1fr] gap-4 p-5">
                {/* PROJEKTY */}
                <aside className="space-y-3">
                    <div className="rounded-2xl border border-white/10 bg-black/50 p-3 space-y-2">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5"><Plus className="w-3 h-3" /> Nowa apka</p>
                        <input value={nazwa} onChange={(e) => setNazwa(e.target.value)} placeholder="Nazwa" className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500/60" />
                        <textarea value={opis} onChange={(e) => setOpis(e.target.value)} placeholder="Co ma robić? (to będzie pierwsze zadanie Kodeksa)" rows={3} className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald-500/60 resize-none" />
                        <button onClick={utworz} disabled={!nazwa.trim() || mostOffline} className="w-full py-2 rounded-lg text-sm font-semibold bg-emerald-600/80 hover:bg-emerald-600 disabled:opacity-40">Załóż projekt</button>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/50 p-2 space-y-1 max-h-[60vh] overflow-y-auto">
                        {lista === null ? <p className="text-xs text-slate-500 p-2">Łączę z mostem…</p>
                            : lista.length === 0 ? <p className="text-xs text-slate-500 p-2">Jeszcze żadnej apki. Załóż pierwszą.</p>
                                : lista.map((p) => (
                                    <button key={p.id} onClick={() => { void odswiezProjekt(p.id); setKroki([]); }} className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${wybrany?.id === p.id ? 'bg-emerald-900/40 border border-emerald-500/40' : 'hover:bg-white/5 border border-transparent'}`}>
                                        <p className="text-sm font-semibold truncate">{p.nazwa}</p>
                                        <p className="text-[10px] text-slate-500 font-mono">{p.id} · {p.iteracji} iter. · {p.zbudowana ? '✓ zbudowana' : 'tylko szablon'}</p>
                                    </button>
                                ))}
                    </div>
                </aside>

                {/* ZADANIE + DZIENNIK */}
                <section className="space-y-3 min-w-0">
                    {wybrany ? (
                        <>
                            <div className="rounded-2xl border border-white/10 bg-black/50 p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold">{wybrany.nazwa} <span className="text-[10px] font-mono text-slate-500">{wybrany.id}</span></p>
                                    <div className="flex gap-1">
                                        <button onClick={cofnijZmiane} disabled={pracuje || wybrany.historia.filter((h) => h.commit).length === 0} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 disabled:opacity-30" title="Cofnij ostatnią zmianę Kodeksa"><RotateCcw className="w-4 h-4" /></button>
                                        <button onClick={usun} disabled={pracuje} className="p-1.5 rounded-lg hover:bg-rose-900/40 text-rose-300 disabled:opacity-30" title="Usuń projekt"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <textarea value={zadanie} onChange={(e) => setZadanie(e.target.value)} placeholder="Powiedz Kodeksowi, co zbudować albo zmienić…" rows={4} disabled={pracuje} className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500/60 resize-none disabled:opacity-60" />
                                <div className="flex flex-wrap gap-1.5">
                                    {PRZYKLADY.map((p) => <button key={p} onClick={() => setZadanie(p)} disabled={pracuje} className="text-[10px] px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 disabled:opacity-40">{p.slice(0, 48)}…</button>)}
                                </div>
                                {silniki.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 shrink-0">Silnik</span>
                                        <select value={silnik} onChange={(e) => setSilnik(e.target.value)} disabled={pracuje} className="flex-1 bg-black/60 border border-white/10 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-emerald-500/60 disabled:opacity-60">
                                            {silniki.map((s) => <option key={s.id} value={s.model} disabled={!s.dostepny}>{s.etykieta}{s.dostepny ? '' : ' — brak klucza'}</option>)}
                                        </select>
                                    </div>
                                )}
                                {silniki.find((s) => s.model === silnik)?.uwaga && <p className="text-[10px] text-slate-500">{silniki.find((s) => s.model === silnik)?.uwaga}</p>}
                                <button onClick={zlec} disabled={pracuje || !zadanie.trim()} className="w-full py-2.5 rounded-lg text-sm font-semibold bg-cyan-600/80 hover:bg-cyan-600 disabled:opacity-40 flex items-center justify-center gap-2">
                                    {pracuje ? <><Loader2 className="w-4 h-4 animate-spin" /> Kodeks pracuje…</> : <><Hammer className="w-4 h-4" /> Zleć Kodeksowi</>}
                                </button>
                                <p className="text-[10px] text-slate-500 leading-snug">Pętla: model pisze → tsc + vite build → puppeteer otwiera apkę i zbiera błędy → Kodeks poprawia (do 4 rund). Na 9B z 6 GB VRAM jedna runda to kilka minut — to normalne, dziennik pokazuje postęp.</p>
                            </div>
                            <div ref={dziennikRef} className="rounded-2xl border border-white/10 bg-black/70 p-3 h-[38vh] overflow-y-auto font-mono text-[11px] space-y-1">
                                {kroki.length === 0 ? <p className="text-slate-600">Dziennik Kodeksa pojawi się tu po zleceniu.</p>
                                    : kroki.map((k, i) => <p key={i} className={KOLOR[k.typ] ?? 'text-slate-300'}><span className="text-slate-600">{(k.kiedy ?? '').slice(11, 19)}</span> {k.tekst ?? (k.typ === 'start' ? `start · ${k.model}` : k.typ === 'stan' ? `${k.stan}${k.wynik?.powod ? ' — ' + k.wynik.powod : ''}` : JSON.stringify(k))}</p>)}
                            </div>
                        </>
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-slate-500 text-sm">
                            Wybierz projekt z listy albo załóż nowy — Kodeks czeka.
                        </motion.div>
                    )}
                </section>

                {/* PODGLĄD + HISTORIA */}
                <section className="space-y-3 min-w-0">
                    {wybrany && (
                        <>
                            <div className="rounded-2xl border border-white/10 bg-black/50 overflow-hidden">
                                <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
                                    <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Podgląd z mostu</p>
                                    {wybrany.zbudowana && <a href={adresPodgladu(wybrany.id)} target="_blank" rel="noreferrer" className="text-[10px] text-cyan-300 flex items-center gap-1 hover:underline"><ExternalLink className="w-3 h-3" /> otwórz w karcie</a>}
                                </div>
                                {wybrany.zbudowana
                                    ? <iframe key={podgladT} src={`${adresPodgladu(wybrany.id)}?t=${podgladT}`} title="Podgląd apki" className="w-full h-[42vh] bg-white" />
                                    : <div className="h-[42vh] flex items-center justify-center text-xs text-slate-500">Jeszcze nie zbudowana — po pierwszym zleceniu pojawi się tu na żywo.</div>}
                            </div>
                            {wybrany.ostatniZrzut && (
                                <div className="rounded-2xl border border-white/10 bg-black/50 p-2">
                                    <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1 mb-1"><Camera className="w-3 h-3" /> Zrzut z testu puppeteera</p>
                                    <img src={adresZrzutu(wybrany.id, zrzutT)} alt="Zrzut z testu" className="w-full rounded-lg border border-white/10" />
                                </div>
                            )}
                            <div className="rounded-2xl border border-white/10 bg-black/50 p-3">
                                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">Historia iteracji</p>
                                {wybrany.historia.length === 0 ? <p className="text-xs text-slate-600">Tylko szablon.</p>
                                    : <ul className="space-y-1 max-h-[22vh] overflow-y-auto">
                                        {[...wybrany.historia].reverse().map((h, i) => (
                                            <li key={i} className="text-[11px] flex gap-2">
                                                <span className={h.ok ? 'text-emerald-400' : 'text-rose-400'}>{h.ok ? '✓' : '✗'}</span>
                                                <span className="text-slate-500 font-mono shrink-0">{h.kiedy.slice(5, 16).replace('T', ' ')}</span>
                                                <span className="text-slate-300 truncate" title={h.tresc}>{h.tresc}</span>
                                                <span className="text-slate-600 font-mono shrink-0">{h.rundy ? `${h.rundy} r · ${h.sekundy} s` : ''}{h.commit ? ` · ${h.commit}` : ''}</span>
                                            </li>
                                        ))}
                                    </ul>}
                            </div>
                        </>
                    )}
                </section>
            </div>
        </div>
    );
};

export default KodeksView;
