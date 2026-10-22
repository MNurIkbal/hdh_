import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createDraftPeraturan,
  deleteDraftPeraturan,
  fetchByIdDraftPeraturan,
  fetchDraftPeraturan,
  fetchDraftPeraturanSummary,
  updateDraftPeraturan,
} from "../api/DraftPeraturan.service";

const getErrorMessage = (error: any) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.detail ||
    error?.message ||
    "Terjadi kesalahan"
  );
};

export const useDraftPeraturanList = (params: any) => {
  return useQuery({
    queryKey: ["DraftPeraturan", params],
    queryFn: () => fetchDraftPeraturan(params),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};

export const useDraftPeraturanSummary = () => {
  return useQuery({
    queryKey: ["DraftPeraturanSummary"],
    queryFn: () => fetchDraftPeraturanSummary(),
    staleTime: 30000,
  });
};

export const useDraftPeraturanDetail = (id: number) => {
  return useQuery({
    queryKey: ["DraftPeraturan", id],
    queryFn: () => fetchByIdDraftPeraturan(id),
    enabled: !!id,
  });
};

export const useCreateDraftPeraturan = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createDraftPeraturan,
    onSuccess: () => {
      toast.success("Draft peraturan berhasil ditambahkan");
      qc.invalidateQueries({
        queryKey: ["DraftPeraturan"],
      });
      qc.invalidateQueries({
        queryKey: ["DraftPeraturanSummary"],
      });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useUpdateDraftPeraturan = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) =>
      updateDraftPeraturan(id, data),
    onSuccess: () => {
      toast.success("Draft peraturan berhasil diperbarui");
      qc.invalidateQueries({
        queryKey: ["DraftPeraturan"],
      });
      qc.invalidateQueries({
        queryKey: ["DraftPeraturanSummary"],
      });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useDeleteDraftPeraturan = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteDraftPeraturan,
    onSuccess: () => {
      toast.success("Draft peraturan berhasil dihapus");
      qc.invalidateQueries({
        queryKey: ["DraftPeraturan"],
      });
      qc.invalidateQueries({
        queryKey: ["DraftPeraturanSummary"],
      });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
};
