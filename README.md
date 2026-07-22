<div align="center">

# Sırdaş AI

### Bir günlükten fazlası.

Kişisel günlük, şifreli saklama, duygu geçmişi ve güvenli AI analiz altyapısını bir araya getiren tam yığın web uygulaması.

<p>
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-18-149ECA?style=flat-square&logo=react&logoColor=white">
  <img alt="Express" src="https://img.shields.io/badge/Express-4-20232A?style=flat-square&logo=express&logoColor=white">
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma&logoColor=white">
  <img alt="SQLite" src="https://img.shields.io/badge/SQLite-3-2484C6?style=flat-square&logo=sqlite&logoColor=white">
</p>

<img src="./frontend/public/hero-diary.png" alt="Sırdaş AI antika günlük deneyimi" width="100%">

</div>

> [!IMPORTANT]
> AI analizi ilk kurulumda bilinçli olarak kapalıdır. Bir sağlayıcı bağlanmadan günlük metni hiçbir üçüncü tarafa gönderilmez.

## Öne çıkanlar

| Deneyim | Gizlilik ve güvenlik | Kullanıcı kontrolü |
| --- | --- | --- |
| Responsive, çift/tek sayfalı günlük | AES-256-GCM ile şifreli içerik | JSON ve sunucuda üretilen PDF aktarımı |
| Yaklaşık 800 ms otomatik kayıt | 15 dakikalık access token ve refresh rotasyonu | Şifre doğrulamalı hesap silme |
| Takvim ve ruh hali geçmişi | JWT rol izolasyonu ve CSRF koruması | Ses ve azaltılmış hareket desteği |
| Sağlayıcı bağımsız AI adaptörü | Zod, Helmet, CORS ve rate limiting | Mobil, dokunmatik ve klavye erişimi |

- Kullanıcı ve yönetici günlükleri ayrı tablo, servis ve API rotalarında tutulur.
- Yönetim paneli yalnızca anonim toplamlara erişir; küçük gruplarda ortalamalar gizlenir.
- Yüksek risk akışı 112, ALO 183 ve en yakın acil servis yönlendirmelerini içerir.
- Uygulama tanı, tedavi veya aktif kriz izleme hizmeti değildir.

## Teknoloji

**Frontend:** React, Vite, TypeScript, React Router, TanStack Query, Framer Motion, Recharts ve Lucide.

**Backend:** Express, TypeScript, Prisma, SQLite, Zod, bcrypt, JWT, Helmet, CORS ve PDFKit.

```text
Sırdaş AI/
├── frontend/              React/Vite kullanıcı deneyimi
│   ├── public/            Günlük, doku ve maskot görselleri
│   └── src/               Sayfalar, bileşenler ve API istemcisi
├── backend/               Express API ve güvenlik katmanı
│   ├── prisma/            Şema ve migration dosyaları
│   ├── assets/            PDF için yerel fontlar
│   └── src/               Rotalar, servisler ve testler
├── Sirdas-AI-Baslat.cmd   Windows tek-tık başlatıcı
└── Sirdas-AI-Durdur.cmd   Windows tek-tık durdurucu
```

## Hızlı başlangıç

### Windows

1. `Sirdas-AI-Baslat.cmd` dosyasına çift tıklayın.
2. Uygulama `http://127.0.0.1:5173` adresinde açılır.
3. Bitirdiğinizde `Sirdas-AI-Durdur.cmd` dosyasını çalıştırın.

Başlatıcı ilk kullanımda eksik bağımlılıkları, geliştirme ortamını, Prisma istemcisini ve SQLite veritabanını hazırlar. Sistem Node/npm kurulumunu tercih eder; gerekirse Codex'in yerel Node/pnpm çalışma ortamına geçer.

### Terminal

Node.js 20 veya üzeri gerekir.

```bash
npm install
npm run setup:dev
npm run db:generate
npm run db:migrate
npm run dev
```

| Komut | Açıklama |
| --- | --- |
| `npm run dev` | Frontend ve backend geliştirme sunucularını başlatır |
| `npm run lint` | TypeScript ve React kurallarını denetler |
| `npm run typecheck` | İki workspace için tip kontrolü yapar |
| `npm test` | Backend ve frontend testlerini çalıştırır |
| `npm run build` | Production çıktılarını üretir |

## Ortam ayarları

İlk kurulum için [`backend/.env.example`](./backend/.env.example) dosyasını temel alın. Production ortamında aşağıdaki değerleri mutlaka değiştirin:

- `JWT_SECRET` ve `ADMIN_JWT_SECRET`
- `ENCRYPTION_KEY` (base64 biçiminde tam 32 byte)
- `ADMIN_PASSWORD_HASH`
- `FRONTEND_ORIGIN`
- `PRIVACY_CONTACT_EMAIL`

Uygulamayı HTTPS arkasında, aynı origin üzerinden reverse proxy ile çalıştırın. SQLite dosyasını erişimi sınırlı ve yedeklenen kalıcı bir diskte saklayın. Şifreleme anahtarı kaybedilirse günlük içerikleri geri getirilemez.

## AI sağlayıcısı

`backend/src/services/ai/` katmanı `analyzeEntry(text)` sözleşmesini kullanır. Sağlayıcı eklendiğinde yanıt aşağıdaki alanlarla Zod üzerinden doğrulanmalıdır:

```ts
{
  analysis: string;
  suggestions: string[];
  riskLevel: "low" | "medium" | "high";
  moodScore: number;
}
```

API anahtarı yalnızca backend ortamında tutulmalıdır. Sağlayıcının veri işleme ve saklama koşulları KVKK metnine eklenmeden production ortamında etkinleştirilmemelidir.

## Güvenlik notları

- Günlük ve analiz içerikleri loglara yazılmaz.
- Refresh tokenlar veritabanında hashlenmiş olarak tutulur ve her yenilemede döndürülür.
- Token tekrar kullanımı algılandığında ilgili oturum ailesi iptal edilir.
- Admin istatistik servisi kullanıcı e-postası, günlük metni veya analiz içeriği seçmez.
- Gerçek kullanıcı verisi toplamadan önce KVKK metnini bir hukuk uzmanına inceletin.

## Doğrulama

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Yerel arayüz: `http://127.0.0.1:5173`<br>
Yerel API: `http://127.0.0.1:4000`
