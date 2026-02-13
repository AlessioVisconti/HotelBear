import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import type { RootState } from "../redux/store";
import type { JSX } from "react";

interface Props {
  children: JSX.Element;
  allowedRoles?: string[];
}

const PrivateRoute = ({ children, allowedRoles }: Props) => {
  const { token, role } = useSelector((state: RootState) => state.auth);

  //Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  //Logged in but role invalid
  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
