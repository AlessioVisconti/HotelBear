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

  //Non loggato
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  //Loggato ma ruolo non valido
  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
