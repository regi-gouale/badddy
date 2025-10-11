"use client";

import { IconBrandGoogleFilled } from "@tabler/icons-react";
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
    } else {
      // Handle sign up with Google
      console.log("Sign up with Google");
    }
  }
  return (
    <Button variant="outline" type="button" onClick={handleClick}>
      <IconBrandGoogleFilled className="size-4" />
      {label} avec Google
    </Button>
  );
}
