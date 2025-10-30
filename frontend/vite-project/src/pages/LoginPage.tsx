import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
        // Call your backend API
        const response = await fetch("http://127.0.0.1:8000/account/token", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            credentials: "include", // Important: include cookies
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Call login to update auth state
            await login();
            // Redirect to feed
            navigate("/feed");
        } else {
            setError(data.message || "Login failed");
        }
        } catch (err) {
        setError("Network error occurred");
        } finally {
        setLoading(false);
        }
    };

    return (
        <>
        <div className="flex min-h-svh flex-col items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Login to Your Account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Button className="w-full" type="submit" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                    </Button>
                    </form>
          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Create Account
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
        </>
    );
}

export default LoginPage;
