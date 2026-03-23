"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, UserRole } from "@/lib/authContext";

const roles: { value: UserRole; label: string }[] = [
  { value: "ADMIN", label: "Administrator" },
  { value: "MANAGER", label: "Plant Manager" },
  { value: "OT_SPECIALIST", label: "OT Specialist" },
  { value: "TECHNICIAN", label: "Technician" },
  { value: "STORE_MANAGER", label: "Store Manager" },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("ADMIN");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    if (password.length < 3) {
      setError("Password must be at least 3 characters");
      return;
    }

    setError("");
    login(username, selectedRole);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0f172a" }}>
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-[#f1f5f9]">Precognito</h1>
          </Link>
          <p className="text-[#94a3b8] mt-2">Sign in to your account</p>
        </div>

        <div className="border border-[#334155] rounded-lg p-6" style={{ backgroundColor: "#1e293b" }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-[#ef4444]/20 border border-[#ef4444]/30 text-[#ef4444] text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm text-[#94a3b8] mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
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
                placeholder="Enter your password"
                className="w-full px-3 py-2 rounded-lg border border-[#334155] text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#3b82f6]"
                style={{ backgroundColor: "#0f172a" }}
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm text-[#94a3b8] mb-1">
                Select Role (Demo)
              </label>
              <select
                id="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 rounded-lg border border-[#334155] text-[#f1f5f9] focus:outline-none focus:border-[#3b82f6]"
                style={{ backgroundColor: "#0f172a" }}
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-[#64748b] mt-1">
                This is a demo. Any credentials will work.
              </p>
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#334155] text-[#3b82f6] focus:ring-[#3b82f6]"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-[#94a3b8]">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors font-medium"
            >
              Sign In
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
