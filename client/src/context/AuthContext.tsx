import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthToken, setAuthToken } from "../api/client";
import type { AuthUser } from "../types";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const tokenStorageKey = "jobBoardToken";
const userStorageKey = "jobBoardUser";
const legacyAuthStorageKeys = [
  "token",
  "user",
  "authToken",
  "authUser",
  "session",
  "jobBoardSession",
];
const inactivityLimitMs = 30 * 60 * 1000;
const activityEvents = ["mousemove", "keydown", "click", "scroll"];

type JwtPayload = {
  exp?: number;
};

type AuthProviderProps = {
  children: ReactNode;
};

function getStoredAuth() {
  const savedToken = localStorage.getItem(tokenStorageKey);
  const savedUser = localStorage.getItem(userStorageKey);

  if (!savedToken || !savedUser) {
    return {
      token: null,
      user: null,
    };
  }

  if (isTokenExpired(savedToken)) {
    removeStoredAuth();
    return {
      token: null,
      user: null,
    };
  }

  try {
    return {
      token: savedToken,
      user: JSON.parse(savedUser) as AuthUser,
    };
  } catch (error) {
    removeStoredAuth();
    return {
      token: null,
      user: null,
    };
  }
}

function removeStoredAuth() {
  const keysToRemove = new Set([
    tokenStorageKey,
    userStorageKey,
    ...legacyAuthStorageKeys,
  ]);

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);

    if (!key) {
      continue;
    }

    const normalizedKey = key.toLowerCase();

    if (
      key.startsWith("jobBoard") ||
      normalizedKey.includes("auth") ||
      normalizedKey.includes("session") ||
      normalizedKey.includes("token")
    ) {
      keysToRemove.add(key);
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key));
  clearAuthToken();
}

function decodeJwtPayload(token: string) {
  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = window.atob(base64);

    return JSON.parse(decodedPayload) as JwtPayload;
  } catch (error) {
    return null;
  }
}

function isTokenExpired(token: string) {
  const payload = decodeJwtPayload(token);

  if (!payload?.exp) {
    return true;
  }

  return payload.exp * 1000 <= Date.now();
}

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate();
  const [storedAuth] = useState(getStoredAuth);
  const [token, setToken] = useState<string | null>(storedAuth.token);
  const [user, setUser] = useState<AuthUser | null>(storedAuth.user);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearInactivityTimer() {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = null;
    }
  }

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      return;
    }

    clearAuthToken();
  }, [token]);

  useEffect(() => {
    if (token && isTokenExpired(token)) {
      removeStoredAuth();
      clearInactivityTimer();
      setToken(null);
      setUser(null);
      navigate("/login");
    }
  }, [navigate, token]);

  useEffect(() => {
    function logoutForInactivity() {
      removeStoredAuth();
      clearInactivityTimer();
      setToken(null);
      setUser(null);
      navigate("/login", {
        state: {
          message: "You were logged out due to inactivity. Please login again.",
        },
      });
    }

    function resetInactivityTimer() {
      clearInactivityTimer();
      inactivityTimer.current = setTimeout(
        logoutForInactivity,
        inactivityLimitMs
      );
    }

    if (!token || !user) {
      clearInactivityTimer();
      return clearInactivityTimer;
    }

    resetInactivityTimer();
    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetInactivityTimer);
    });

    return () => {
      clearInactivityTimer();
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetInactivityTimer);
      });
    };
  }, [navigate, token, user]);

  function login(newToken: string, newUser: AuthUser) {
    removeStoredAuth();
    localStorage.setItem(tokenStorageKey, newToken);
    localStorage.setItem(userStorageKey, JSON.stringify(newUser));
    setAuthToken(newToken);
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    removeStoredAuth();
    clearInactivityTimer();
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
