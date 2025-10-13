"use client";

import { IconBrandGoogleFilled } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "../ui/button";

type WithGoogleButtonProps = {
  label: string;
  isLogin?: boolean;
};

export default function WithGoogleButton({
  label,
  isLogin = true,
}: WithGoogleButtonProps) {
  function handleClick() {
    if (isLogin) {
      // Handle login with Google
      console.log("Login with Google");
      toast.info("Connexion avec Google non implémentée");
    } else {
      // Handle sign up with Google
      console.log("Sign up with Google");
      toast.info("Inscription avec Google non implémentée");
    }
  }
  return (
    <Button variant="outline" type="button" onClick={handleClick}>
      <IconBrandGoogleFilled className="size-4" />
      {label} avec Google
    </Button>
  );
}
