import { useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/features/user/userSlice";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

// Import Lucide icons
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  Plus,
  LayoutDashboard,
  DollarSign,
  Users,
  Calendar,
  Settings,
  TrendingUp,
  Activity,
  Sparkles,
  BarChart3,
  Clock,
  Target,
  Zap,
  Briefcase,
  Mail,
  Phone,
  FileText,
} from "lucide-react";

const Dashboard = () => {
  const user = useSelector(selectUser);

  // First-time user checklist state
  const [checklist, setChecklist] = useState({
    accountCreated: true,
    pipelineSetup: false,
    contactAdded: false,
    dealCreated: false,
  });

  return (
    <>
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent flex items-center gap-2">
            <LayoutDashboard className="h-7 w-7 text-primary" />
            Welcome to DealSensei
          </h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-1">
            <Clock size={16} />
            <span>Let's get started with setting up your CRM</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="shadow-sm flex gap-2 items-center"
          >
            <FileText className="text-primary" size={16} />
            <span className="text-foreground">View Guide</span>
          </Button>
          <Button size="sm" className="shadow-sm flex gap-2 items-center">
            <Plus size={16} />
            <span>New Deal</span>
          </Button>
        </div>
      </header>

      {/* First-time user checklist */}
      <Card className="mb-6 hover  border-border/60" gradient={false}>
        <CardHeader className="pb-3 border-b border-border/30">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 hover:cursor-pointer">
              <Target size={20} className="text-primary" />
              <span>Getting Started Checklist</span>
            </CardTitle>
            <Badge
              variant="outline"
              className="bg-primary/5 text-primary border-primary/20"
            >
              1/4 Complete
            </Badge>
          </div>
          <CardDescription>
            Complete these steps to set up your CRM
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {/* Account Created */}
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-2 rounded-full text-primary">
              <CheckCircle2 size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Account Created</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your account has been created successfully
              </p>
            </div>
          </div>

          {/* Pipeline Setup */}
          <div className="flex items-start gap-4">
            <div
              className={`p-2 rounded-full ${
                checklist.pipelineSetup
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {checklist.pipelineSetup ? (
                <CheckCircle2 size={20} />
              ) : (
                <Circle size={20} />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Set Up Pipeline</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Create your first sales pipeline
              </p>
              {!checklist.pipelineSetup && (
                <Link to="/pipelines/new">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 group text-primary hover:text-primary/80"
                  >
                    Set up now
                    <ArrowRight
                      size={16}
                      className="ml-2 group-hover:translate-x-1 transition-transform"
                    />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Add Contact */}
          <div className="flex items-start gap-4">
            <div
              className={`p-2 rounded-full ${
                checklist.contactAdded
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {checklist.contactAdded ? (
                <CheckCircle2 size={20} />
              ) : (
                <Circle size={20} />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Add First Contact</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add your first contact to the CRM
              </p>
              {!checklist.contactAdded && (
                <Link to="/contacts/new">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 group text-primary hover:text-primary/80"
                  >
                    Add now
                    <ArrowRight
                      size={16}
                      className="ml-2 group-hover:translate-x-1 transition-transform"
                    />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Create Deal */}
          <div className="flex items-start gap-4">
            <div
              className={`p-2 rounded-full ${
                checklist.dealCreated
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {checklist.dealCreated ? (
                <CheckCircle2 size={20} />
              ) : (
                <Circle size={20} />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Create First Deal</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Create your first deal in the pipeline
              </p>
              {!checklist.dealCreated && (
                <Link to="/deals/new">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 group text-primary hover:text-primary/80"
                  >
                    Create now
                    <ArrowRight
                      size={16}
                      className="ml-2 group-hover:translate-x-1 transition-transform"
                    />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard content placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Deals Summary Card */}
        <Card className="shadow-md hover:shadow-lg transition-shadow border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign size={18} className="text-primary" />
              <span>Deals Summary</span>
            </CardTitle>
            <CardDescription>Your sales pipeline at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-8 bg-blue-400 rounded-sm"></div>
                  <span className="text-sm font-medium">Qualified</span>
                </div>
                <span className="text-sm font-semibold">3</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-8 bg-amber-400 rounded-sm"></div>
                  <span className="text-sm font-medium">Negotiation</span>
                </div>
                <span className="text-sm font-semibold">2</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-1 text-primary"
            >
              <BarChart3 size={16} />
              <span>View All Deals</span>
            </Button>
          </CardFooter>
        </Card>

        {/* Recent Activities Card */}
        <Card className="shadow-md hover:shadow-lg transition-shadow border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity size={18} className="text-primary" />
              <span>Recent Activities</span>
            </CardTitle>
            <CardDescription>Latest interactions with contacts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex gap-3 p-2 bg-muted/50 rounded-md">
                <div className="mt-0.5">
                  <Mail size={16} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    Email sent to John Smith
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Today, 10:30 AM
                  </p>
                </div>
              </div>
              <div className="flex gap-3 p-2 bg-muted/50 rounded-md">
                <div className="mt-0.5">
                  <Phone size={16} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Call with Sarah Johnson</p>
                  <p className="text-xs text-muted-foreground">
                    Yesterday, 2:15 PM
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-1 text-primary"
            >
              <Calendar size={16} />
              <span>View All Activities</span>
            </Button>
          </CardFooter>
        </Card>

        {/* AI Insights Card */}
        <Card className="shadow-md hover:shadow-lg transition-shadow border-border/60 bg-gradient-to-br from-background to-background/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles size={18} className="text-primary" />
              <span>AI Insights</span>
            </CardTitle>
            <CardDescription>
              Intelligent recommendations for your deals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-3 border border-primary/20 rounded-md bg-primary/5 flex gap-3">
              <div className="mt-0.5">
                <Zap size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Opportunity Alert</p>
                <p className="text-xs text-muted-foreground">
                  The Acme Inc. deal has been in the same stage for 14 days.
                  Consider following up.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-1 text-primary"
            >
              <TrendingUp size={16} />
              <span>View All Insights</span>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

// Sidebar items
const sidebarItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Deals",
    path: "/deals",
    icon: DollarSign,
  },
  {
    name: "Contacts",
    path: "/contacts",
    icon: Users,
  },
  {
    name: "Activities",
    path: "/activities",
    icon: Calendar,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

export default Dashboard;
