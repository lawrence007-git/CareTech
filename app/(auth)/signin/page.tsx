import Link from "next/link";
import { AuthSplitShell } from "../_components/AuthSplitShell";
import { SignInForm } from "./_components/SignInForm";

export const metadata = { title: "Sign in — CareTech" };

export default function SignInPage() {
  return (
    <AuthSplitShell
      variant="signin"
      title="Sign in to CareTech"
      subtitle="Access your patients, schedules and clinical records."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <SignInForm />
    </AuthSplitShell>
  );
}