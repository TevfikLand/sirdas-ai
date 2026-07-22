import { Lightbulb, X } from "lucide-react";
import type { Analysis } from "../types";
import { CrisisAlert } from "./CrisisAlert";
import { useState } from "react";

export function AnalysisModal({ analysis, onClose }: { analysis: Analysis; onClose(): void }) {
  const [crisisOpen, setCrisisOpen] = useState(analysis.riskLevel === "yüksek");
  return <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="analysis-title">
    <section className="analysis-modal">
      <button className="icon-button modal-close" onClick={onClose} aria-label="Analizi kapat"><X /></button>
      <div className="analysis-copy"><span className="eyebrow">Bugünün yansıması</span><h2 id="analysis-title">Sizi dinledim.</h2><p>{analysis.analysis}</p></div>
      <div className="suggestions"><Lightbulb /><h3>Size önerilerimiz</h3><ul>{analysis.suggestions.map(item => <li key={item}>{item}</li>)}</ul></div>
      <p className="medical-note wide">Bu yorum tanı veya tedavi değildir; profesyonel desteğin yerini tutmaz.</p>
    </section>
    {crisisOpen && <CrisisAlert onClose={() => setCrisisOpen(false)} />}
  </div>;
}
