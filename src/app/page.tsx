"use client";

import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ModeToggle } from "@/components/theme-toggle";
import Login from "@/components/login";

export default function Home() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
     const formData = new FormData();
     formData.append("email", email);
     formData.append("password", password);
    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast({
          variant: "success",
          title: "Welcome, you are logged in!",
          description: "You can continue to use this app.",
          action: <ToastAction altText="success button">Cancel</ToastAction>,
        });
        router.push("/dashboard");
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: errorData.error || "Please try again.",
          action: <ToastAction altText="try again">Try again</ToastAction>,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        action: <ToastAction altText="try again">Try again</ToastAction>,
      });
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
        <div className="absolute top-0 left-0 p-10">
          <ModeToggle />
        </div>
        <h1 className="font-sans text-balance dark:bg-gray-900 mb-5 rounded-xl shadow-2xl px-4 dark:hover:shadow-2xl py-5 font-black text-3xl sm:text-5xl md:text-3xl lg:text-5xl">
          Sign-in
        </h1>
        {/* <p className="max-w-[42rem] mt-3 mb-7 leading-normal text-muted-foreground sm:text-lg font-bold sm:leading-8">
        Fill out the form to Sign in and use this app
        </p> */}
        <Login
          onChange={handleLogin}
          btnText={isLoading ? "Loading..." : "Sign-in"}
          isLoading={isLoading}
        />
      </div>
    </main>
  );
}
