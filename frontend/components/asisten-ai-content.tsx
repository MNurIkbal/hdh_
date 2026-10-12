"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Send, Bot, Trash2, ArrowDown, Sparkles, Plus, AlertTriangle, ArrowUp, MessageSquarePlus, FileText, FileSpreadsheet, X, Scale } from "lucide-react";
import rehypeRaw from "rehype-raw";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import type { ChatMessage, ComparisonData } from "@/types/chat";
import { DokumenHukum } from "@/feature/dokumen-hukum/types/DokumenHukum.type";
import ComparisonDraftTable from "@/components/ComparisonDraftTable";
import DocumentComparisonSelector from "@/components/DocumentComparisonSelector";
import { sendChatMessage, saveSession, getSessionById, deleteSession } from "@/services/chat-service";
import { SessionHook } from "@/feature/web";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function nowTimestamp() {
  return new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTanggalIndo(dateStr?: string): string {
  if (!dateStr || dateStr === "-") return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function newId() {
  return crypto.randomUUID();
}

/* =========================
   EMPTY STATE (WELCOME AI)
========================= */
const EmptyState = ({
  onSelect,
  onOpenComparison,
}: {
  onSelect: (text: string) => void;
  onOpenComparison: () => void;
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 ">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center mb-4 shadow-lg">
        <Sparkles size={26} />
      </div>

      <h2 className="text-lg font-semibold mb-1">Asisten  Harmonisasi Dokumen Hukum</h2>

      <p className="text-sm text-muted-foreground mb-4 max-w-md leading-relaxed">
        Sistem ini merupakan platform untuk mengelola, memproses, mencari, dan menganalisis dokumen hukum secara terstruktur.
      </p>

      <p className="text-xs text-muted-foreground mb-6">
        Silakan pilih opsi perbandingan atau ajukan pertanyaan di bawah ini.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
        <button
          onClick={() => {
            onSelect("📄 Analisis Dokumen");
          }}
          className="text-left text-sm p-3.5 rounded-xl border bg-muted hover:bg-primary hover:text-white transition shadow-sm font-medium"
        >
          📄 Analisis Dokumen
        </button>

        <button
          onClick={onOpenComparison}
          className="text-left text-sm p-3.5 rounded-xl border border-blue-200 bg-blue-50/80 text-blue-800 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-200 hover:bg-blue-600 hover:text-white transition shadow-sm font-medium flex items-center justify-between group"
        >
          <span className="flex items-center gap-1.5">
            <Scale size={16} className="text-blue-600 group-hover:text-white transition" />
            Bandingkan Dokumen
          </span>
          <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 group-hover:bg-white/20 group-hover:text-white px-2 py-0.5 rounded font-normal transition">
            Draft Tabel
          </span>
        </button>
      </div>
    </div>
  );
};

const AIMessageRenderer = ({ message }: { message: string }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-lg font-semibold mt-3 mb-2">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-base font-semibold mt-3 mb-2">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="mb-3 leading-relaxed text-[14px] text-foreground">
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc pl-5 mb-3 space-y-1 text-sm">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-5 mb-3 space-y-1 text-sm">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        table: ({ children }) => (
          <div className="overflow-x-auto rounded-lg border mt-3 mb-3">
            <table className="w-full text-sm border-collapse">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border px-3 py-2 bg-muted text-left font-medium">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border px-3 py-2 align-top whitespace-pre-line">
            {children}
          </td>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-foreground">{children}</strong>
        ),
      }}
    >
      {message}
    </ReactMarkdown>
  );
};

const TypingDots = () => (
  <div className="flex items-center gap-1 px-3 py-2">
    <span className="h-2 w-2 bg-primary rounded-full animate-bounce" />
    <span className="h-2 w-2 bg-primary rounded-full animate-bounce delay-150" />
    <span className="h-2 w-2 bg-primary rounded-full animate-bounce delay-300" />
  </div>
);

/* =========================
   MAIN COMPONENT
========================= */
interface AsistenAIContentProps {
  initialChatId?: string | null;
}

