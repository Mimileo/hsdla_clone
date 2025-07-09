import { create } from "zustand";
import axios from "axios";
import { apiClient } from "../config/axiosConfig";
import { type IUser } from "../../src/types/user";

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || "An unexpected error occurred.";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong.";
};

interface AuthState {
  user: IUser | null;
  accessToken: string | null;
  setAccessToken: (accessToken: string | null) => void;
  isAuthenticated: boolean;
  error: string | null;
  isLoading: boolean;
  isCheckingAuth: boolean;
  message: string | null;
  setUser: (user: IUser | null) => void;
  getUser: () => IUser | null;
  getStatus: () => string;

  updateCurrentUser: (
    id: string,
    data: IUser | Partial<IUser>
  ) => Promise<IUser>;

  signup: (
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => Promise<{ user: IUser }>;

  login: (email: string, password: string) => Promise<{ user: IUser }>;

  logout: () => Promise<void>;

  verifyEmail: (code: string) => Promise<void>;

  checkAuth: () => Promise<void>;

  forgotPassword: (email: string) => Promise<void>;

  resetPassword: (token: string, password: string) => Promise<void>;

  refreshToken: () => Promise<string | null>;

}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  setAccessToken: (accessToken: string | null) => set({ accessToken }),
  isAuthenticated: false,
  error: null,
  isLoading: false,
  isCheckingAuth: true,
  message: null,

  signup: async (
    firstName,
    lastName,
    username,
    email,
    password,
    confirmPassword
  ) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post(`/auth/register`, {
        firstName,
        lastName,
        username,
        email,
        password,
        confirmPassword,
      });

      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      set({
        error: errorMessage || "Signup Failed",
        isLoading: false,
      });
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post(`/auth/login`, { email, password });

      /** Printing the objects
            if (response.data.user) {
                console.log("Login user object properties:");
                Object.entries(response.data.user).forEach(([key, value]) => {
                    console.log(`  ${key}:`, value);
                });
            } else {
                console.log("No user object in login response");
            } **/

      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        accessToken: response.data.accessToken,
      });
      return response.data.user;
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      set({
        error: errorMessage || "Error logging in",
        isLoading: false,
        isAuthenticated: false,
        user: null,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post(`/auth/logout`);

      if (response.data.message) {
        console.log(response.data.message);
      }

      set({
        user: null,
        isAuthenticated: false,
        error: null,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      console.log(errorMessage);

      set({
        error: "Error logging out",
        isLoading: false,
      });
    }
  },

  verifyEmail: async (code: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post(`/verify-email`, { code });

      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });

      console.log("verfiy-email auth working");
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      console.log(errorMessage);

      set({
        error: errorMessage || "Error verifying email",
        isLoading: false,
      });
      throw error;
    }
  },

 checkAuth: async () => {
  set({ isCheckingAuth: true, error: null });

  try {
    const response = await apiClient.get(`/auth/session`);
    if (response.data?.user) {
      set({
        user: response.data.user,
        isAuthenticated: true,
        isCheckingAuth: false,
      });
      return response.data;
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      try {
        // Try to refresh the token
        const accessToken = await get().refreshToken();
        if (accessToken) {
          const response = await apiClient.get(`/auth/session`);
          set({
            user: response.data.user,
            isAuthenticated: true,
            isCheckingAuth: false,
          });
          return response.data;
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (refreshError) {
        console.log("Token refresh failed");
      }
    }

    set({
      error: null,
      isAuthenticated: false,
      isCheckingAuth: false,
      user: null,
    });
  }
},

  forgotPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post(`/forgot-password`, { email });

      set({
        message: response.data.message,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      set({
        error: errorMessage || "Error sending reset password mail",
        isLoading: false,
      });
      throw error;
    }
  },

  resetPassword: async (token: string, password: string) => {
    console.log("token : " + token);
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post(`/reset-password/${token}`, {
        password,
      });

      set({
        message: response.data.message,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = getErrorMessage(error) || "Error resetting password";
      console.log(errorMessage);

      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },


  refreshToken: async () => {
  try {
    const response = await apiClient.get(`/auth/refresh`, {
      withCredentials: true,
    });

    if (response.data.accessToken) {
      set({ accessToken: response.data.accessToken, isAuthenticated: true });
      return response.data.accessToken;
    }

    return null;
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    set({
      error: errorMessage || "Error refreshing token",
      isAuthenticated: false,
      user: null,
    });
    throw error;
  }
},


  getStatus: (): string => {
    const { user } = useAuthStore.getState();
    return user ? "Active" : "Inactive";
  },

    setUser: (user) => {
    if (user && !user._id && user._id) {
       console.log("User ID not found in user object:", user);
    }
    set({ user, isAuthenticated: !!user });
    },
  getUser: () => get().user,

  updateCurrentUser: async (id, updates) => {
    try {
      const response = await apiClient.patch(`/users/edit/${id}`, updates);
      const updatedUser = response.data;

      if (!updatedUser || !updatedUser._id) {
        throw new Error("Invalid user returned from update");
      }

      set({ user: updatedUser });
      return updatedUser;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      set({ error: errorMessage });
      throw error;
    }
  },
}));
