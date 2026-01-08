
import { create } from "zustand";
import { apiGet, apiPatch } from "../lib/api.js";

export const useAuthStore = create((set, get) => ({
  token: localStorage.getItem("token") || "",
  authUser: null,
  loading: false,

  setToken: (token) => {
    localStorage.setItem("token", token);
    set({ token });
  },

  clearAuth: () => {
    localStorage.removeItem("token");
    set({ token: "", authUser: null });
  },

  init: async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    set({ token });

    try {
      await get().fetchMe();
    } catch {
      // אם הטוקן לא תקין – ננקה
      get().clearAuth();
    }
  },

  fetchMe: async () => {
    set({ loading: true });
    try {
      const res = await apiGet("/api/auth/me");
      set({ authUser: res.user });
      return res.user;
    } finally {
      set({ loading: false });
    }
  },

  updateProfile: async (data) => {
    set({ loading: true });
    try {
      const res = await apiPatch("/api/auth/profile", data);
      set({ authUser: res.user });
      return res.user;
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    get().clearAuth();
  },
}));
