import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../redux/features/user/userSlice";
import {
  ArrowRightIcon,
  CheckIcon,
  BarChart3Icon,
  BrainIcon,
  UsersIcon,
  ShieldIcon,
} from "lucide-react";

const Landing = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="container mx-auto py-6 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">DealSensei</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost" className="hover:text-foreground">
              Sign In
            </Button>
          </Link>
          <Link to="/signup">
            <Button>Start Free Trial</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block px-4 py-1.5 bg-primary/10 rounded-full text-primary font-medium text-sm mb-4">
            AI-Powered CRM Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Close More Deals with{" "}
            <span className="text-primary">AI-Powered Insights</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            DealSensei is a multi-tenant CRM platform that helps sales teams
            understand customers better, handle objections effectively, and
            close more deals with AI-powered tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
            <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
              <Button size="lg" className="w-full sm:w-auto group">
                {isAuthenticated ? "Go to Dashboard" : "Start Free Trial"}
                <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">AI-Powered Features</h2>
            <p className="text-muted-foreground text-lg">
              Our intelligent tools analyze your sales data to provide
              actionable insights and help you close more deals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card p-8 rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              How DealSensei Helps You Win
            </h2>
            <p className="text-muted-foreground text-lg">
              Our platform is designed to give your sales team the edge they
              need to close more deals and build stronger customer
              relationships.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex flex-col p-6">
                <div className="flex items-center mb-4">
                  <div className="mr-4 bg-primary/10 p-2 rounded-full">
                    <CheckIcon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{benefit.title}</h3>
                </div>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link to="/signup">
              <Button size="lg">Start Your Free Trial</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">
                  Built for Modern Sales Teams
                </h2>
                <p className="text-muted-foreground mb-6">
                  DealSensei is a multi-tenant CRM platform with robust data
                  isolation. Each company gets their own secure environment
                  while benefiting from our powerful AI features.
                </p>
                <ul className="space-y-4">
                  {platformFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className="mr-3 mt-1 bg-primary/10 p-1 rounded-full">
                        <CheckIcon className="h-4 w-4 text-primary" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-card rounded-xl p-8 border border-border shadow-sm">
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="mr-4 bg-primary/10 p-2 rounded-full">
                      <ShieldIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        Secure Multi-Tenant Architecture
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Complete data isolation between companies
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-4 bg-primary/10 p-2 rounded-full">
                      <UsersIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        Role-Based Access Control
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Admins and sales reps with appropriate permissions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-4 bg-primary/10 p-2 rounded-full">
                      <BrainIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">AI-Powered Insights</h3>
                      <p className="text-sm text-muted-foreground">
                        Advanced analytics and recommendations
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-4 bg-primary/10 p-2 rounded-full">
                      <BarChart3Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Customizable Pipelines</h3>
                      <p className="text-sm text-muted-foreground">
                        Adapt to your unique sales process
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <span className="text-2xl font-bold text-primary">
                DealSensei
              </span>
              <p className="text-muted-foreground mt-2">
                AI-powered CRM for smarter sales teams
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/signup"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Start Free Trial
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2">
                <li>
                  <span className="text-muted-foreground">Deal Coach AI</span>
                </li>
                <li>
                  <span className="text-muted-foreground">Persona Builder</span>
                </li>
                <li>
                  <span className="text-muted-foreground">
                    Objection Handler
                  </span>
                </li>
                <li>
                  <span className="text-muted-foreground">
                    Win-Loss Explainer
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <span className="text-muted-foreground">About Us</span>
                </li>
                <li>
                  <span className="text-muted-foreground">Contact</span>
                </li>
                <li>
                  <span className="text-muted-foreground">Privacy Policy</span>
                </li>
                <li>
                  <span className="text-muted-foreground">
                    Terms of Service
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t text-center text-muted-foreground">
            <p>© {new Date().getFullYear()} DealSensei. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const features = [
  {
    icon: <BrainIcon className="h-6 w-6 text-primary" />,
    title: "Deal Coach AI",
    description:
      "Get AI-powered recommendations to improve deal close probability based on historical data and success metrics.",
  },
  {
    icon: <UsersIcon className="h-6 w-6 text-primary" />,
    title: "Persona Builder",
    description:
      "Generate detailed customer behavioral profiles from interaction history to personalize your sales approach.",
  },
  {
    icon: <CheckIcon className="h-6 w-6 text-primary" />,
    title: "Objection Handler",
    description:
      "Get real-time AI suggestions for handling customer objections during critical sales conversations.",
  },
  {
    icon: <BarChart3Icon className="h-6 w-6 text-primary" />,
    title: "Win-Loss Explainer",
    description:
      "Understand why deals were won or lost with comprehensive AI analysis of multiple factors.",
  },
];

const benefits = [
  {
    title: "Increase Close Rates",
    description:
      "Our AI-powered insights help you understand exactly what moves deals forward, increasing your team's close rates by identifying the right actions at the right time.",
  },
  {
    title: "Personalize Customer Interactions",
    description:
      "The Persona Builder creates detailed behavioral profiles so you can tailor your approach to each prospect's unique communication style and preferences.",
  },
  {
    title: "Handle Objections Effectively",
    description:
      "Turn potential deal-breakers into opportunities with AI-suggested responses that address customer concerns in the most effective way.",
  },
  {
    title: "Learn From Every Deal",
    description:
      "The Win-Loss Explainer analyzes why deals succeed or fail, providing actionable insights to continuously improve your sales process.",
  },
  {
    title: "Streamline Your Sales Process",
    description:
      "Customizable pipelines and stages help you track deals efficiently and identify bottlenecks in your sales process.",
  },
  {
    title: "Make Data-Driven Decisions",
    description:
      "Comprehensive analytics give you visibility into your sales performance, helping you make strategic decisions based on real data.",
  },
];

const platformFeatures = [
  "Complete data isolation between companies",
  "Role-based access control for team members",
  "Customizable sales pipelines and stages",
  "Comprehensive contact and deal management",
  "Activity tracking and communication logs",
  "File storage and document management",
];

export default Landing;
