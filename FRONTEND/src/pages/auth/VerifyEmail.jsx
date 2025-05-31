import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Button } from "../../components/ui/button";
import useMutation from "@/hooks/useMutation";
import { USERS_VERIFY_EMAIL } from "@/imports/api";

const VerifyEmail = () => {
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationError, setVerificationError] = useState(null);
  const { mutate, loading } = useMutation();

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setVerificationError(
          "Invalid verification link. Please request a new one."
        );
        return;
      }

      try {
        const resultAction = await mutate({
          url: `${USERS_VERIFY_EMAIL}/${token}`,
          method: "GET",
        });
        console.log(resultAction, "qqqqqqqqqqqq");

        if (resultAction?.success) {
          setEmailVerified(true);
        }
      } catch (error) {
        setVerificationError("An unexpected error occurred. Please try again.");
      }
    };

    verify();
  }, [dispatch, token]);

  const handleContinue = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="container mx-auto py-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">DealSensei</span>
        </Link>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-xl shadow-sm text-center">
          {loading ? (
            <div className="space-y-4">
              <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
              <h1 className="text-2xl font-bold">Verifying Your Email</h1>
              <p className="text-muted-foreground">
                Please wait while we verify your email address...
              </p>
            </div>
          ) : emailVerified ? (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8 text-primary"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <h1 className="text-2xl font-bold">
                Email Verified Successfully!
              </h1>

              <p className="text-muted-foreground">
                Your email has been verified. You can now sign in to your
                account.
              </p>

              <Button className="w-full" onClick={handleContinue}>
                Continue to Sign In
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8 text-destructive"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
              </div>

              <h1 className="text-2xl font-bold">Verification Failed</h1>

              <p className="text-muted-foreground">
                {verificationError ||
                  "There was an issue verifying your email. Please try again."}
              </p>

              <div className="space-y-4">
                <Link to="/verify-email-sent">
                  <Button variant="outline" className="w-full">
                    Request New Verification Link
                  </Button>
                </Link>

                <Link to="/login">
                  <Button variant="ghost" className="w-full">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
