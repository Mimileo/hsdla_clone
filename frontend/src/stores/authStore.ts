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
    getStatus: () => string;

    signup: (
        firstName: string,
        lastName: string,
        username: string,
        email: string, 
        password: string, 
        confirmPassword: string
    ) => Promise<{ user: IUser }>;

    login: (
        email: string,
        password: string
    ) => Promise<{ user: IUser  }>;

    logout: () => Promise<void>;

    verifyEmail: (
        code: string
    ) => Promise<void>;

    checkAuth: () => Promise<void>;

    forgotPassword: (
        email: string
    ) => Promise<void>;

    resetPassword: (
        token: string,
        password: string
    ) => Promise<void>;

}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    accessToken: null,
    setAccessToken: (accessToken: string | null) => set({ accessToken }),
    isAuthenticated: false,
    error: null,
    isLoading: false,
    isCheckingAuth: true,
    message: null,

    signup: async (firstName, lastName, username, email, password, confirmPassword) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.post(`/auth/register`, {
                firstName,
                lastName,
                username,
                email,
                password,
                confirmPassword
            });

            set({
                user: response.data.user,
                isAuthenticated: true,
                isLoading: false
            });
            return response.data;
        } catch (error) {

            const errorMessage = getErrorMessage(error);
            set({
                error: errorMessage || "Signup Failed",
                isLoading: false
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
                accessToken: response.data.accessToken
            });
            return response.data;
        } catch (error) {
            const errorMessage = getErrorMessage(error);

            set({
                error: errorMessage || "Error logging in",
                isLoading: false,
                isAuthenticated: false,
                user: null
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
                isLoading: false
            });
        } catch (error) {

            const errorMessage = getErrorMessage(error);

            console.log(errorMessage);

            set({
                error: "Error logging out",
                isLoading: false
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
                isLoading: false
            });
            
            console.log('verfiy-email auth working');
            return response.data;
        } catch (error) {
            const errorMessage = getErrorMessage(error);

            console.log(errorMessage);

            set({
                error: errorMessage || "Error verifying email",
                isLoading: false
            });
            throw error;
        }
    },

    checkAuth: async () => {
        set({ isCheckingAuth: true, error: null });
        try {
            const response = await apiClient.get(`/auth/session`);
            
            if (response.data) {
                console.log("Login user object properties:");
                Object.entries(response.data.user).forEach(([key, value]) => {
                    console.log(`  ${key}:`, value);
                });
            } else {
                console.log("No user object in login response");
            }
            
            set({
                user: response.data.user,
                isAuthenticated: true,
                isCheckingAuth: false
            });
            
            return response.data;
        } catch (error) {
            const errorMessage = getErrorMessage(error);

            console.log(errorMessage);

            set({
                error: null,
                isAuthenticated: false,
                isCheckingAuth: false,
                user: null
            });
        }
    },

    forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.post(`/forgot-password`, { email });

            set({
                message: response.data.message,
                isLoading: false
            });
        } catch (error) {

            const errorMessage = getErrorMessage(error);

            set({
                error: errorMessage || "Error sending reset password mail",
                isLoading: false
            });
            throw error;
        }
    },

    resetPassword: async (token: string, password: string) => {
        console.log("token : " + token);
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.post(`/reset-password/${token}`, { password });

            set({
                message: response.data.message,
                isLoading: false
            });
        } catch (error) {

            const errorMessage = getErrorMessage(error) || "Error resetting password";
            console.log(errorMessage);
            
            set({
                error: errorMessage,
                isLoading: false
            });
            throw error;
        }
    },

    getStatus: (): string => {
        const {user} = useAuthStore.getState();
        return user ? "Active" : "Inactive";
    },

    setUser: (user) => set({ user, isAuthenticated: !!user }),
}));
