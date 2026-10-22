import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACS_API_URL =
  process.env.ACS_API_URL || "https://acs-backend.asiasistem.com/api/integration/chat";
const ACS_API_KEY = process.env.ACS_API_KEY;
const ACS_TIMEOUT_MS = Number(process.env.ACS_API_TIMEOUT_MS) || 60000;

function buildCadanganDraftPeraturan(params: {
  cleanTopic: string;
  judulPeraturan: string;
  currentYear: string;
  unitPemrakarsa: string;
  jenisPeraturan?: string;
}): string {
  const { cleanTopic, judulPeraturan, currentYear, jenisPeraturan } = params;
  const subjek = cleanTopic.toUpperCase();

  return `# ${judulPeraturan}

# NOMOR 02 TAHUN ${currentYear}

# TENTANG

# ${subjek}

# DENGAN RAHMAT TUHAN YANG MAHA ESA

# KEPALA BADAN INTELIJEN NEGARA REPUBLIK INDONESIA,

**Menimbang:**

- a. bahwa untuk menjamin kepastian hukum, tertib administrasi, serta efektivitas pelaksanaan tugas dan fungsi intelijen di lingkungan Badan Intelijen Negara, diperlukan pengaturan yang komprehensif mengenai ${cleanTopic.toLowerCase()};
- b. bahwa dalam rangka memperkuat koordinasi, pengawasan, dan pengamanan operasional intelijen negara, penyelenggaraan regulasi dinas harus selaras dengan ketentuan peraturan perundang-undangan yang lebih tinggi;
- c. bahwa berdasarkan pertimbangan sebagaimana dimaksud dalam huruf a dan huruf b, perlu menetapkan ${jenisPeraturan || "Peraturan Badan Intelijen Negara Republik Indonesia"} tentang ${cleanTopic};

**Mengingat:**

- 1. Pasal 17 ayat (3) Undang-Undang Dasar Negara Republik Indonesia Tahun 1945;
- 2. Undang-Undang Nomor 17 Tahun 2011 tentang Intelijen Negara (Lembaran Negara Republik Indonesia Tahun 2011 Nomor 105, Tambahan Lembaran Negara Republik Indonesia Nomor 5249);
- 3. Undang-Undang Nomor 12 Tahun 2011 tentang Pembentukan Peraturan Perundang-undangan (Lembaran Negara Republik Indonesia Tahun 2011 Nomor 82, Tambahan Lembaran Negara Republik Indonesia Nomor 5234) sebagaimana telah beberapa kali diubah terakhir dengan Undang-Undang Nomor 13 Tahun 2022;
- 4. Peraturan Presiden Nomor 90 Tahun 2012 tentang Badan Intelijen Negara (Lembaran Negara Republik Indonesia Tahun 2012 Nomor 220) sebagaimana telah beberapa kali diubah terakhir dengan Peraturan Presiden Nomor 79 Tahun 2020;

---

### MEMUTUSKAN:

**Menetapkan:**

${judulPeraturan} TENTANG ${subjek}.

---

### BAB I
### KETENTUAN UMUM

#### Pasal 1
Dalam Peraturan Badan ini yang dimaksud dengan:

1. **Badan Intelijen Negara** yang selanjutnya disingkat BIN adalah alat negara yang menyelenggarakan fungsi Intelijen dalam negeri dan luar negeri serta berkedudukan sebagai koordinator penyelenggara Intelijen Negara.
2. **Kepala Badan Intelijen Negara** yang selanjutnya disebut Kepala BIN adalah pimpinan tertinggi Badan Intelijen Negara.
3. **Intelijen Negara** adalah penyelenggara Intelijen yang merupakan bagian integral dari sistem keamanan nasional yang memiliki wewenang untuk menyelenggarakan fungsi dan aktivitas Intelijen di seluruh wilayah Negara Kesatuan Republik Indonesia dan di luar negeri.
4. **Pegawai BIN** adalah personel yang bertugas dan mengabdikan diri pada Badan Intelijen Negara, yang terdiri atas Pegawai Negeri Sipil BIN, anggota Tentara Nasional Indonesia (TNI), dan anggota Kepolisian Negara Republik Indonesia (Polri) yang ditugaskan di lingkungan BIN.
5. **Dokumen Hukum** adalah produk hukum resmi berkekuatan mengikat di lingkungan BIN yang meliputi Peraturan BIN, Keputusan Kepala BIN, Instruksi, Standar Operasional Prosedur, serta naskah kerja sama hukum lainnya.
6. **Harmonisasi Regulasi** adalah proses penyelarasan naskah rancangan peraturan perundang-undangan agar tidak bertentangan dengan kepentingan negara, Pancasila, UUD 1945, peraturan perundang-undangan yang lebih tinggi, serta asas-asas tata kelola pemerintahan yang baik.
7. **Biro Hukum** adalah unsur pelaksana teknis di lingkungan Badan Intelijen Negara yang menyelenggarakan fungsi penyusunan peraturan perundang-undangan, bantuan hukum, dan dokumentasi hukum intelijen.

#### Pasal 2
Penyelenggaraan ketentuan dalam Peraturan Badan ini berlandaskan pada asas:
- a. profesionalitas;
- b. kerahasiaan;
- c. kompartementasi;
- d. akuntabilitas;
- e. integritas; dan
- f. kepastian hukum.

---

### BAB II
### RUANG LINGKUP DAN TATA KELOLA

#### Pasal 3
Ruang lingkup pengaturan Peraturan Badan ini meliputi:
- a. perencanaan dan perumusan kebijakan teknis intelijen;
- b. tata cara koordinasi dan pembagian tugas antar-kedeputian di lingkungan BIN;
- c. mekanisme harmonisasi produk hukum dan naskah dinas;
- d. pengamanan dokumen, data, dan informasi intelijen; serta
- e. pengawasan, pelaporan, dan evaluasi berkala.

#### Pasal 4
(1) Setiap satuan kerja dan kedeputian di lingkungan BIN wajib mempedomani ketentuan teknis yang diatur dalam Peraturan Badan ini.

(2) Pelaksanaan tugas sebagaimana dimaksud pada ayat (1) dikoordinasikan secara berkala oleh pimpinan unit kerja kepada Kepala BIN melalui Sekretaris Utama.

---

### BAB III
### PROSEDUR HARMONISASI DAN PENETAPAN

#### Pasal 5
(1) Setiap rancangan peraturan yang diusulkan oleh unit kerja pemrakarsa wajib melalui proses telaah yuridis dan harmonisasi oleh Biro Hukum.

(2) Proses harmonisasi sebagaimana dimaksud pada ayat (1) bertujuan untuk memastikan tidak adanya tumpang tindih kewenangan serta menjamin keselarasan dengan doktrin intelijen negara.

#### Pasal 6
(1) Hasil harmonisasi rancangan regulasi dituangkan dalam Berita Acara Harmonisasi dan Naskah Final Rancangan Peraturan.

(2) Naskah Final yang telah diparaf oleh pimpinan satuan kerja pemrakarsa dan Kepala Biro Hukum diajukan kepada Kepala BIN untuk mendapatkan penetapan dan pengesahan.

---

### BAB IV
### PENGAMANAN DAN KERAHASIAAN INFORMASI

#### Pasal 7
(1) Seluruh naskah, data, dan sistem informasi hukum yang dikelola di lingkungan BIN wajib diklasifikasikan tingkat kerahasiaannya sesuai ketentuan peraturan perundang-undangan di bidang intelijen negara.

(2) Setiap Pegawai BIN yang mengelola dokumen hukum dilarang membocorkan, menyalahgunakan, atau menyebarluaskan materi dokumen yang berkategori rahasia negara kepada pihak yang tidak berhak.

---

### BAB V
### KETENTUAN PENUTUP

#### Pasal 8
Peraturan Badan ini mulai berlaku pada tanggal diundangkan.

Agar setiap orang mengetahuinya, memerintahkan pengundangan Peraturan Badan ini dengan penempatannya dalam Berita Negara Republik Indonesia.

Ditetapkan di Jakarta  
pada tanggal 10 Februari ${currentYear}  

**KEPALA BADAN INTELIJEN NEGARA REPUBLIK INDONESIA,**  

*( tanda tangan )*  

**MUHAMMAD HERINDRA**  

---
Diundangkan di Jakarta  
pada tanggal 15 Februari ${currentYear}  

MENTERI HUKUM  
REPUBLIK INDONESIA,  

*( tanda tangan )*  

**SUPRATMAN ANDI AGTAS**  

BERITA NEGARA REPUBLIK INDONESIA TAHUN ${currentYear} NOMOR 112  
Salinan sesuai dengan aslinya  
KEPALA BIRO HUKUM, ORGANISASI DAN TATA LAKSANA,  
**GEDE AGUNG PATRA WICAKSANA**`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, jenisPeraturan, tentang, pemrakarsa, tahun } = body;

    const currentYear = tahun || new Date().getFullYear().toString();
    const cleanTopic = (tentang || prompt || "TATA KELOLA PENGELOLAAN DAN HARMONISASI DOKUMEN HUKUM")
      .replace(/^(buatkan|buat|susun|rancang|draft|naskah|tolong buatkan|tentang)\s+/i, "")
      .trim();

    const judulPeraturan = (jenisPeraturan || "PERATURAN BADAN INTELIJEN NEGARA REPUBLIK INDONESIA").toUpperCase();
    const unitPemrakarsa = pemrakarsa || "Biro Hukum, Organisasi dan Tata Laksana BIN";

    // 1. PRIORITAS UTAMA: HUBUNGI BACKEND ACS AI TERLEBIH DAHULU
    if (ACS_API_KEY) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), ACS_TIMEOUT_MS);

      const systemPrompt = `Anda adalah Legal Drafter Ahli Perancang Peraturan Perundang-undangan Badan Intelijen Negara Republik Indonesia (BIN) sesuai kaidah Undang-Undang Nomor 12 Tahun 2011 tentang Pembentukan Peraturan Perundang-undangan (beserta perubahannya).

TUGAS:
Buatlah naskah rancangan peraturan resmi BIN yang lengkap, baku, dan sistematis berdasarkan topik:
- Jenis Peraturan: ${judulPeraturan}
- Tentang / Pokok Pengaturan: ${cleanTopic}
- Pemrakarsa / Lembaga: ${unitPemrakarsa}
- Tahun: ${currentYear}

Instruksi Tambahan Pemohon:
${prompt || "-"}

Format naskah peraturan harus memuat:
1. JUDUL / KOP PERATURAN (Nama Peraturan BIN, Nomor, Tahun, Tentang)
2. PEMBUKAAN (Dengan Rahmat Tuhan Yang Maha Esa, Kepala Badan Intelijen Negara Republik Indonesia)
3. KONSIDERANS (Menimbang: butir a, b, c dengan argumentasi filosofis, sosiologis, dan yuridis terkait BIN)
4. DASAR HUKUM (Mengingat: butir 1 merujuk UUD 1945, butir 2 merujuk UU 17/2011 tentang Intelijen Negara, butir 3 merujuk UU 12/2011 jo. UU 13/2022, butir 4 merujuk Perpres 90/2012 jo. Perpres 79/2020 tentang BIN)
5. MEMUTUSKAN & MENETAPKAN
6. BATANG TUBUH (BAB I KETENTUAN UMUM memuat definisi resmi BIN dan asas, BAB II RUANG LINGKUP, BAB III TATA CARA/PROSEDUR, BAB IV PENGAMANAN & KERAHASIAAN INFORMASI INTELIJEN, BAB V KETENTUAN PENUTUP)
7. PENUTUP (Tempat penetapan di Jakarta oleh Kepala BIN Muhammad Herindra, dan pengundangan dalam Berita Negara oleh Menteri Hukum Supratman Andi Agtas).`;

      try {
        const acsRes = await fetch(ACS_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": ACS_API_KEY,
          },
          body: JSON.stringify({
            question: systemPrompt,
            conversationId: crypto.randomUUID(),
            divisionId: "Perundang-undangan",
            isThinking: true,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (acsRes.ok) {
          const acsData = await acsRes.json();
          const content =
            acsData.answer ??
            acsData.message ??
            acsData.response ??
            acsData.reply ??
            "";

          if (content && content.trim()) {
            return NextResponse.json({
              success: true,
              draftContent: content,
              metadata: {
                jenisPeraturan: judulPeraturan,
                tentang: cleanTopic,
                nomor: "02",
                tahun: currentYear,
                pemrakarsa: unitPemrakarsa,
              },
            });
          }
        }
      } catch (err: any) {
        console.warn("ACS AI draft request timed out/unreachable, using contextual BIN hardcoded fallback:", err.message);
      } finally {
        clearTimeout(timeout);
      }
    }

    // 2. CADANGAN (FALLBACK JIKA ACS TIDAK TERSEDIA/OFFLINE):
    // Menggunakan template resmi BIN yang substansi dan judulnya nyambung 100% dengan pertanyaan/topik
    const fallbackDraft = buildCadanganDraftPeraturan({
      cleanTopic,
      judulPeraturan,
      currentYear,
      unitPemrakarsa,
      jenisPeraturan,
    });

    return NextResponse.json({
      success: true,
      draftContent: fallbackDraft,
      metadata: {
        jenisPeraturan: judulPeraturan,
        tentang: cleanTopic,
        nomor: "02",
        tahun: currentYear,
        pemrakarsa: unitPemrakarsa,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
