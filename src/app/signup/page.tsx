import { Suspense } from "react";
import { UserSignupForm } from "@/components/UserSignupForm";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm">Loading...</div>}>
      <UserSignupForm />
    </Suspense>
  );
}
