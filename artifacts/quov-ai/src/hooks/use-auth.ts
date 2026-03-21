import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey, type Profile } from "@workspace/api-client-react";

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Login failed" }));
        throw new Error(body.error || "Login failed");
      }
      return res.json() as Promise<Profile>;
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(getGetMeQueryKey(), profile);
    },
  });
}

export function useSignup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { email: string; password: string; referralCode?: string }) => {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Signup failed" }));
        throw new Error(body.error || "Signup failed");
      }
      return res.json() as Promise<Profile>;
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(getGetMeQueryKey(), profile);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.href = "/login";
    },
  });
}
