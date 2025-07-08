import { create } from "zustand";
import { apiClient } from "../config/axiosConfig"; // Make sure this includes JWT headers
import { ITranscript } from "../types/transcript";






interface TranscriptState {
  transcripts: ITranscript[];
  selectedTranscript: ITranscript | null;
  loading: boolean;
  error: string | null;

  fetchAllTranscripts: () => Promise<ITranscript[]>;
  fetchTranscriptById: (id: string) => Promise<ITranscript>;
  editTranscriptById: (id: string, data: ITranscript | Partial<ITranscript>) => Promise<ITranscript>;
  createTranscript: (data: ITranscript) => Promise<ITranscript>;
  downloadTranscriptPDF: (id: string, withLogo?: boolean) => Promise<void>;
  clearSelectedTranscript: () => void;
  deleteTranscript: (id: string) => Promise<void>;
}

export const useTranscriptStore = create<TranscriptState>((set) => ({
  transcripts: [],
  selectedTranscript: null,
  loading: false,
  error: null,

  fetchAllTranscripts: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.get("/transcripts/all");
      set({ transcripts: res.data, loading: false });

      return res.data as ITranscript[];
    } catch (err) {
      set({ error: (err as Error).message || "Failed to fetch transcripts", loading: false });
      throw err;
    }
  },

  fetchTranscriptById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.get(`/transcripts/${id}`);
      set({ selectedTranscript: res.data, loading: false });

      return res.data as ITranscript;
    } catch (err) {
      set({ error: (err as Error).message || "Failed to fetch transcript", loading: false });
      throw err;
    }
  },

  editTranscriptById: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.patch(`/transcripts/${id}`, data);

      set({ selectedTranscript: res.data, loading: false });

      return res.data as ITranscript;
    } catch (err) {
      set({ error: (err as Error).message || "Failed to fetch transcript", loading: false });
      throw err;
    }
  },

  createTranscript: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.post("/transcripts/create", data);
      set((state) => ({
        transcripts: [...state.transcripts, res.data],
        loading: false,
      }));
      return res.data;
    } catch (err) {
      set({ error: (err as Error).message || "Failed to create transcript", loading: false });
      throw err;
    }
  },

  

  downloadTranscriptPDF: async (id, withLogo = false) => {
    try {
      const res = await apiClient.get(`/transcripts/${id}/pdf${withLogo ? "?logo=true" : ""}`, {
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const state = useTranscriptStore.getState();
      const transcript = state.selectedTranscript;

       const studentName = transcript?.student
      ? `${transcript.student.firstName}_${transcript.student.lastName}`.replace(/\s+/g, "_")
      : `Transcript_${id}`;

      const a = document.createElement("a");
      a.href = url;
      a.download = `${studentName}_Transcript.pdf`;
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error("PDF download failed:", err);
    }
  },

  clearSelectedTranscript: () => set({ selectedTranscript: null }),

  deleteTranscript: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/transcripts/${id}`);
      set((state) => ({
        transcripts: state.transcripts.filter((t) => t._id !== id),
        loading: false,
      }));
    } catch (err) {
      set({ error: (err as Error).message || "Failed to delete transcript", loading: false });
      throw err;
    }
  }
}));
