"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const publicRoutes = [
  "/signin",
  "/signup",
  "/forget-password",
  "/otp-verify",
  "/reset-password",
  "/verify-email",
];

const AuthWrapper = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token && !publicRoutes.includes(pathname)) {
      if (typeof window !== "undefined") {
        if (
          pathname.startsWith("/post/") ||
          pathname.startsWith("/watch-videos/")
        ) {
          localStorage.setItem("redirectAfterLogin", pathname);
        }
      }
      router.replace("/signin");
    } else if (token && publicRoutes.includes(pathname)) {
      router.replace("/");
    }
  }, [router, pathname]);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token && !publicRoutes.includes(pathname)) return null;
  if (token && publicRoutes.includes(pathname)) return null;
  return children;
};

export default AuthWrapper;
