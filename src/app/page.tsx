/**
 * @file page.tsx
 * @description The root page of the application. Acting as an authentication-first gateway,
 * it checks the user session server-side and redirects to either the Dashboard or Sign-In page.
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default function HomePage() {
  const { userId } = auth();

  if (userId) {
    redirect("/dashboard");
  } else {
    redirect("/sign-in");
  }

  return null;
}