export default function AsistenAIContent({ initialChatId = null }: AsistenAIContentProps) {
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showScroll, setShowScroll] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonDoc1, setComparisonDoc1] = useState<DokumenHukum | null>(null);
  const [comparisonDoc2, setComparisonDoc2] = useState<DokumenHukum | null>(null);
  const [comparisonSearch1, setComparisonSearch1] = useState("");
  const [comparisonSearch2, setComparisonSearch2] = useState("");
  const [comparisonDropdownOpen1, setComparisonDropdownOpen1] = useState(false);
  const [comparisonDropdownOpen2, setComparisonDropdownOpen2] = useState(false);
  const [comparisonErrorMsg, setComparisonErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const session = SessionHook();
  const userId = session?.data?.data?.id ?? "guest";

  const getHistoryKey = () => `chat-history-${userId}`;
  const getChatKey = (id: string) => `chat-${userId}-${id}`;

  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  function cleanAIResponse(text: string) {
    if (!text) return "";
    return text
      // Hapus sitasi tag seperti 【source=7】, 【source=2,3】, dll
      .replace(/【source=[^】]*】/gi, "")
      // Hapus blok catatan kaki atau disclaimer
      .replace(/catatan[:\s\S]*$/i, "")
      .replace(/note[:\s\S]*$/i, "")
      .trim();
  }

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || userId === "guest") return;

    const loadSession = async () => {
      let id = initialChatId;
      if (!id) {
        id = crypto.randomUUID();
        setConversationId(id);
      } else {
        setConversationId(id);
        const data = await getSessionById(id);
        if (data && data.conversation) {
          try {
            setConversation(
              typeof data.conversation === "string" 
                ? JSON.parse(data.conversation) 
                : data.conversation
            );
          } catch {
            setConversation([]);
          }
        }
      }
      setIsLoaded(true);
    };

    loadSession();

    const handleNewSessionEvent = () => {
      setConversation([]);
      const newSessionId = crypto.randomUUID();
      setConversationId(newSessionId);
      setSelectedFiles([]);
      setFileError(null);
    };

    window.addEventListener("chat-new-session", handleNewSessionEvent);
    return () => {
      window.removeEventListener("chat-new-session", handleNewSessionEvent);
    };
  }, [initialChatId, userId]);

  useEffect(() => {
    if (!conversationId || !isLoaded || userId === "guest") return;

    if (conversation.length > 0) {
      const title = conversation[0].type === "user" ? conversation[0].message : "Chat Baru";
      saveSession(conversationId, title, conversation).then(() => {
        window.dispatchEvent(new Event("chat-history-updated"));
      });
    }
  }, [conversation, conversationId, isLoaded, userId]);

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, isTyping]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    const isBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;

    setShowScroll(!isBottom);
  };

  const scrollToBottom = () => {
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // lama
  // const handleSendMessage = useCallback(async () => {
  //   if (!message.trim() || !conversationId || isTyping) return;

  //   const userMsg: ChatMessage = {
  //     id: newId(),
  //     type: "user",
  //     message,
  //     timestamp: nowTimestamp(),
  //   };

  //   setConversation((prev) => [...prev, userMsg]);
  //   setMessage("");
  //   setIsTyping(true);

  //   try {
  //     const res = await sendChatMessage(message, conversationId);

  //     const aiMsg: ChatMessage = {
  //       id: newId(),
  //       type: "assistant",
  //       message: res.message ?? "",
  //       timestamp: nowTimestamp(),
  //     };

  //     setConversation((prev) => [...prev, aiMsg]);
  //   } catch {
  //     setConversation((prev) => [
  //       ...prev,
  //       {
  //         id: newId(),
  //         type: "assistant",
  //         message: "Terjadi error",
  //         timestamp: nowTimestamp(),
  //       },
  //     ]);
  //   } finally {
  //     setIsTyping(false);
  //   }
  // }, [message, conversationId]);

  function isValidContext(currentText: string): boolean {
    const current = currentText.toLowerCase().trim();

    const legalKeywords = [
      "jdih",
      "jaringan dokumentasi",
      "informasi hukum",
      "dokumen",
      "peraturan",
      "regulasi",
      "undang-undang",
      "uu",
      "perpres",
      "peraturan presiden",
      "peraturan pemerintah",
      "pp",
      "keputusan",
      "instruksi",
      "hukum",
      "pasal",
      "ayat",
      "bab",
      "bagian",
      "ketentuan",
      "bin",
      "badan intelijen negara",
      "intelijen",
      "kebijakan",
      "aturan",
    ];

    return legalKeywords.some((keyword) => {
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const regex = new RegExp(`(^|\\s)${escaped}(?=\\s|$|[.,!?;:()])`, "i");

      return regex.test(current);
    });
  }

  function isFollowUpQuestion(
    currentText: string,
    previousConversation: ChatMessage[],
  ): boolean {
    const current = currentText.toLowerCase().trim();

    if (previousConversation.length === 0) {
      return false;
    }

    // =========================================================
    // AMBIL PESAN USER SEBELUMNYA
    // =========================================================

    const previousUserMessages = previousConversation
      .filter((msg) => msg.type === "user")
      .map((msg) => msg.message.toLowerCase())
      .join(" ");

    // =========================================================
    // FOLLOW-UP YANG SECARA EKSPLISIT MERUJUK KE KONTEN HUKUM
    // =========================================================

    const explicitFollowUpKeywords = [
      "peraturan itu",
      "aturan itu",
      "uu itu",
      "undang-undang itu",
      "perpres itu",
      "pp itu",
      "pasal itu",
      "ayat itu",
      "bab itu",
      "dokumen itu",

      "peraturan tersebut",
      "aturan tersebut",
      "uu tersebut",
      "undang-undang tersebut",
      "perpres tersebut",
      "pp tersebut",
      "pasal tersebut",
      "ayat tersebut",
      "bab tersebut",
      "dokumen tersebut",

      "peraturan ini",
      "aturan ini",
      "uu ini",
      "undang-undang ini",
      "perpres ini",
      "pp ini",
      "pasal ini",
      "ayat ini",
      "bab ini",

      "yang dimaksud",
      "maksudnya",
      "apa isinya",
      "apa maksudnya",
      "isinya apa",
      "tentang apa",
      "lebih detail",
      "lebih rinci",
      "jelaskan lagi",
      "jelaskan lebih lanjut",
      "lanjutkan",
    ];

    if (explicitFollowUpKeywords.some((keyword) => current.includes(keyword))) {
      return true;
    }

    // =========================================================
    // REFERENSI PASAL / AYAT / BAB
    //
    // Contoh:
    // "Bab 1 isinya apa?"
    // "Pasal 3 tentang apa?"
    // "Ayat 2 menjelaskan apa?"
    // =========================================================

    const legalReferencePattern =
      /^(bab|pasal|ayat|bagian|ketentuan)\s+[a-z0-9ivx.-]+/i;

    if (legalReferencePattern.test(current)) {
      return true;
    }

    // =========================================================
    // PERTANYAAN TENTANG WAKTU / STATUS PERATURAN
    //
    // Contoh:
    // "Tahun berapa peraturan itu dibuat?"
    // "Kapan ditetapkan?"
    // "Kapan berlaku?"
    // =========================================================

    const regulationFollowUpPatterns = [
      /^tahun berapa.*(dibuat|ditetapkan|disahkan|diterbitkan|berlaku)/i,
      /^kapan.*(dibuat|ditetapkan|disahkan|diterbitkan|berlaku)/i,
      /^tanggal berapa.*(ditetapkan|disahkan|diterbitkan)/i,
      /^sejak kapan.*(berlaku|diterapkan)/i,
      /^kapan.*berlaku/i,
    ];

    if (regulationFollowUpPatterns.some((pattern) => pattern.test(current))) {
      return true;
    }

    // =========================================================
    // PERTANYAAN LANJUTAN DENGAN REFERENSI "INI"
    //
    // Contoh:
    // "Ini berlaku kapan?"
    // "Ini ditetapkan kapan?"
    // =========================================================

    const contextualReferencePatterns = [
      /^ini\s+(berlaku|ditetapkan|disahkan|dibuat|diterbitkan)/i,
      /^ini\s+(tentang|mengatur|menjelaskan)/i,
      /^yang\s+ini\s+(tentang|mengatur|menjelaskan)/i,
    ];

    if (contextualReferencePatterns.some((pattern) => pattern.test(current))) {
      return true;
    }

    // =========================================================
    // JIKA ADA KATA HUKUM YANG JELAS
    // =========================================================

    if (isValidContext(current)) {
      return true;
    }

    // =========================================================
    // JANGAN LAGI MENGANGGAP SEMUA PERTANYAAN PENDEK
    // SEBAGAI FOLLOW-UP
    //
    // INI BAGIAN YANG MEMPERBAIKI BUG:
    //
    // "sepak bola" -> BLOCK
    // "website indonesia seperti apa" -> BLOCK
    // "ibu kota Indonesia di mana" -> BLOCK
    // =========================================================

    return false;
  }

  function canProcessQuestion(
    currentText: string,
    previousConversation: ChatMessage[],
  ): boolean {
    // =========================================================
    // CHAT PERTAMA
    // =========================================================

    if (previousConversation.length === 0) {
      return isValidContext(currentText);
    }

    if (isValidContext(currentText)) {
      return true;
    }

    if (isFollowUpQuestion(currentText, previousConversation)) {
      return true;
    }

    return false;
  }

  const handleCompareDocuments = useCallback(
    async (doc1: DokumenHukum, doc2: DokumenHukum, userQuery?: string) => {
      if (!conversationId || isTyping || isComparing) return;

      setIsComparisonOpen(false);
      setIsComparing(true);
      setIsTyping(true);

      const doc1Info = `${doc1.judul} (No. ${doc1.nomor || "-"} Thn ${doc1.tahun || "-"})`;
      const doc2Info = `${doc2.judul} (No. ${doc2.nomor || "-"} Thn ${doc2.tahun || "-"})`;

      let userMsgText = `Bandingkan Dokumen Hukum:\n• Dokumen 1: ${doc1Info}\n• Dokumen 2: ${doc2Info}`;
      if (userQuery && userQuery.trim()) {
        userMsgText += `\n\n: ${userQuery.trim()}`;
      }

      const userMsg: ChatMessage = {
        id: newId(),
        type: "user",
        message: userMsgText,
        timestamp: nowTimestamp(),
      };

      setConversation((prev) => [...prev, userMsg]);

      // Reset pilihan komparasi
      setComparisonDoc1(null);
      setComparisonDoc2(null);
      setComparisonSearch1("");
      setComparisonSearch2("");
      setComparisonErrorMsg(null);

      // Susun draft data perbandingan tabel terstruktur
      const comparisonPayload: ComparisonData = {
        doc1: {
          id: doc1.id,
          judul: doc1.judul,
          nomor: doc1.nomor || "-",
          tahun: doc1.tahun || "-",
          status: doc1.status || "Berlaku",
          tanggal_penetapan: formatTanggalIndo(doc1.tanggal_penetapan),
          tanggal_berlaku: formatTanggalIndo(doc1.tanggal_berlaku),
          sumber: doc1.sumber || "JDIH BIN",
          tempat_penetapan: doc1.tempat_penetapan || "Jakarta",
        },
        doc2: {
          id: doc2.id,
          judul: doc2.judul,
          nomor: doc2.nomor || "-",
          tahun: doc2.tahun || "-",
          status: doc2.status || "Berlaku",
          tanggal_penetapan: formatTanggalIndo(doc2.tanggal_penetapan),
          tanggal_berlaku: formatTanggalIndo(doc2.tanggal_berlaku),
          sumber: doc2.sumber || "JDIH BIN",
          tempat_penetapan: doc2.tempat_penetapan || "Jakarta",
        },
        items: [
          {
            kategori: "Nomor & Tahun Regulasi",
            doc1Value: `Nomor ${doc1.nomor || "-"} Tahun ${doc1.tahun || "-"}`,
            doc2Value: `Nomor ${doc2.nomor || "-"} Tahun ${doc2.tahun || "-"}`,
            analisis:
              doc1.tahun === doc2.tahun
                ? "Kedua regulasi ditetapkan pada periode tahun yang sama."
                : `Ditetapkan pada periode tahun berbeda (${doc1.tahun || "-"} vs ${doc2.tahun || "-"}). Perlu meninjau urutan kronologis pembentukan peraturan.`,
          },
          {
            kategori: "Status Keberlakuan Hukum",
            doc1Value: doc1.status || "Berlaku",
            doc2Value: doc2.status || "Berlaku",
            analisis:
              doc1.status?.toLowerCase() === doc2.status?.toLowerCase()
                ? `Kedua dokumen berstatus yuridis: ${doc1.status || "Aktif / Berlaku"}.`
                : `Status keberlakuan berbeda (${doc1.status || "-"} vs ${doc2.status || "-"}). Periksa apakah dokumen satu mencabut atau mengubah dokumen lainnya.`,
          },
          {
            kategori: "Subjek & Pokok Pengaturan",
            doc1Value: doc1.subject || doc1.bidang || "Peraturan Intelijen Negara & Kelembagaan",
            doc2Value: doc2.subject || doc2.bidang || "Peraturan Intelijen Negara & Kelembagaan",
            analisis:
              "Meninjau relevansi materi muatan norma hukum serta korelasi kewenangan teknis antar kedua produk regulasi.",
          },
          {
            kategori: "Tanggal & Tempat Penetapan",
            doc1Value: `${doc1.tempat_penetapan || "Jakarta"}, ${formatTanggalIndo(doc1.tanggal_penetapan)}`,
            doc2Value: `${doc2.tempat_penetapan || "Jakarta"}, ${formatTanggalIndo(doc2.tanggal_penetapan)}`,
            analisis:
              "Memastikan validitas aspek formil pengesahan dan tanggal mulai berlaku efektifnya ketentuan hukum.",
          },
          {
            kategori: "Sumber Publikasi Lembaran Resmi",
            doc1Value: doc1.sumber || "Jaringan Dokumentasi & Informasi Hukum BIN",
            doc2Value: doc2.sumber || "Jaringan Dokumentasi & Informasi Hukum BIN",
            analisis:
              "Tercatat dan terpublikasi secara sah pada pangkalan data portal resmi JDIH Badan Intelijen Negara.",
          },
          {
            kategori: "Harmonisasi & Keterkaitan Norma",
            doc1Value: `Materi pokok: ${doc1.judul}`,
            doc2Value: `Materi pokok: ${doc2.judul}`,
            analisis:
              "Harmonisasi memitigasi tumpang tindih regulasi, menguji konsistensi asas kepastian hukum, dan memperkuat kepatuhan kedinasan.",
          },
        ],
        kesimpulan: `Berdasarkan perbandingan komparatif terhadap "${doc1.judul}" dan "${doc2.judul}", kedua produk hukum memiliki keterkaitan substantif dalam tata kelola regulasi dan pelaksanaan fungsi intelijen negara.${
          userQuery ? ` Analisis terhadap fokus "${userQuery}": kedua dokumen memiliki pembagian norma dan materi muatan yang berbeda sesuai lingkup hierarki peraturannya.` : ""
        }`,
        rekomendasi:
          "Disarankan untuk mengacu pada regulasi terbaru serta senantiasa memastikan kepatuhan terhadap hierarki perundang-undangan dan asas lex superior / lex posterior.",
      };

      try {
        const prompt = `Analisis perbandingan komparatif hukum antara dua dokumen berikut:\n1. ${doc1.judul} (Nomor: ${doc1.nomor || "-"}, Tahun: ${doc1.tahun || "-"}, Status: ${doc1.status || "Berlaku"})\n2. ${doc2.judul} (Nomor: ${doc2.nomor || "-"}, Tahun: ${doc2.tahun || "-"}, Status: ${doc2.status || "Berlaku"}).\n${userQuery ? `Fokus pertanyaan pengguna: ${userQuery}\n` : ""}\nInstruksi format:\n- Sajikan analisis perbandingan dan harmonisasi secara rapi dan profesional.\n- Jangan sertakan tag sitasi seperti 【source=...】.\n- Gunakan format markdown standar (tabel Markdown GFM untuk komparasi aspek, poin-poin bullet list, dan penomoran ringkas).`;

        // Gunakan timeout 10 detik agar UI tidak stuck jika backend lambat/offline
        const timeoutPromise = new Promise<{ message?: string }>((resolve) =>
          setTimeout(() => resolve({ message: "" }), 10000)
        );

        const res = await Promise.race([
          sendChatMessage(prompt, conversationId),
          timeoutPromise,
        ]);

        const aiResponse = res?.message ? cleanAIResponse(res.message) : "";

        if (aiResponse) {
          comparisonPayload.kesimpulan = aiResponse;
        }

        const aiMsg: ChatMessage = {
          id: newId(),
          type: "assistant",
          message: "Berikut adalah lembar draft perbandingan dokumen hukum terstruktur antara kedua regulasi yang dipilih:",
          comparisonData: comparisonPayload,
          timestamp: nowTimestamp(),
        };

        setConversation((prev) => [...prev, aiMsg]);
      } catch {
        const aiMsg: ChatMessage = {
          id: newId(),
          type: "assistant",
          message: "Berikut adalah lembar draft perbandingan dokumen hukum terstruktur antara kedua regulasi yang dipilih:",
          comparisonData: comparisonPayload,
          timestamp: nowTimestamp(),
        };

        setConversation((prev) => [...prev, aiMsg]);
      } finally {
        setIsTyping(false);
        setIsComparing(false);
      }
    },
    [conversationId, isTyping, isComparing]
  );

  const handleSendMessage = useCallback(async () => {
    // Jika panel perbandingan dokumen sedang terbuka, submit dilakukan melalui tombol chat ini
    if (isComparisonOpen) {
      setComparisonErrorMsg(null);

      if (!comparisonDoc1 || !comparisonDoc2) {
        setComparisonErrorMsg("Minimal harus memilih 2 dokumen hukum untuk dibandingkan. Keduanya wajib diisi.");
        return;
      }

      if (
        comparisonDoc1.id === comparisonDoc2.id ||
        comparisonDoc1.judul.trim().toLowerCase() === comparisonDoc2.judul.trim().toLowerCase()
      ) {
        setComparisonErrorMsg("Judul dokumen hukum tidak boleh sama. Harap pilih 2 dokumen hukum yang berbeda.");
        return;
      }

      const queryText = message.trim();
      setMessage("");
      await handleCompareDocuments(comparisonDoc1, comparisonDoc2, queryText);
      return;
    }

    if ((!message.trim() && selectedFiles.length === 0) || !conversationId || isTyping) {
      return;
    }

    const userText = message.trim();
    const previousConversation = conversation;
    const filesToSave = selectedFiles.length > 0 ? selectedFiles.map(f => ({ name: f.name, size: f.size, type: f.type })) : undefined;


    const userMsg: ChatMessage = {
      id: newId(),
      type: "user",
      message: userText,
      timestamp: nowTimestamp(),
      files: filesToSave,
    };

    setConversation((prev) => [...prev, userMsg]);
    setMessage("");
    setSelectedFiles([]);

    const canProcess = userText ? canProcessQuestion(userText, previousConversation) : true;

    if (!canProcess && !filesToSave) {
      const blockedMsg: ChatMessage = {
        id: newId(),
        type: "assistant",
        message:
          "Maaf, pertanyaan tidak dapat diproses karena berada di luar konteks percakapan.\n\n" +
          "Silakan ajukan pertanyaan yang berkaitan dengan JDIH, hukum, " +
          "peraturan Intelijen Negara.",
        timestamp: nowTimestamp(),
      };

      setConversation((prev) => [...prev, blockedMsg]);

      return;
    }

    setIsTyping(true);

    try {
      const res = await sendChatMessage(userText || "Tolong analisa dokumen saya", conversationId);

      let aiText = res.message ?? "";

      // Hapus Sumber / Referensi / Catatan
      aiText = cleanAIResponse(aiText);

      const aiMsg: ChatMessage = {
        id: newId(),
        type: "assistant",
        message: aiText,
        timestamp: nowTimestamp(),
      };

      setConversation((prev) => [...prev, aiMsg]);
    } catch (error) {

      setConversation((prev) => [
        ...prev,
        {
          id: newId(),
          type: "assistant",
          message: "Terjadi error saat memproses pertanyaan.",
          timestamp: nowTimestamp(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [
    message,
    conversationId,
    isTyping,
    conversation,
    isComparisonOpen,
    comparisonDoc1,
    comparisonDoc2,
    handleCompareDocuments,
  ]);



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFileError(null);
    if (files.length === 0) return;

    const validTypes = [
      "application/pdf", 
      "application/vnd.ms-excel", 
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ];
    
    let hasError = false;
    const newFiles = [...selectedFiles];

    for (const file of files) {
      const fileName = file.name.toLowerCase();
      const isValidExt = fileName.endsWith('.pdf') || fileName.endsWith('.xls') || fileName.endsWith('.xlsx');

      if (!validTypes.includes(file.type) && !isValidExt) {
        setFileError("Beberapa format file tidak didukung. Hanya PDF dan Excel yang diperbolehkan.");
        hasError = true;
        break;
      }

      if (file.size > 50 * 1024 * 1024) {
        setFileError("Beberapa ukuran file terlalu besar. Maksimal 50 MB.");
        hasError = true;
        break;
      }
      
      newFiles.push(file);
    }

    if (!hasError) {
      setSelectedFiles(newFiles);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (indexToRemove: number) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleNewChat = () => {
    setConversation([]);
    setConversationId(crypto.randomUUID());
    setSelectedFiles([]);
    setFileError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isTyping) return;
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-transparent pt-4 relative">
      {/* SCROLLABLE AREA (FULL WIDTH) */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto w-full relative"
      >
        <div className="flex justify-center min-h-full pb-4">
          <div className="w-full max-w-[950px] p-4 flex flex-col">
            {conversation.length === 0 ? (
              <EmptyState 
                onSelect={(text) => setMessage(text)} 
                onOpenComparison={() => setIsComparisonOpen(true)}
              />
            ) : (
              <div className="space-y-5 flex-1 flex flex-col justify-end">
                {conversation.map((msg, i) => {
                  const isUser = msg.type === "user";
                  const hasComparison = !!msg.comparisonData;

                  return (
                    <div
                      key={msg.id}
                      ref={
                        i === conversation.length - 1 ? lastMessageRef : null
                      }
                      className={`flex gap-3 ${
                        hasComparison ? "justify-start w-full" : isUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!isUser && (
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white shrink-0 mt-0.5">
                          <Bot size={16} />
                        </div>
                      )}

                      <div
                        className={`text-sm shadow-sm transition-all ${
                          hasComparison
                            ? "w-full max-w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 rounded-2xl p-4 sm:p-5"
                            : isUser
                            ? "max-w-[80%] bg-primary text-white rounded-2xl rounded-br-sm px-4 py-3"
                            : "max-w-[80%] bg-muted rounded-2xl rounded-bl-sm px-4 py-3"
                        }`}
                      >
                        {hasComparison && msg.comparisonData ? (
                          <div>
                            {msg.message && (
                              <p className="font-medium text-slate-700 dark:text-slate-200 text-sm mb-2 leading-relaxed">
                                {msg.message}
                              </p>
                            )}
                            <ComparisonDraftTable data={msg.comparisonData} />
                          </div>
                        ) : isUser ? (
                          <div className="flex flex-col gap-2">
                            {msg.files && msg.files.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-1">
                                {msg.files.map((file, idx) => (
                                  <div key={idx} className="flex items-center gap-3 bg-white/20 p-2 pr-3 rounded-xl border border-white/30">
                                    <div className="p-1.5 bg-white rounded-lg shadow-sm">
                                      {file.type === "application/pdf" || file.name.toLowerCase().endsWith('.pdf') ? (
                                        <FileText className="text-red-500" size={16} />
                                      ) : (
                                        <FileSpreadsheet className="text-green-600" size={16} />
                                      )}
                                    </div>
                                    <div className="flex flex-col max-w-[120px] sm:max-w-[150px]">
                                       <span className="text-sm font-medium text-white truncate">{file.name}</span>
                                       <span className="text-[10px] text-white/80">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {msg.message && (
                              <p className="whitespace-pre-wrap leading-relaxed">
                                {msg.message}
                              </p>
                            )}
                          </div>
                        ) : (
                          <AIMessageRenderer message={msg.message} />
                        )}

                        <div className="text-[10px] mt-2 opacity-60 text-right">
                          {msg.timestamp}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isTyping && <TypingDots />}
              </div>
            )}
          </div>
        </div>

        {/* SCROLL BUTTON */}
        {showScroll && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-24 right-8 bg-primary text-white p-3 rounded-full shadow-lg hover:scale-105 transition z-10"
          >
            <ArrowDown size={18} />
          </button>
        )}
      </div>

      {/* FIXED INPUT AREA AT THE BOTTOM */}
      <div className="w-full flex justify-center shrink-0 p-4 pb-6">
        <div className="w-full max-w-[850px] flex flex-col">
          {/* Document Comparison 2-Column Selector Component */}
          <DocumentComparisonSelector
            isOpen={isComparisonOpen}
            onClose={() => {
              setIsComparisonOpen(false);
              setComparisonErrorMsg(null);
            }}
            doc1={comparisonDoc1}
            doc2={comparisonDoc2}
            setDoc1={setComparisonDoc1}
            setDoc2={setComparisonDoc2}
            search1={comparisonSearch1}
            setSearch1={setComparisonSearch1}
            search2={comparisonSearch2}
            setSearch2={setComparisonSearch2}
            dropdownOpen1={comparisonDropdownOpen1}
            setDropdownOpen1={setComparisonDropdownOpen1}
            dropdownOpen2={comparisonDropdownOpen2}
            setDropdownOpen2={setComparisonDropdownOpen2}
            errorMsg={comparisonErrorMsg}
            setErrorMsg={setComparisonErrorMsg}
          />

          <div className="w-full flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
            {/* File Preview */}
            {selectedFiles.length > 0 && (
              <div className="px-4 pt-4 pb-1 flex items-center flex-wrap gap-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-2 pr-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                      {file.type === "application/pdf" || file.name.toLowerCase().endsWith('.pdf') ? (
                        <FileText className="text-red-500" size={20} />
                      ) : (
                        <FileSpreadsheet className="text-green-600" size={20} />
                      )}
                    </div>
                    <div className="flex flex-col max-w-[120px] sm:max-w-[150px]">
                       <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{file.name}</span>
                       <span className="text-xs text-slate-500 dark:text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                    <button 
                      onClick={() => removeFile(index)} 
                      className="ml-1 p-1 text-slate-400 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Error Message */}
            {fileError && (
              <div className="px-4 pt-3 pb-1">
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertTriangle size={14} /> {fileError}
                </p>
              </div>
            )}

            <div className="flex items-end p-1.5 pl-3 gap-2">
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
                accept=".pdf,.xls,.xlsx,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                title="Upload Dokumen"
                className="h-10 w-10 shrink-0 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition mb-0.5"
              >
                <Plus size={22} />
              </button>

              {/* Perbandingan Dokumen Button Trigger */}
              <button
                type="button"
                onClick={() => {
                  setComparisonErrorMsg(null);
                  setIsComparisonOpen((prev) => !prev);
                }}
                title={isComparisonOpen ? "Tutup Perbandingan Dokumen" : "Buka Perbandingan Dokumen Hukum (2 Kolom)"}
                className={`h-10 px-3 shrink-0 flex items-center gap-1.5 rounded-full text-xs font-medium transition mb-0.5 cursor-pointer ${
                  isComparisonOpen
                    ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Scale size={16} />
                <span className="font-medium">Bandingkan</span>
                {isComparisonOpen && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsComparisonOpen(false);
                      setComparisonErrorMsg(null);
                    }}
                    className="ml-0.5 p-0.5 rounded-full hover:bg-white/20 transition cursor-pointer"
                    title="Tutup / Nonaktifkan"
                  >
                    <X size={13} />
                  </span>
                )}
              </button>
              
              <textarea
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onKeyDown={handleKeyDown}
                disabled={isTyping || isComparing}
                placeholder={
                  isComparisonOpen 
                    ? "Klik panah kirim di samping untuk memproses perbandingan 2 dokumen..." 
                    : "Ketik pesan..."
                }
                className="flex-1 resize-none bg-transparent py-3 text-[15px] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none disabled:opacity-60 max-h-[150px]"
                rows={1}
                style={{ minHeight: '44px' }}
              />

              <button
                onClick={handleSendMessage}
                disabled={
                  isTyping ||
                  isComparing ||
                  (isComparisonOpen
                    ? (!comparisonDoc1 || !comparisonDoc2)
                    : (!message.trim() && selectedFiles.length === 0))
                }
                title={isComparisonOpen ? "Kirim dan Bandingkan Dokumen" : "Kirim Pesan"}
                className="h-10 w-10 shrink-0 flex items-center justify-center rounded-full bg-blue-600 text-white transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 mb-0.5"
              >
                <ArrowUp
                  size={20}
                  strokeWidth={2.5}
                  className={isTyping || isComparing ? "animate-pulse" : ""}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
