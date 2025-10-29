import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

function LandingPage() {
    return (
        <>
        <div className="flex min-h-svh flex-col items-center justify-center p-4">
            <div className="max-w-4xl text-center">
                <h1 className="text-4xl font-bold mb-6">
                    cyberspace.social
                </h1>
                <p className="text-xl mb-8 text-gray-600">
                    social media how it should be
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/login">
                        <Button>Log In</Button>
                    </Link>
                    <Link to="/register">
                        <Button variant="outline">Create Account</Button>
                    </Link>
                </div>
            </div>
        </div>
        </>
    );
}

export default LandingPage;