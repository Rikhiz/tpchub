import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, remove } from "firebase/database";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDA6T_1HB321Mhlb9u196VFh81-BzQD7tk",
  authDomain: "tpcdb-3b71a.firebaseapp.com",
  databaseURL:
    "https://tpcdb-3b71a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tpcdb-3b71a",
  storageBucket: "tpcdb-3b71a.firebasestorage.app",
  messagingSenderId: "767051378134",
  appId: "1:767051378134:web:4ad764d0a95f0f8b37c877",
  measurementId: "G-R562LNDKG0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const Dashboard = ({ user, users = [], tournaments = [] }) => {
  // OAuth states
  const [isConnected, setIsConnected] = useState(false);
  const [startggUser, setStartggUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCallback, setShowCallback] = useState(false);

  // OAuth configuration
  const CLIENT_ID = "261";
  const CLIENT_SECRET =
    "ce38071f34083fc6d0b504e491b52f5706b90ba88f8b795f1574cbf50276f26d";
  const REDIRECT_URI = "https://tekkenpku.com/admin"; // Fixed redirect URI
  const SCOPES =
    "user.identity user.email tournament.manager tournament.reporter";
  const BASE_URL = "https://api.start.gg";

  useEffect(() => {
    if (user) {
      checkOAuthConnection();
      handleOAuthCallback();
    }
  }, [user]);

  // Check if user has OAuth tokens
  const checkOAuthConnection = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const userTokenRef = ref(database, `oauth_tokens/${user.uid}`);
      const snapshot = await get(userTokenRef);

      if (snapshot.exists()) {
        const tokenData = snapshot.val();
        const accessToken = await getValidAccessToken(tokenData);
        if (accessToken) {
          const userData = await getCurrentUser(accessToken);
          setStartggUser(userData);
          setIsConnected(true);
        }
      }
    } catch (error) {
      console.error("Error checking OAuth connection:", error);
      setError("Failed to check connection status");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OAuth callback
  const handleOAuthCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const error = urlParams.get("error");

    if (error) {
      setError(`OAuth error: ${error}`);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (code && user) {
      setShowCallback(true);
      try {
        setIsLoading(true);
        setError(null);

        // Exchange code for tokens
        const tokenData = await exchangeCodeForToken(code);

        // Save tokens to Firebase
        await saveTokensToFirebase(user.uid, tokenData);

        // Get user data
        const userData = await getCurrentUser(tokenData.access_token);
        setStartggUser(userData);
        setIsConnected(true);

        // Clean URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        setTimeout(() => {
          setShowCallback(false);
        }, 2000);
      } catch (error) {
        console.error("Error handling OAuth callback:", error);
        setError("Failed to complete OAuth process");
        setShowCallback(false);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Exchange authorization code for access token
  const exchangeCodeForToken = async (code) => {
    const response = await fetch(`https://api.start.gg/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Token exchange error:", errorText);
      throw new Error(
        `OAuth token exchange failed: ${response.statusText} - ${errorText}`
      );
    }

    return await response.json();
  };

  // Refresh access token
  const refreshAccessToken = async (refreshToken) => {
    const response = await fetch(`https://api.start.gg/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: REDIRECT_URI,
        
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Token refresh error:", errorText);
      throw new Error(
        `Token refresh failed: ${response.statusText} - ${errorText}`
      );
    }

    return await response.json();
  };

  // Save tokens to Firebase
  const saveTokensToFirebase = async (userId, tokenData) => {
    const userTokenRef = ref(database, `oauth_tokens/${userId}`);
    const tokenInfo = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
      created_at: Date.now(),
      expires_at: Date.now() + tokenData.expires_in * 1000,
    };

    await set(userTokenRef, tokenInfo);
    return tokenInfo;
  };

  // Get valid access token (refresh if needed)
  const getValidAccessToken = async (tokenData) => {
    const now = Date.now();
    const expiresAt = tokenData.expires_at;

    // If token expires within 5 minutes, refresh it
    if (now >= expiresAt - 300000) {
      try {
        const newTokenData = await refreshAccessToken(tokenData.refresh_token);
        await saveTokensToFirebase(user.uid, newTokenData);
        return newTokenData.access_token;
      } catch (error) {
        console.error("Failed to refresh token:", error);
        return null;
      }
    }

    return tokenData.access_token;
  };

  // Fetch user data from start.gg API
  const getCurrentUser = async (accessToken) => {
    const query = `
      query CurrentUser {
        currentUser {
          id
          slug
          bio
          name
          email
          images {
            url
            type
          }
          authorizations {
            id
            type
          }
        }
      }
    `;

    const response = await fetch(`${BASE_URL}/gql/alpha`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data?.currentUser;
  };

  // Connect to start.gg
  const connectToStartgg = () => {
    if (!user) {
      setError("User must be logged in to connect to start.gg");
      return;
    }

    const params = new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID,
      scope: SCOPES,
      redirect_uri: REDIRECT_URI,
    });

    window.location.href = `${BASE_URL}/oauth/authorize?${params.toString()}`;
  };

  // Disconnect from start.gg
  const disconnectFromStartgg = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const userTokenRef = ref(database, `oauth_tokens/${user.uid}`);
      await remove(userTokenRef);

      setIsConnected(false);
      setStartggUser(null);
      setError(null);
    } catch (error) {
      console.error("Error disconnecting from start.gg:", error);
      setError("Failed to disconnect");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate stats
  const adminCount = users.filter((u) => u.u_role === "admin").length;
  const playerCount = users.filter((u) => u.u_role === "player").length;

  // OAuth Callback Modal
  if (showCallback) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center">
        <div className="bg-gray-900 border-2 border-blue-500 rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <h2 className="text-white text-xl font-semibold mb-2">
                  Connecting to start.gg...
                </h2>
                <p className="text-gray-300">
                  Please wait while we complete the connection.
                </p>
              </>
            ) : isConnected ? (
              <>
                <div className="text-green-500 text-4xl mb-4">✓</div>
                <h2 className="text-white text-xl font-semibold mb-2">
                  Successfully Connected!
                </h2>
                <p className="text-gray-300">Welcome, {startggUser?.name}!</p>
              </>
            ) : (
              <>
                <div className="text-red-500 text-4xl mb-4">✗</div>
                <h2 className="text-white text-xl font-semibold mb-2">
                  Connection Failed
                </h2>
                <p className="text-gray-300">{error}</p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-white text-3xl font-bold mb-6">
        Welcome, {user?.displayName}!
      </h1>

      {/* OAuth Connection Status */}
      <div className="bg-gray-900 border-2 border-blue-500 rounded-lg p-6 mb-6">
        <h3 className="text-white text-lg font-semibold mb-4">
          start.gg Integration
        </h3>

        {error && (
          <div className="bg-red-900 border border-red-500 text-red-200 px-4 py-2 rounded mb-4">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-300 hover:text-red-100 ml-2"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            <span className="text-blue-400">Loading...</span>
          </div>
        ) : isConnected && startggUser ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-green-400 font-medium">
                Connected to start.gg
              </span>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-start space-x-4">
                {startggUser.images && startggUser.images[0] && (
                  <img
                    src={startggUser.images[0].url}
                    alt="Profile"
                    className="w-16 h-16 rounded-full border-2 border-blue-500"
                  />
                )}
                <div className="text-white space-y-1">
                  <p>
                    <strong>Name:</strong> {startggUser.name}
                  </p>
                  <p>
                    <strong>Slug:</strong> @{startggUser.slug}
                  </p>
                  {startggUser.email && (
                    <p>
                      <strong>Email:</strong> {startggUser.email}
                    </p>
                  )}
                  {startggUser.bio && (
                    <p>
                      <strong>Bio:</strong> {startggUser.bio}
                    </p>
                  )}
                  <p>
                    <strong>User ID:</strong> {startggUser.id}
                  </p>
                  {startggUser.authorizations &&
                    startggUser.authorizations.length > 0 && (
                      <p>
                        <strong>Authorizations:</strong>{" "}
                        {startggUser.authorizations.length} permissions
                      </p>
                    )}
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={disconnectFromStartgg}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-4 py-2 rounded transition-colors"
              >
                Disconnect
              </button>
              <button
                onClick={checkOAuthConnection}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded transition-colors"
              >
                Refresh Data
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-red-400 font-medium">
                Not connected to start.gg
              </span>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Debug Info:</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>
                  • <strong>Client ID:</strong> {CLIENT_ID}
                </li>
                <li>
                  • <strong>Redirect URI:</strong> {REDIRECT_URI}
                </li>
                <li>
                  • <strong>Current URL:</strong> {window.location.href}
                </li>
              </ul>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">
                Available Permissions:
              </h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>
                  • <strong>user.identity:</strong> Access to basic user
                  information
                </li>
                <li>
                  • <strong>user.email:</strong> Access to user email address
                </li>
                <li>
                  • <strong>tournament.manager:</strong> Tournament seeding and
                  bracket setup
                </li>
                <li>
                  • <strong>tournament.reporter:</strong> Tournament reporting
                  access
                </li>
              </ul>
            </div>

            <button
              onClick={connectToStartgg}
              disabled={isLoading || !user}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-3 rounded transition-colors font-medium"
            >
              Connect to start.gg
            </button>
          </div>
        )}
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900 border-2 border-red-500 rounded-lg p-6">
          <h3 className="text-white text-lg font-semibold">Total Users</h3>
          <p className="text-red-500 text-3xl font-bold">{users.length}</p>
        </div>
        <div className="bg-gray-900 border-2 border-red-500 rounded-lg p-6">
          <h3 className="text-white text-lg font-semibold">Admins</h3>
          <p className="text-red-500 text-3xl font-bold">{adminCount}</p>
        </div>
        <div className="bg-gray-900 border-2 border-red-500 rounded-lg p-6">
          <h3 className="text-white text-lg font-semibold">Players</h3>
          <p className="text-red-500 text-3xl font-bold">{playerCount}</p>
        </div>
        <div className="bg-gray-900 border-2 border-red-500 rounded-lg p-6">
          <h3 className="text-white text-lg font-semibold">
            Total Tournaments
          </h3>
          <p className="text-red-500 text-3xl font-bold">
            {tournaments.length}
          </p>
        </div>
      </div>

      {/* Additional start.gg Integration Features */}
      {isConnected && startggUser && (
        <div className="bg-gray-900 border-2 border-green-500 rounded-lg p-6">
          <h3 className="text-white text-lg font-semibold mb-4">
            start.gg Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded transition-colors">
              Manage Tournaments
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded transition-colors">
              View My Events
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded transition-colors">
              Tournament Reporting
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
