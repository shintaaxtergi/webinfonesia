export interface Author {
  name: string;
  avatar: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  categorySlug: string;
  image: string;
  author: Author;
  publishedAt: string;
  readTime: string;
}

export const mockArticles: Article[] = [
  {
    id: "1",
    title: "Inovasi Teknologi AI Mengubah Lanskap Bisnis di Indonesia",
    slug: "inovasi-teknologi-ai-mengubah-lanskap-bisnis-di-indonesia",
    excerpt: "Adopsi kecerdasan buatan di perusahaan-perusahaan Indonesia meningkat tajam. Efisiensi operasional dan inovasi produk menjadi pendorong utama transformasi ini.",
    content: "<p>Jakarta, InfoNesia - Perkembangan teknologi kecerdasan buatan (AI) kini semakin tidak terbendung. Di Indonesia, berbagai perusahaan mulai dari perusahaan rintisan (startup) hingga korporasi besar mulai mengadopsi AI untuk meningkatkan efisiensi dan daya saing mereka.</p><br><p>Menurut laporan terbaru dari Asosiasi Tech Indonesia, tingkat adopsi AI di sektor bisnis meningkat hingga 45% dalam setahun terakhir. Sektor perbankan dan e-commerce menjadi pionir dalam pemanfaatan teknologi ini, terutama untuk analisis data pelanggan dan chatbot pelayanan.</p><br><h3>Tantangan dan Peluang</h3><br><p>Meski potensinya besar, masih ada tantangan seperti minimnya talenta digital yang mumpuni di bidang AI dan kekhawatiran terkait privasi data. Pemerintah diharapkan segera merumuskan regulasi komprehensif terkait AI agar perkembangannya lebih terarah dan aman bagi masyarakat.</p>",
    category: "Teknologi",
    categorySlug: "teknologi",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1200&auto=format&fit=crop",
    author: {
      name: "Sari Dewi",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop"
    },
    publishedAt: "2026-04-19T08:30:00Z",
    readTime: "4 Menit"
  },
  {
    id: "2",
    title: "Pemilu Regional 2026: Antusiasme Pemilih Muda Meningkat Signifikan",
    slug: "pemilu-regional-2026-antusiasme-pemilih-muda",
    excerpt: "Generasi Z mendominasi demografi pemilih pada pemilu serentak tahun ini. Kampanye digital menjadi kunci para kandidat.",
    content: "<p>Surabaya, InfoNesia - Pemilihan kepala daerah serentak 2026 menunjukkan tren baru yang menarik: tingginya tingkat partisipasi pemilih pemula dan pemuda. Hal ini diperkirakan akan mengubah strategi kampanye konvensional.</p><br><p>Para pengamat politik menilai bahwa isu-isu seperti lapangan kerja, pendidikan, dan lingkungan hidup menjadi perhatian utama para pemilih muda ini. Kandidat yang mampu mengomunikasikan program mereka melalui platform digital terbukti lebih mendapatkan simpati.</p>",
    category: "Politik",
    categorySlug: "politik",
    image: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?q=80&w=1200&auto=format&fit=crop",
    author: {
      name: "Budi Santoso",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop"
    },
    publishedAt: "2026-04-18T14:15:00Z",
    readTime: "3 Menit"
  },
  {
    id: "3",
    title: "Timnas Garuda Bersiap Menghadapi Kualifikasi Piala Dunia",
    slug: "timnas-garuda-persiapan-kualifikasi-piala-dunia",
    excerpt: "Pelatih kepala optimis dengan kondisi fisik para pemain setelah pemusatan latihan intensif di Eropa.",
    content: "<p>Jakarta, InfoNesia - Skuad Tim Nasional Indonesia telah kembali ke tanah air setelah menjalani pemusatan latihan selama tiga minggu di Eropa. Kondisi fisik dan mental pemain diklaim berada dalam puncak performa.</p><br><p>Pertandingan kualifikasi terdekat akan dilangsungkan di Stadion Utama Gelora Bung Karno. Puluhan ribu suporter dipastikan akan memenuhi stadion untuk memberikan dukungan penuh.</p>",
    category: "Olahraga",
    categorySlug: "olahraga",
    image: "https://images.unsplash.com/photo-1518605368461-1ee26e92c2df?q=80&w=1200&auto=format&fit=crop",
    author: {
      name: "Rizky Pratama",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop"
    },
    publishedAt: "2026-04-20T09:00:00Z",
    readTime: "2 Menit"
  },
  {
    id: "4",
    title: "IHSG Ditutup Menguat Seiring Masuknya Aliran Modal Asing",
    slug: "ihsg-ditutup-menguat-aliran-modal-asing",
    excerpt: "Sektor perbankan dan infrastruktur memimpin penguatan indeks harga saham gabungan pada penutupan sesi perdagangan akhir pekan.",
    content: "<p>Jakarta, InfoNesia - Indeks Harga Saham Gabungan (IHSG) Bursa Efek Indonesia (BEI) ditutup menguat signifikan menyusul rilis data pertumbuhan ekonomi kuartal pertama yang melebihi ekspektasi pasar.</p><br><p>Investor asing mencatatkan pembelian bersih yang cukup besar, menunjukkan kepercayaan yang tinggi terhadap stabilitas ekonomi makro Indonesia di tengah ketidakpastian global.</p>",
    category: "Ekonomi",
    categorySlug: "ekonomi",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a2236a0?q=80&w=1200&auto=format&fit=crop",
    author: {
      name: "Sari Dewi",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop"
    },
    publishedAt: "2026-04-17T16:45:00Z",
    readTime: "3 Menit"
  }
];

export const getArticleBySlug = (slug: string) => {
  return mockArticles.find(article => article.slug === slug);
};

export const getArticlesByCategory = (categorySlug: string) => {
  return mockArticles.filter(article => article.categorySlug === categorySlug);
};
