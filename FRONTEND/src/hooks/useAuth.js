import { useDispatch } from 'react-redux';
import { 
  loginUser, 
  signupCompany, 
  verifyEmail, 
  resendVerificationEmail, 
  logout 
} from '../redux/features/user/userSlice';

/**
 * Custom hook for authentication operations
 * Uses the existing Redux thunks from userSlice
 */
export const useAuth = () => {
  const dispatch = useDispatch();

  /**
   * Login a user
   * @param {Object} credentials - User credentials (email, password)
   * @returns {Promise} - Promise with the action result
   */
  const login = async (credentials) => {
    return dispatch(loginUser(credentials));
  };

  /**
   * Sign up a new company and admin user
   * @param {Object} signupData - Company and admin user data
   * @returns {Promise} - Promise with the action result
   */
  const signup = async (signupData) => {
    return dispatch(signupCompany(signupData));
  };

  /**
   * Verify user email with token
   * @param {string} token - Email verification token
   * @returns {Promise} - Promise with the action result
   */
  const verify = async (token) => {
    return dispatch(verifyEmail(token));
  };

  /**
   * Resend verification email
   * @param {string} email - User email
   * @returns {Promise} - Promise with the action result
   */
  const resendVerification = async (email) => {
    return dispatch(resendVerificationEmail(email));
  };

  /**
   * Logout the current user
   * @returns {void}
   */
  const logoutUser = () => {
    dispatch(logout());
  };

  return {
    login,
    signup,
    verify,
    resendVerification,
    logout: logoutUser
  };
};
