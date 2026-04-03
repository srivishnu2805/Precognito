"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, authClient } from "@/lib/auth-client";

const roles = [
  { value: "ADMIN", label: "Administrator" },
  { value: "MANAGER", label: "Plant Manager" },
  { value: "OT_SPECIALIST", label: "OT Specialist" },
  { value: "TECHNICIAN", label: "Technician" },
  { value: "STORE_MANAGER", label: "Store Manager" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("ADMIN");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError("");

    // Try to login first
    const { data, error: signInError } = await signIn.email({
      email,
      password,
    });

    if (signInError) {
      // If login fails (user doesn't exist), try signing up (since this is a demo)
      const { data: signUpData, error: signUpError } = await authClient.signUp.email({
        email,
        password,
        name: email.split("@")[0],
        // @ts-ignore - custom field
        role: selectedRole,
      });

      if (signUpError) {
        setError(signUpError.message || "Authentication failed");
        setLoading(false);
      } else {
        router.push("/dashboard");
      }
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0f172a" }}>
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-[#f1f5f9]">Precognito</h1>
          </Link>
          <p className="text-[#94a3b8] mt-2">Sign in or create account</p>
        </div>

        <div className="border border-[#334155] rounded-lg p-6" style={{ backgroundColor: "#1e293b" }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-[#ef4444]/20 border border-[#ef4444]/30 text-[#ef4444] text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm text-[#94a3b8] mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 py-2 rounded-lg border border-[#334155] text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#3b82f6]"
                style={{ backgroundColor: "#0f172a" }}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-[#94a3b8] mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password (min 8 chars)"
                className="w-full px-3 py-2 rounded-lg border border-[#334155] text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#3b82f6]"
                style={{ backgroundColor: "#0f172a" }}
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm text-[#94a3b8] mb-1">
                Select Role (for auto-registration)
              </label>
              <select
                id="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#334155] text-[#f1f5f9] focus:outline-none focus:border-[#3b82f6]"
                style={{ backgroundColor: "#0f172a" }}
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors font-medium disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign In / Register"}
            </button>
          </form>
        </div>

        <p className="text-center text-[#64748b] text-sm mt-6">
          <Link href="/" className="text-[#3b82f6] hover:underline">
            ← Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
}
