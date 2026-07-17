import Link from "next/link";
import { AuthSplitShell } from "../_components/AuthSplitShell";
import { SignUpForm } from "./_components/SignUpForm";

export const metadata = { title: "Create account — CareTech" };

export default function SignUpPage() {
  return (
    <AuthSplitShell
      variant="signup"
      title="Create your CareTech account"
      subtitle="Start coordinating patient care in minutes."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/signin" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthSplitShell>
  );
}