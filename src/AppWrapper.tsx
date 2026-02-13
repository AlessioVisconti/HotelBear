import React, { useEffect, type ReactNode } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "./redux/store";
import { logout, setAuthFromToken } from "./redux/features/auth/authSlice";
import { getToken, getExpiration } from "./utils/token";

interface AppWrapperProps {
  children: ReactNode;
}

const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { token, expiration } = useSelector((state: RootState) => state.auth);

  // Sync Redux with cookies on startup
  useEffect(() => {
    const cookieToken = getToken();
    const cookieExp = getExpiration() || null;

    if (cookieToken && !token) {
      dispatch(
        setAuthFromToken({
          token: cookieToken,
          expiration: cookieExp,
        }),
      );
    }
  }, [dispatch, token]);

  // Automatic logout when token expires
  useEffect(() => {
    if (!token || !expiration) return;

    const now = Date.now();
    const expireTime = new Date(expiration).getTime();
    const timeout = expireTime - now;

    if (timeout <= 0) {
      dispatch(logout());
      navigate("/login", { state: { loggedOut: true } });
      return;
    }

    const timer = setTimeout(() => {
      dispatch(logout());
      navigate("/login", { state: { loggedOut: true } });
    }, timeout);

    return () => clearTimeout(timer);
  }, [token, expiration, dispatch, navigate]);

  return <>{children}</>;
};

export default AppWrapper;
