import { create } from "zustand";
import { apiClient } from "../config/axiosConfig"; // Make sure this includes JWT headers
import { IUser } from "../types/user";

interface TranscriptState {
  users: IUser[];
  selectedUser: IUser | null;
  loading: boolean;
  error: string | null;

  fetchAllUsers: () => Promise<IUser[]>;
  fetchUserById: (id: string) => Promise<IUser>;
  updateUserById: (id: string, data: Partial<IUser>) => Promise<IUser>;
  createUser: (data: IUser) => Promise<IUser>;
  downloadTranscriptPDF: (id: string) => Promise<void>;
  deleteUserById: (id: string) => Promise<void>;
}

export const useUserStore = create<TranscriptState>((set) => ({
  users: [],
  selectedUser: null,
  loading: false,
  error: null,

  fetchAllUsers: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.get("/users/all");
      set({ users: res.data, loading: false });

      return res.data as IUser[];
    } catch (err) {
      set({ error: (err as Error).message || "Failed to fetch users", loading: false });
      throw err;
    }
  },

  fetchUserById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.get(`/users/${id}`);
      set({ selectedUser: res.data.user, loading: false });


      console.log("User from user store:", res.data.user);

      return res.data.user as IUser;
    } catch (err) {
      set({ error: (err as Error).message || "Failed to fetch user", loading: false });
      throw err;
    }
  },

  updateUserById: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.patch(`/users/edit/${id}`, data);
      set({ selectedUser: res.data.user, loading: false });

      return res.data.user as IUser;
    } catch (err) {
      set({ error: (err as Error).message || "Failed to update user", loading: false });
      throw err;
    }
  },

  createUser: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.post("/users/create", data);
      set((state) => ({
        users: [...state.users, res.data],
        loading: false,
      }));
      return res.data;
    } catch (err) {
      set({ error: (err as Error).message || "Failed to create user", loading: false });
      throw err;
    }
  },

  

  downloadTranscriptPDF: async (id) => {
    try {
      const res = await apiClient.get(`/transcripts/${id}/pdf`, {
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Transcript_${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download failed:", err);
    }
  },


  deleteUserById: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/users/${id}`);
      set((state) => ({
        users: state.users.filter((t) => t._id !== id),
        loading: false,
      }));
    } catch (err) {
      set({ error: (err as Error).message || "Failed to delete user", loading: false });
      throw err;
    }
  }
}));
