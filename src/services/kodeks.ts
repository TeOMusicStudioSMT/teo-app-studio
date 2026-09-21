/**
 * 🛠️ kodeks — klient App Studio 2.0: Kodeks (TeOgochi od kodu) buduje apki na moście.
 *
 * Do 2026-09-21 App Studio generowało kod Geminim w przeglądarce (klucz w localStorage,
 * model gemini-2.0-flash-exp) — martwe. Teraz wszystko robi most (services/AppStudio.js):
 * piaskownica w _OtakOs_Apki/<id>, tsc + vite build, test w puppeteerze, git.
 * Ten plik tylko rozmawia z mostem i czyta strumień kroków (SSE przez fetch).
 */
const MOST = 'http://127.0.0.1:3001';

export interface ProjektLista { id: string; nazwa: string; opis: string; utworzono: string; ostatnia: string; zbudowana: boolean; zrzut: boolean; iteracji: number; }
export interface WpisHistorii { zadanie: string | null; tresc: string; ok: boolean; rundy: number; sekundy: number; kiedy: string; commit: string | null; model?: string; }
export interface Projekt { id: string; nazwa: string; opis: string; utworzono: string; historia: WpisHistorii[]; ostatniZrzut: string | null; pliki: Array<{ sciezka: string; tresc: string }>; zbudowana: boolean; zadanieWToku: string | null; }
export interface Krok { typ: 'start' | 'model' | 'postep' | 'pliki' | 'build' | 'test' | 'blad' | 'koniec' | 'stan'; tekst?: string; kiedy?: string; zrzut?: string | null; pliki?: string[]; znakow?: number; stan?: string; wynik?: { ok: boolean; rundy: number; sekundy: number; commit?: string | null; powod?: string | null }; zadanie?: string; model?: string; }

async function api<T>(sciezka: string, init?: RequestInit): Promise<T> {
    const r = await fetch(`${MOST}${sciezka}`, { headers: { 'Content-Type': 'application/json' }, ...init });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error((d as { message?: string }).message || `HTTP ${r.status}`);
    return d as T;
}

export interface Silnik { id: string; model: string; etykieta: string; domyslny: boolean; dostepny: boolean; uwaga: string; }
/** Silniki Kodeksa: lokalne zawsze pierwsze i domyślne; chmura (Claude/Gemini) tylko z kluczem w Kiblu. */
export const silniki = () => api<{ silniki: Silnik[] }>('/api/appstudio/silniki').then((d) => d.silniki);
export const projekty = () => api<{ projekty: ProjektLista[] }>('/api/appstudio/projekty').then((d) => d.projekty);
export const projekt = (id: string) => api<{ projekt: Projekt }>(`/api/appstudio/projekty/${encodeURIComponent(id)}`).then((d) => d.projekt);
export const nowyProjekt = (nazwa: string, opis: string) => api<{ projekt: Projekt }>('/api/appstudio/projekty', { method: 'POST', body: JSON.stringify({ nazwa, opis }) }).then((d) => d.projekt);
export const usunProjekt = (id: string) => api<{ usunieto: boolean }>(`/api/appstudio/projekty/${encodeURIComponent(id)}`, { method: 'DELETE' });
export const cofnij = (id: string) => api<{ ok: boolean; commit: string; build: { ok: boolean; etap: string; log: string } }>(`/api/appstudio/projekty/${encodeURIComponent(id)}/cofnij`, { method: 'POST' });
export const adresPodgladu = (id: string) => `${MOST}/apki/${encodeURIComponent(id)}/`;
export const adresZrzutu = (id: string, cache = Date.now()) => `${MOST}/api/appstudio/projekty/${encodeURIComponent(id)}/zrzut?t=${cache}`;

/** Zleć budowę i czytaj kroki na żywo. Kończy się, gdy most zamknie strumień. */
export async function buduj(id: string, zadanie: string, naKrok: (k: Krok) => void, model?: string): Promise<void> {
    const r = await fetch(`${MOST}/api/appstudio/projekty/${encodeURIComponent(id)}/buduj`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zadanie, model, strumien: true }),
    });
    if (!r.ok || !r.body) { const d = await r.json().catch(() => ({})); throw new Error((d as { message?: string }).message || `HTTP ${r.status}`); }
    const czytnik = r.body.getReader();
    const dek = new TextDecoder();
    let bufor = '';
    for (;;) {
        const { value, done } = await czytnik.read();
        if (done) break;
        bufor += dek.decode(value, { stream: true });
        let i: number;
        while ((i = bufor.indexOf('\n\n')) >= 0) {
            const blok = bufor.slice(0, i); bufor = bufor.slice(i + 2);
            const linia = blok.split('\n').find((l) => l.startsWith('data: '));
            if (!linia) continue;
            try { naKrok(JSON.parse(linia.slice(6)) as Krok); } catch { /* niepełny blok */ }
        }
    }
}
