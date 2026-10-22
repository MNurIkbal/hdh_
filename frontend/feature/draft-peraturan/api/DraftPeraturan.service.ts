import { createApiClient } from "@/lib/api";
import { PaginationParams, SpringPage } from "@/types/GlobalType";
import { DraftPeraturan, DraftPeraturanSummary } from "../types/DraftPeraturan.type";

const api = createApiClient("/master-data");

export const fetchDraftPeraturan = async (
  params: PaginationParams & {
    kategori?: string;
    tahapan?: string;
    status?: string;
    tahun?: string;
  }
): Promise<SpringPage<DraftPeraturan>> => {
  const res = await api.get("/draft-peraturan", { params });
  return res.data;
};

export const fetchDraftPeraturanSummary = async (): Promise<DraftPeraturanSummary> => {
  const res = await api.get("/draft-peraturan/summary");
  return res.data.data;
};

export const fetchByIdDraftPeraturan = async (
  id: number
): Promise<DraftPeraturan> => {
  const res = await api.get(`/draft-peraturan/${id}`);
  return res.data.data;
};

export const createDraftPeraturan = async (
  data: FormData
): Promise<DraftPeraturan> => {
  const res = await api.post("/draft-peraturan", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data.data;
};

export const updateDraftPeraturan = async (
  id: number,
  data: FormData
): Promise<DraftPeraturan> => {
  const res = await api.put(`/draft-peraturan/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data.data;
};

export const deleteDraftPeraturan = async (
  id: number
): Promise<void> => {
  await api.delete(`/draft-peraturan/${id}`);
};
