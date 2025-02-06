import React, { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Button } from "@heroui/button"; // Import HeroUI Button

const LoginButton = () => {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  // Initialize the AuthClient and check for an existing session
  useEffect(() => {
    const initAuth = async () => {
      const client = await AuthClient.create();
      setAuthClient(client);

      const isAuthenticated = await client.isAuthenticated();
      if (isAuthenticated) {
        setLoggedIn(true);
      }
    };

    initAuth();
  }, []);

  // Handle login
  const handleAuthAction = async () => {
    if (!authClient) return;

    await authClient.login({
      maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days in nanoseconds
      onSuccess: () => setLoggedIn(true),
    });
  };

  // Handle logout
  const handleLogout = async () => {
    if (authClient) {
      await authClient.logout();
      setLoggedIn(false);
    }
  };

  return (
    <div>
      <Button 
        onClick={loggedIn ? handleLogout : handleAuthAction} 
        color={loggedIn ? 'danger' : 'success'}
        size="md"
        className="font-semibold rounded-md text-lg"
        style={{
          backgroundColor: loggedIn ? '#f87171' : '#34d399',
          color: 'white',
          border: 'none',
          transition: 'background-color 0.3s ease',
        }}
      >
        {loggedIn ? 'Logout' : authClient ? 'Login' : 'Create Identity'}
      </Button>
    </div>
  );
};

export default LoginButton;

