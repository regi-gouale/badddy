"use client";

import { IconBrandAppleFilled } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "../ui/button";

type WithAppleButtonProps = {
  label: string;
  isLogin?: boolean;
  disabled?: boolean;
};

export function WithAppleButton({
  label,
  isLogin = true,
  disabled = false,
}: WithAppleButtonProps) {
  function handleClick() {
    if (isLogin) {
      // Handle login with Apple
      console.log("Login with Apple");
      toast.info("Connexion avec Apple non implémentée");
    } else {
      // Handle sign up with Apple
      console.log("Sign up with Apple");
      toast.info("Inscription avec Apple non implémentée");
    }
  }
  return (
    <Button
      variant="outline"
      type="button"
      onClick={handleClick}
      disabled={disabled}
    >
      <IconBrandAppleFilled className="size-4" />
      {label} avec Apple
    </Button>
  );
}
