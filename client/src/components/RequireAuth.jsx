import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { getToken } from "../lib/auth";

export default function RequireAuth({ children }) {
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

RequireAuth.propTypes = {
  children: PropTypes.node.isRequired,
};