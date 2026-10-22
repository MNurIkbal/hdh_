"use client";

import { Suspense, useState, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  Pencil,
  Trash2,
  FileText,
  Clock,
  Building2,
} from "lucide-react";

import DataTable, { type DataTableColumn } from "@/components/ui/DataTable";
import Drawer from "@/components/ui/Drawer";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import DraftPeraturanForm from "./DraftPeraturanForm";
import DraftPeraturanDetailModal from "./DraftPeraturanDetailModal";
import { DraftPeraturan } from "../types/DraftPeraturan.type";
import {
  useDeleteDraftPeraturan,
  useDraftPeraturanList,
} from "../hooks/DraftPeraturan.hooks";

export default function DraftPeraturanComponent() {
  return (
    <Suspense fallback={null}>
      <DraftPeraturanContent />
    </Suspense>
  );
}

function DraftPeraturanContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pageParam = searchParams.get("page");
  const sizeParam = searchParams.get("size");

  const parsedPage = Number(pageParam);
  const parsedSize = Number(sizeParam);

  const page = Number.isInteger(parsedPage) && parsedPage >= 0 ? parsedPage : 0;
  const size = Number.isInteger(parsedSize) && parsedSize > 0 ? parsedSize : 10;
  const search = searchParams.get("search") ?? "";

  // Drawer Create / Edit
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
  const [selectedDraft, setSelectedDraft] = useState<DraftPeraturan | null>(null);

  // Detail Modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<DraftPeraturan | null>(null);

  // Delete Modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteData, setDeleteData] = useState<DraftPeraturan | null>(null);

  const queryParams = {
    page: page + 1, // backend is 1-indexed
    size,
    search,
  };

  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
  } = useDraftPeraturanList(queryParams);

  const deleteMutation = useDeleteDraftPeraturan();

  const rawData: DraftPeraturan[] = Array.isArray(response?.data)
    ? response.data
    : Array.isArray((response as any)?.content)
    ? (response as any).content
    : [];

  const pagination = response?.pagination ?? {};
  const totalElements = pagination.total ?? (response as any)?.total ?? rawData.length;
  const totalPages = pagination.totalPages ?? Math.ceil(totalElements / size);

  const updateUrlParams = (newParams: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === "" || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (keyword: string) => {
    updateUrlParams({ search: keyword, page: 0 });
  };

  const handlePageChange = (newPage: number) => {
    updateUrlParams({ page: newPage });
  };

  const handleSizeChange = (newSize: number) => {
    updateUrlParams({ size: newSize, page: 0 });
  };

  const handleOpenCreate = () => {
    setSelectedDraft(null);
    setDrawerMode("create");
    setDrawerOpen(true);
  };

  const handleOpenEdit = (draft: DraftPeraturan) => {
    setSelectedDraft(draft);
    setDrawerMode("edit");
    setDrawerOpen(true);
  };

  const handleOpenDetail = (draft: DraftPeraturan) => {
    setDetailData(draft);
    setDetailOpen(true);
  };

  const handleOpenDelete = (draft: DraftPeraturan) => {
    setDeleteData(draft);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteData?.id) return;
    deleteMutation.mutate(deleteData.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        setDeleteData(null);
        refetch();
      },
    });
  };

  const getStatusBadge = (statusName: string) => {
    switch (statusName) {
      case "Disetujui":
      case "Siap Diundangkan":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {statusName}
          </span>
        );
      case "Dalam Pembahasan":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            {statusName}
          </span>
        );
      case "Perlu Revisi":
      case "Revisi":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            {statusName}
          </span>
        );
      case "Ditolak":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            {statusName}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-500/20 bg-slate-500/10 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-500/20 dark:text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            {statusName}
          </span>
        );
    }
  };

  const getTahapanBadge = (tahapName: string) => {
    return (
      <span className="inline-flex items-center gap-1 rounded-lg border border-purple-500/20 bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700 dark:border-purple-800/40 dark:bg-purple-950/30 dark:text-purple-300">
        <Clock className="h-3 w-3" />
        {tahapName}
      </span>
    );
  };

  const columns: DataTableColumn<DraftPeraturan>[] = useMemo(
    () => [
      {
        key: "no",
        label: "No",
        width: "60px",
        align: "center",
        render: (_val, _row, index) => {
          return (
            <span className="font-mono text-xs text-slate-500">
              {page * size + index + 1}
            </span>
          );
        },
      },
      {
        key: "judul",
        label: "Judul & Nomor Rancangan",
        width: "350px",
        render: (_val, row) => (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {row.nomor_rancangan && (
                <span className="inline-block rounded bg-blue-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                  {row.nomor_rancangan}
                </span>
              )}
              <span className="text-xs font-medium text-slate-400">
                Tahun {row.tahun}
              </span>
            </div>
            <p
              onClick={() => handleOpenDetail(row)}
              className="cursor-pointer text-sm font-semibold text-slate-900 transition hover:text-blue-600 line-clamp-2 dark:text-slate-100 dark:hover:text-blue-400"
            >
              {row.judul}
            </p>
          </div>
        ),
      },
      {
        key: "kategori",
        label: "Bentuk & Pemrakarsa",
        width: "220px",
        render: (_val, row) => (
          <div className="space-y-1">
            <span className="inline-block text-xs font-medium text-slate-700 dark:text-slate-300">
              {row.kategori}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              <Building2 className="h-3 w-3 shrink-0" />
              <span className="truncate">{row.pemrakarsa || "-"}</span>
            </div>
          </div>
        ),
      },
      {
        key: "tahapan",
        label: "Tahapan Pembahasan",
        width: "190px",
        render: (_val, row) => getTahapanBadge(row.tahapan),
      },
      {
        key: "status",
        label: "Status",
        width: "150px",
        render: (_val, row) => getStatusBadge(row.status),
      },
      {
        key: "file_draft",
        label: "Dokumen",
        width: "120px",
        align: "center",
        render: (_val, row) => {
          if (!row.file_draft_url && !row.file_draft) {
            return (
              <span className="text-xs text-slate-400 italic">Belum ada</span>
            );
          }
          return (
            <a
              href={row.file_draft_url || "#"}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-900/50"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Draft</span>
            </a>
          );
        },
      },
      {
        key: "actions",
        label: "Aksi",
        width: "130px",
        align: "center",
        render: (_val, row) => (
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => handleOpenDetail(row)}
              title="Lihat Detail"
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-blue-950/40 dark:hover:text-blue-400"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleOpenEdit(row)}
              title="Edit Draft"
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-amber-50 hover:text-amber-600 dark:text-slate-400 dark:hover:bg-amber-950/40 dark:hover:text-amber-400"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleOpenDelete(row)}
              title="Hapus Draft"
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [page, size]
  );

  return (
    <div className="w-full">
      <div className="mx-auto max-w-[1600px]">
        {/* DATA TABLE */}
        <DataTable
          title="Draft Peraturan Dokumen Hukum"
          description="Pusat manajemen penyusunan, telaah harmonisasi, dan penetapan rancangan regulasi JDIH."
          data={rawData}
          columns={columns}
          getRowId={(row) => row.id}
          loading={isLoading || isFetching}
          searchPlaceholder="Cari judul, nomor rancangan, pemrakarsa..."
          onSearch={handleSearch}
          onAdd={handleOpenCreate}
          addButtonText="Tambah Draft Peraturan"
          page={page}
          size={size}
          totalElements={totalElements}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onSizeChange={handleSizeChange}
          onRefresh={() => refetch()}
        />
      </div>

      {/* DRAWER FORM */}
      <Drawer
        open={drawerOpen}
        mode={drawerMode}
        title={
          drawerMode === "create"
            ? "Tambah Draft Peraturan Baru"
            : "Edit Draft Peraturan"
        }
        subtitle="Lengkapi data rancangan regulasi, instansi pemrakarsa, dan unggah berkas pendukung"
        width="2xl"
        onClose={() => setDrawerOpen(false)}
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <DraftPeraturanForm
          mode={drawerMode}
          data={selectedDraft}
          onSuccess={() => {
            setDrawerOpen(false);
            refetch();
          }}
          onCancel={() => setDrawerOpen(false)}
        />
      </Drawer>

      {/* DETAIL MODAL */}
      <DraftPeraturanDetailModal
        open={detailOpen}
        data={detailData}
        onClose={() => setDetailOpen(false)}
        onEdit={(draft) => {
          handleOpenEdit(draft);
        }}
      />

      {/* CONFIRM DELETE MODAL */}
      <ConfirmDeleteModal
        open={deleteOpen}
        title="Hapus Draft Peraturan"
        description={`Apakah Anda yakin ingin menghapus draft "${deleteData?.judul}"? Tindakan ini akan mengarsipkan dokumen rancangan tersebut.`}
        loading={deleteMutation.isPending}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
