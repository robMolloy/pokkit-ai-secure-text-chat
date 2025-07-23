import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pb } from "@/config/pocketbaseConfig";
import { useState } from "react";

interface AuthSignupProps {
  onSignUp: (success: boolean, message: string) => void;
}

export function AuthSignup({ onSignUp }: AuthSignupProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("signup-email") as string;
    const password = formData.get("signup-password") as string;
    const confirmPassword = formData.get("confirm-password") as string;

    if (password !== confirmPassword) {
      onSignUp(false, "Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      await pb.collection("users").create({
        name,
        email,
        status: "pending",
        emailVisibility: true,
        password,
        passwordConfirm: password,
      });

      // After creating the user, log them in
      await pb.collection("users").authWithPassword(email, password);
      onSignUp(true, "Account created successfully!");
    } catch (e: unknown) {
      const error = e as { message: string };
      console.error("Sign up error:", error);
      onSignUp(false, error.message ?? "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" name="name" type="text" placeholder="Enter your full name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          name="signup-email"
          type="email"
          placeholder="Enter your email"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          name="signup-password"
          type="password"
          placeholder="Create a password"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input
          id="confirm-password"
          name="confirm-password"
          type="password"
          placeholder="Confirm your password"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Sign Up"}
      </Button>
    </form>
  );
}
