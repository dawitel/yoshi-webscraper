import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ToastAction } from "@radix-ui/react-toast";
import { LogIn, Eye, EyeOff } from "lucide-react";

interface LoginProps {
  onChange: (email: string, password: string) => void;
  btnText: string;
  isLoading: boolean;
}

const Login: React.FC<LoginProps> = ({ onChange, btnText, isLoading }) => {
  const { toast } = useToast();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false); // State to toggle password visibility

  // Validation error states
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleUploadClick = () => {
    let isValid = true;

    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email");
      isValid = false;
    } else {
      setEmailError(null);
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else {
      setPasswordError(null);
    }

    if (isValid && email && password) {
      onChange(email, password);
    } else {
      toast({
        variant: "destructive",
        title: "Please complete all fields!",
        description: "You need to fill all fields correctly",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }
  };

  function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  return (
    <div className="bg-blue-100 dark:bg-gray-600 rounded-xl">
      <div className="flex p-6 flex-col items-center justify-center gap-4">
        <div className="w-full">
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white py-2 px-10 h-9.5 text-slate-900 dark:placeholder:text-black placeholder:text-x"
            placeholder="Enter your email"
          />
          {emailError && (
            <p className="text-red-500 text-xs flex ml-1 mt-1">{emailError}</p>
          )}
        </div>

        <div className="w-full relative">
          <Input
            type={showPassword ? "text" : "password"} // Toggle between password and text
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white py-2 px-10 h-9.5 text-slate-900 placeholder:text-sm dark:placeholder:text-black"
            placeholder="Enter your password"
          />
          <button
            type="button"
            className="absolute right-3 top-2.5"
            onClick={() => setShowPassword(!showPassword)} // Toggle visibility
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5 dark:text-black" />
            ) : (
              <Eye className="w-5 h-5 dark:text-black" />
            )}
          </button>
          {passwordError && (
            <p className="text-red-500 text-xs flex ml-1 mt-1">
              {passwordError}
            </p>
          )}
        </div>

        <Button
          onClick={handleUploadClick}
          className="bg-blue-500 dark:bg-blue-800 hover:bg-blue-600 w-full text-white px-4 py-2 rounded"
          disabled={isLoading}
        >
          <div className="flex gap-x-4 items-center justify-center">
            <LogIn className="w-5 h-5" />
            <p>{btnText}</p>
          </div>
        </Button>
      </div>
    </div>
  );
};

export default Login;
