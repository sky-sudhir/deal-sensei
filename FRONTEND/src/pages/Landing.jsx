import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../redux/features/user/userSlice";

const Landing = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="container mx-auto py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">DealSensei</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link to="/signup">
            <Button>Start Free Trial</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto py-20 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            AI-Powered CRM for <span className="text-primary">Smarter Sales</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            DealSensei helps sales teams close more deals with AI-powered insights, 
            persona building, and objection handling.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
              <Button size="lg" className="w-full sm:w-auto">
                {isAuthenticated ? "Go to Dashboard" : "Start Free Trial"}
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex-1">
          <div className="relative h-[400px] w-full rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center">
            <div className="absolute inset-4 bg-card rounded-lg shadow-xl flex items-center justify-center">
              <p className="text-xl font-semibold text-center text-muted-foreground">
                CRM Dashboard Preview
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            AI-Powered Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-card p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-primary text-xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <span className="text-xl font-bold text-primary">DealSensei</span>
              <p className="text-muted-foreground mt-2">
                AI-powered CRM for smarter sales teams
              </p>
            </div>
            <div className="flex gap-8">
              <Link to="/signup" className="text-muted-foreground hover:text-foreground">
                Start Free Trial
              </Link>
              <Link to="/login" className="text-muted-foreground hover:text-foreground">
                Sign In
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-muted-foreground">
            <p>© {new Date().getFullYear()} DealSensei. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const features = [
  {
    icon: "🤖",
    title: "Deal Coach AI",
    description: "Get AI-powered recommendations to improve deal close probability based on historical data."
  },
  {
    icon: "👤",
    title: "Persona Builder",
    description: "Generate customer behavioral profiles from interaction history to personalize your approach."
  },
  {
    icon: "💬",
    title: "Objection Handler",
    description: "Get real-time suggestions for handling customer objections during sales conversations."
  },
  {
    icon: "📊",
    title: "Win-Loss Analysis",
    description: "Understand why deals were won or lost with AI analysis of multiple factors."
  }
];

export default Landing;
