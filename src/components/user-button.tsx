"use client";
import { useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "./ui/toast";

export const UserButton: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);
  const handleLogout = async () => {
    const response = await axios.post("/api/v1/auth/logout", {
      credentials: "include",
    });
    if (response.status === 200) {
      router.push("/");
          toast({
            variant: "success",
            title: "Goodbye, you are logged out!",
            description: "Login again to use this app.",
            action: <ToastAction altText="success button">Cancel</ToastAction>,
          });
    }
  }
    return (
      <div className="relative">
        <Avatar
          className="border-2 hover:text-primary cursor-pointer"
          onClick={toggleDropdown}
        >
          <AvatarFallback>YF</AvatarFallback>
        </Avatar>
        {dropdownOpen && (
          <div className="absolute  mt-2 bg-white border rounded shadow-md">
            <button
              onClick={handleLogout}
              className="w-full text-left dark:text-white dark:bg-slate-600 px-4 py-2 hover:bg-gray-200"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    );
  };
