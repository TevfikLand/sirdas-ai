import { HeartHandshake, Phone, X } from "lucide-react";
import { useState } from "react";

export function CrisisAlert({ onClose }: { onClose(): void }) {
  const [seen, setSeen] = useState(false);
  return <div className="crisis-overlay" role="alertdialog" aria-modal="true" aria-labelledby="crisis-title">
    <section className="crisis-alert">
      <HeartHandshake size={34} /><h2 id="crisis-title">Şu anda yalnız değilsiniz.</h2>
      <p>Yazdıklarınız, ağır bir yük taşıyor olabileceğinizi düşündürüyor. Yakın ve acil bir tehlike varsa lütfen beklemeden destek isteyin.</p>
      <a className="crisis-number" href="tel:112"><Phone /> <strong>112</strong><span>Hayati veya acil tehlikede ücretsiz acil yardım</span></a>
      <a className="crisis-number secondary" href="tel:183"><Phone /> <strong>ALO 183</strong><span>Aile ve Sosyal Hizmetler Bakanlığı sosyal destek ve yönlendirme hattı</span></a>
      <p>En yakın hastanenin acil servisine başvurabilir veya güvendiğiniz birini hemen yanınıza çağırabilirsiniz.</p>
      <p className="medical-note">Sırdaş AI bir tanı veya tedavi aracı değildir ve profesyonel ruh sağlığı desteğinin yerini tutmaz.</p>
      <label className="acknowledge"><input type="checkbox" checked={seen} onChange={event => setSeen(event.target.checked)} /> Bu bilgileri gördüm.</label>
      <button className="button primary" disabled={!seen} onClick={onClose}><X size={18} /> Bilgilendirmeyi kapat</button>
    </section>
  </div>;
}
