import { Suspense } from "react";
import { UserLoginForm } from "@/components/UserLoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm">Loading...</div>}>
      <UserLoginForm />
    </Suspense>
  );
}
