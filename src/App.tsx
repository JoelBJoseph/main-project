import React, { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from "@react-oauth/google";
import CodeEditor from "@/components/code-editor.tsx"; // Update the path based on your structure
import FileDirectory from "./components/file-directory";

const App: React.FC = () => {
    const [user, setUser] = useState<any>(null); // Store user info
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    const handleLoginSuccess = (credentialResponse: any) => {
        const decoded = JSON.parse(atob(credentialResponse.credential.split(".")[1]));
        setUser(decoded);
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        googleLogout();
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <GoogleOAuthProvider clientId="567486587529-l6hcg54t7jkdi4rj8ulk0ngv36gtud8l.apps.googleusercontent.com">
            {isAuthenticated ? (
                <div className="flex h-screen bg-neutral-900">
                    <FileDirectory files={[]} />
                    <div className="flex-1">
                        <CodeEditor isAuthenticated={isAuthenticated} handleLogout={handleLogout} />
                    </div>
                </div>
            ) : (
                <div className="h-screen flex flex-col items-center justify-center bg-neutral-900 text-white">
                    <h1 className="text-3xl font-semibold text-center mb-4">
                        Welcome to <span className="text-red-500">Salvage</span> Text Editor
                    </h1>
                    <p className="text-lg text-center mb-6">
                        A sophisticated platform for efficient code writing, editing, and transpiling.
                    </p>
                    <p className="text-center text-sm mb-4">
                        Please log in to continue and explore the power of Salvage.
                    </p>
                    <GoogleLogin
                        onSuccess={handleLoginSuccess}
                        onError={() => console.log("Login Failed")}
                        useOneTap
                        className="text-white py-3 px-8 rounded-lg border-2 border-white hover:bg-white hover:text-black transition"
                    />
                </div>
            )}
        </GoogleOAuthProvider>
    );
};

export default App;
