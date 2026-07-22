import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useEffect, useState } from "react";

function PaperPage({ value, page, onChange, hidden = false }: { value: string; page: number; onChange(value: string): void; hidden?: boolean }) {
  return <div className={`paper-page ${hidden ? "mobile-hidden-page" : ""}`}><span className="page-number">{page + 1}</span><textarea aria-label={`${page + 1}. günlük sayfası`} value={value} maxLength={3000} onChange={event => onChange(event.target.value)} placeholder={page === 0 ? "Bugün içinden geçenleri buraya bırak..." : ""} /></div>;
}

export function DiaryBook({ pages, onChange, sound }: { pages: string[]; onChange(pages: string[]): void; sound: boolean }) {
  const [current, setCurrent] = useState(0); const [portrait, setPortrait] = useState(() => window.innerWidth < 720); const [turning, setTurning] = useState<"prev" | "next" | null>(null);
  useEffect(() => { const resize = () => setPortrait(window.innerWidth < 720); window.addEventListener("resize", resize); return () => window.removeEventListener("resize", resize); }, []);
  useEffect(() => { if (current > pages.length - 1) setCurrent(Math.max(0, pages.length - 1)); }, [current, pages.length]);
  const step = portrait ? 1 : 2;
  const playPageSound = () => {
    const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass(); const duration = .16; const buffer = context.createBuffer(1, context.sampleRate * duration, context.sampleRate); const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index++) data[index] = (Math.random() * 2 - 1) * Math.pow(1 - index / data.length, 2);
    const source = context.createBufferSource(); const filter = context.createBiquadFilter(); filter.type = "bandpass"; filter.frequency.value = 1500; filter.Q.value = .7; source.buffer = buffer; source.connect(filter).connect(context.destination); source.start(); source.onended = () => context.close();
  };
  const flip = (direction: "prev" | "next") => { if (turning) return; setTurning(direction); if (sound) playPageSound(); window.setTimeout(() => { setCurrent(value => direction === "prev" ? Math.max(0, value - step) : Math.min(pages.length - 1, value + step)); setTurning(null); }, 280); };
  const update = (index: number, value: string) => { const next = [...pages]; next[index] = value; onChange(next); };
  const rightIndex = Math.min(current + 1, pages.length - 1);
  return <div className="book-stage">
    <button className="page-control left" onClick={() => flip("prev")} disabled={current === 0 || Boolean(turning)} aria-label="Önceki sayfa"><ChevronLeft /></button>
    <div className="book-shell">
      <div className={`css-book ${turning ? `is-turning-${turning}` : ""}`}>
        <PaperPage value={pages[current]} page={current} onChange={text => update(current, text)} />
        <PaperPage hidden={pages.length === 1} value={pages[rightIndex]} page={rightIndex} onChange={text => update(rightIndex, text)} />
      </div>
      {pages.length < 24 && <button className="add-page" onClick={() => { onChange([...pages, ""]); setCurrent(pages.length); }}><Plus size={17} /> Sayfa ekle</button>}
    </div>
    <button className="page-control right" onClick={() => flip("next")} disabled={current >= pages.length - 1 || Boolean(turning)} aria-label="Sonraki sayfa"><ChevronRight /></button>
  </div>;
}
