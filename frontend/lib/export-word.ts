import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, convertInchesToTwip } from "docx";
import { saveAs } from "file-saver";

export interface LegalDraftData {
  jenisPeraturan: string;
  nomor: string;
  tahun: string;
  tentang: string;
  jabatanPenetap: string;
  menimbang: string[];
  mengingat: string[];
  menetapkan: string;
  babList: {
    nomor: string;
    judul: string;
    pasalList: {
      nomor: string;
      ayatList: string[];
    }[];
  }[];
  tempatPenetapan: string;
  tanggalPenetapan: string;
  namaPenetap: string;
}

export function parseDraftMarkdown(markdownText: string, fallbackTopic: string = ""): {
  parsedData: LegalDraftData;
  formFields: {
    jenisPeraturan: string;
    tentang: string;
    tahun: string;
    nomor: string;
    pemrakarsa: string;
  };
} {
  const lines = markdownText.split("\n").map((l) => l.trim());

  let jenis = "PERATURAN BADAN INTELIJEN NEGARA REPUBLIK INDONESIA";
  let nomor = "DRAFT-01";
  let tahun = new Date().getFullYear().toString();
  let tentang = fallbackTopic;
  let pemrakarsa = "Biro Hukum dan Organisasi";

  // Parse Judul / Jenis
  for (const line of lines) {
    const cleanLine = line.replace(/^[#*_\-\s]+|[#*_\-\s]+$/g, "");
    if (/^(peraturan|keputusan|undang-undang|instruksi|surat edaran)/i.test(cleanLine)) {
      jenis = cleanLine;
      break;
    }
  }

  // Parse Nomor & Tahun
  const noMatch = markdownText.match(/nomor\s*([a-z0-9\/\.\-]+)\s*tahun\s*(\d{4})/i);
  if (noMatch) {
    nomor = noMatch[1];
    tahun = noMatch[2];
  } else {
    const thnMatch = markdownText.match(/tahun\s*(\d{4})/i);
    if (thnMatch) tahun = thnMatch[1];
  }

  // Parse Tentang
  const tentangMatch = markdownText.match(/TENTANG[\r\n\s*#]+([^\r\n#*]+)/i);
  if (tentangMatch && tentangMatch[1].trim()) {
    tentang = tentangMatch[1].trim();
  }

  // Parse Konsiderans (Menimbang)
  const menimbang: string[] = [];
  const menimbangBlock = markdownText.match(/menimbang\s*:\s*([\s\S]*?)(?=(mengingat\s*:|memutuskan\s*:|menetapkan\s*:))/i);
  if (menimbangBlock) {
    const items = menimbangBlock[1].split(/\n+/);
    items.forEach((it) => {
      const clean = it.replace(/^[-*•\s]*[a-z]\.\s*/i, "").trim();
      if (clean && clean.length > 5) menimbang.push(clean);
    });
  }
  if (menimbang.length === 0) {
    menimbang.push(`bahwa untuk menjamin kepastian hukum dan tata kelola ${tentang || "regulasi"}, perlu menetapkan peraturan yang adaptif.`);
  }

  // Parse Dasar Hukum (Mengingat)
  const mengingat: string[] = [];
  const mengingatBlock = markdownText.match(/mengingat\s*:\s*([\s\S]*?)(?=(memutuskan\s*:|menetapkan\s*:|bab\s+i))/i);
  if (mengingatBlock) {
    const items = mengingatBlock[1].split(/\n+/);
    items.forEach((it) => {
      const clean = it.replace(/^[-*•\s]*\d+\.\s*/i, "").trim();
      if (clean && clean.length > 5) mengingat.push(clean);
    });
  }
  if (mengingat.length === 0) {
    mengingat.push("Undang-Undang Nomor 12 Tahun 2011 tentang Pembentukan Peraturan Perundang-undangan.");
  }

  // Parse Batang Tubuh (BAB & Pasal)
  const babList: LegalDraftData["babList"] = [];
  const babRegex = /(###?\s*BAB\s+[IVXLCDM]+[\s\S]*?)(?=(###?\s*BAB\s+[IVXLCDM]+|Ditetapkan di|$))/gi;
  const babMatches = [...markdownText.matchAll(babRegex)];

  if (babMatches.length > 0) {
    babMatches.forEach((match) => {
      const block = match[1];
      const babNoMatch = block.match(/BAB\s+([IVXLCDM]+)/i);
      const babJudulMatch = block.match(/BAB\s+[IVXLCDM]+[\r\n\s*#]+([^\r\n#*]+)/i);

      const babNo = babNoMatch ? `BAB ${babNoMatch[1]}` : "BAB";
      const babJudul = babJudulMatch ? babJudulMatch[1].trim() : "KETENTUAN";

      const pasalList: LegalDraftData["babList"][0]["pasalList"] = [];
      const pasalRegex = /(####?\s*Pasal\s+\d+[\s\S]*?)(?=(####?\s*Pasal\s+\d+|###?\s*BAB|$))/gi;
      const pasalMatches = [...block.matchAll(pasalRegex)];

      pasalMatches.forEach((pMatch) => {
        const pBlock = pMatch[1];
        const pNoMatch = pBlock.match(/Pasal\s+(\d+)/i);
        const pNo = pNoMatch ? `Pasal ${pNoMatch[1]}` : "Pasal";

        const ayatList = pBlock
          .replace(/####?\s*Pasal\s+\d+/i, "")
          .split(/\n+/)
          .map((a) => a.trim())
          .filter((a) => a.length > 0 && !a.startsWith("---") && !a.startsWith("#"));

        pasalList.push({
          nomor: pNo,
          ayatList: ayatList.length > 0 ? ayatList : ["Ketentuan ini mulai berlaku efektif."],
        });
      });

      babList.push({
        nomor: babNo,
        judul: babJudul,
        pasalList,
      });
    });
  }

  return {
    parsedData: {
      jenisPeraturan: jenis,
      nomor,
      tahun,
      tentang: tentang || "PENGATURAN REGULASI",
      jabatanPenetap: jenis.toLowerCase().includes("badan intelijen negara")
        ? "KEPALA BADAN INTELIJEN NEGARA REPUBLIK INDONESIA"
        : "PEJABAT PENETAP REPUBLIK INDONESIA",
      menimbang,
      mengingat,
      menetapkan: `${jenis.toUpperCase()} TENTANG ${(tentang || "PERATURAN INI").toUpperCase()}.`,
      babList: babList.length > 0 ? babList : [
        {
          nomor: "BAB I",
          judul: "KETENTUAN UMUM",
          pasalList: [
            {
              nomor: "Pasal 1",
              ayatList: [`Dalam Peraturan ini yang dimaksud dengan ${tentang} adalah seluruh pedoman pelaksanaan tata kelola hukum.`],
            },
          ],
        },
      ],
      tempatPenetapan: "Jakarta",
      tanggalPenetapan: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      namaPenetap: "....................................................",
    },
    formFields: {
      jenisPeraturan: jenis,
      tentang,
      tahun,
      nomor,
      pemrakarsa,
    },
  };
}

export async function exportDraftToWord(draft: LegalDraftData) {
  const docParagraphs: Paragraph[] = [];

  // 1. JUDUL / KOP PERATURAN (All Caps, Bold, Centered)
  docParagraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: draft.jenisPeraturan.toUpperCase(),
          bold: true,
          size: 24, // 12pt
          font: "Bookman Old Style",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: `NOMOR ${draft.nomor.toUpperCase()} TAHUN ${draft.tahun.toUpperCase()}`,
          bold: true,
          size: 24,
          font: "Bookman Old Style",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: "TENTANG",
          bold: true,
          size: 24,
          font: "Bookman Old Style",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: draft.tentang.toUpperCase(),
          bold: true,
          size: 24,
          font: "Bookman Old Style",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: `DENGAN RAHMAT TUHAN YANG MAHA ESA\n\n${draft.jabatanPenetap.toUpperCase()},`,
          bold: true,
          size: 24,
          font: "Bookman Old Style",
        }),
      ],
    })
  );

  // 2. KONSIDERANS (MENIMBANG)
  if (draft.menimbang && draft.menimbang.length > 0) {
    draft.menimbang.forEach((item, idx) => {
      const prefix = idx === 0 ? "Menimbang\t: " : "\t  ";
      const letter = String.fromCharCode(97 + idx); // a, b, c...
      docParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.BOTH,
          spacing: { after: 120, line: 276 },
          children: [
            new TextRun({
              text: `${prefix}${letter}. bahwa `,
              bold: idx === 0,
              size: 24,
              font: "Bookman Old Style",
            }),
            new TextRun({
              text: item.replace(/^[a-z]\.\s*(bahwa\s*)?/i, ""),
              size: 24,
              font: "Bookman Old Style",
            }),
          ],
        })
      );
    });
  }

  // 3. DASAR HUKUM (MENGINGAT)
  if (draft.mengingat && draft.mengingat.length > 0) {
    draft.mengingat.forEach((item, idx) => {
      const prefix = idx === 0 ? "Mengingat\t: " : "\t  ";
      const num = idx + 1;
      docParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.BOTH,
          spacing: { after: 120, line: 276 },
          children: [
            new TextRun({
              text: `${prefix}${num}. `,
              bold: idx === 0,
              size: 24,
              font: "Bookman Old Style",
            }),
            new TextRun({
              text: item.replace(/^\d+\.\s*/, ""),
              size: 24,
              font: "Bookman Old Style",
            }),
          ],
        })
      );
    });
  }

  // 4. MEMUTUSKAN & MENETAPKAN
  docParagraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 140 },
      children: [
        new TextRun({
          text: "MEMUTUSKAN:",
          bold: true,
          size: 24,
          font: "Bookman Old Style",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.BOTH,
      spacing: { after: 240, line: 276 },
      children: [
        new TextRun({
          text: "Menetapkan\t: ",
          bold: true,
          size: 24,
          font: "Bookman Old Style",
        }),
        new TextRun({
          text: draft.menetapkan ? draft.menetapkan.toUpperCase() : `${draft.jenisPeraturan.toUpperCase()} TENTANG ${draft.tentang.toUpperCase()}.`,
          bold: true,
          size: 24,
          font: "Bookman Old Style",
        }),
      ],
    })
  );

  // 5. BATANG TUBUH (BAB, PASAL, AYAT)
  if (draft.babList && draft.babList.length > 0) {
    draft.babList.forEach((bab) => {
      if (bab.nomor || bab.judul) {
        docParagraphs.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 60 },
            children: [
              new TextRun({
                text: bab.nomor.toUpperCase(),
                bold: true,
                size: 24,
                font: "Bookman Old Style",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: bab.judul.toUpperCase(),
                bold: true,
                size: 24,
                font: "Bookman Old Style",
              }),
            ],
          })
        );
      }

      bab.pasalList.forEach((pasal) => {
        docParagraphs.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 180, after: 120 },
            children: [
              new TextRun({
                text: pasal.nomor,
                bold: true,
                size: 24,
                font: "Bookman Old Style",
              }),
            ],
          })
        );

        pasal.ayatList.forEach((ayat) => {
          docParagraphs.push(
            new Paragraph({
              alignment: AlignmentType.BOTH,
              spacing: { after: 120, line: 276 },
              indent: { firstLine: 400 },
              children: [
                new TextRun({
                  text: ayat,
                  size: 24,
                  font: "Bookman Old Style",
                }),
              ],
            })
          );
        });
      });
    });
  }

  // 6. PENUTUP & PENGESAHAN
  docParagraphs.push(
    new Paragraph({
      alignment: AlignmentType.BOTH,
      spacing: { before: 280, after: 200, line: 276 },
      indent: { firstLine: 400 },
      children: [
        new TextRun({
          text: `Agar setiap orang mengetahuinya, memerintahkan pengundangan ${draft.jenisPeraturan} ini dengan penempatannya dalam Berita Negara Republik Indonesia.`,
          size: 24,
          font: "Bookman Old Style",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 200, after: 60 },
      children: [
        new TextRun({
          text: `Ditetapkan di ${draft.tempatPenetapan || "Jakarta"}`,
          size: 24,
          font: "Bookman Old Style",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: `pada tanggal ${draft.tanggalPenetapan || new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
          size: 24,
          font: "Bookman Old Style",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 720 }, // Ruang tanda tangan
      children: [
        new TextRun({
          text: draft.jabatanPenetap.toUpperCase() + ",",
          bold: true,
          size: 24,
          font: "Bookman Old Style",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: draft.namaPenetap ? draft.namaPenetap.toUpperCase() : "....................................................",
          bold: true,
          size: 24,
          underline: {},
          font: "Bookman Old Style",
        }),
      ],
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1.2),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1.2),
              right: convertInchesToTwip(1),
            },
          },
        },
        children: docParagraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanTitle = (draft.tentang || "Draft_Peraturan")
    .replace(/[^a-zA-Z0-9_\-]/g, "_")
    .substring(0, 40);
  saveAs(blob, `Draft_${cleanTitle}_${draft.tahun || new Date().getFullYear()}.docx`);
}
