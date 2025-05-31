import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state) => state.user);

  console.log(user, isAuthenticated, "qqqqqqqq");
  if (!isAuthenticated || !user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
