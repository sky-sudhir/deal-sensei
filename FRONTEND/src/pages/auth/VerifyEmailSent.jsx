import { Link, useLocation, Navigate } from "react-router-dom";

const VerifyEmailSent = () => {
  const location = useLocation();

  // Get email from location state
  const email = location.state?.email;

  // If no email is available, redirect to signup
  if (!email) {
    return <Navigate to="/signup" replace />;
  }

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
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold">Check Your Email</h1>

          <p className="text-muted-foreground">
            We've sent a verification email to <strong>{email}</strong>. Please
            check your inbox and click the verification link to activate your
            account.
          </p>

          <div className="pt-4 space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>
                Already verified?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailSent;
