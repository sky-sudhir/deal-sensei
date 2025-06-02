import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/features/user/userSlice";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Separator } from "../../components/ui/separator";
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
  ArrowDown,
  LineChart,
  AlertCircle,
} from "lucide-react";
import { BarChart, LineChart as TremorLineChart } from "@tremor/react";
import useQuery from "../../hooks/useQuery";
import {
  API_DEALS_LIST,
  API_CONTACTS_LIST,
  API_ACTIVITIES_LIST,
  API_FILES_LIST,
  API_PIPELINES_LIST,
  API_USERS_LIST,
} from "../../imports/api";

const Dashboard = () => {
  const [setupProgress, setSetupProgress] = useState(25); // Example progress
  const [timeframe, setTimeframe] = useState("week"); // week, month, quarter, year
  const navigate = useNavigate();

  // Fetch data for dashboard metrics
  const { data: dealsData, isLoading: isDealsLoading } =
    useQuery(API_DEALS_LIST);
  const { data: contactsData, isLoading: isContactsLoading } =
    useQuery(API_CONTACTS_LIST);
  const { data: activitiesData, isLoading: isActivitiesLoading } =
    useQuery(API_ACTIVITIES_LIST);
  const { data: filesData, isLoading: isFilesLoading } =
    useQuery(API_FILES_LIST);
  const { data: pipelinesData, isLoading: isPipelinesLoading } =
    useQuery(API_PIPELINES_LIST);
  const { data: usersData, isLoading: isUsersLoading } =
    useQuery(API_USERS_LIST);

  // Derived metrics
  const deals = useMemo(() => dealsData?.data?.data?.deals || [], [dealsData]);
  const contacts = useMemo(
    () => contactsData?.data?.data?.contacts || [],
    [contactsData]
  );
  const activities = useMemo(
    () => activitiesData?.data?.data?.activities || [],
    [activitiesData]
  );
  const files = useMemo(
    () => filesData?.data?.data?.data?.fileAttachments || [],
    [filesData]
  );
  const pipelines = useMemo(
    () => pipelinesData?.data?.data || [],
    [pipelinesData]
  );
  const users = useMemo(() => usersData?.data?.data || [], [usersData]);

  // Calculate key metrics with improved error handling
  const totalDeals = deals.length;
  const openDeals = deals.filter((deal) => deal.status === "open").length;
  const wonDeals = deals.filter((deal) => deal.status === "won").length;
  const lostDeals = deals.filter((deal) => deal.status === "lost").length;
  const closedDeals = wonDeals + lostDeals;

  // Safely calculate deal values with proper type conversion
  const totalDealValue = deals.reduce(
    (sum, deal) => sum + (Number(deal.value) || 0),
    0
  );
  const openDealValue = deals
    .filter((deal) => deal.status === "open")
    .reduce((sum, deal) => sum + (Number(deal.value) || 0), 0);
  const wonDealValue = deals
    .filter((deal) => deal.status === "won")
    .reduce((sum, deal) => sum + (Number(deal.value) || 0), 0);
  const lostDealValue = deals
    .filter((deal) => deal.status === "lost")
    .reduce((sum, deal) => sum + (Number(deal.value) || 0), 0);

  // Improved win rate calculation to avoid division by zero
  const winRate =
    closedDeals > 0 ? Math.round((wonDeals / closedDeals) * 100) : 0;

  // Team performance data
  const teamPerformance = useMemo(() => {
    if (!deals.length || !users.length) return [];

    // Get sales reps only
    const salesReps = users;
    console.log("salesReps", salesReps);

    // Calculate performance metrics for each rep
    return salesReps
      .map((rep) => {
        const repDeals = deals.filter(
          (deal) => deal.owner_id._id.toString() === rep._id.toString()
        );
        console.log("repDeals", repDeals);
        const repOpenDeals = repDeals.filter(
          (deal) => deal.status === "open"
        ).length;
        const repWonDeals = repDeals.filter(
          (deal) => deal.status === "won"
        ).length;
        const repLostDeals = repDeals.filter(
          (deal) => deal.status === "lost"
        ).length;
        const repTotalDeals = repDeals.length;

        // Improved win rate calculation to avoid division by zero
        const closedDeals = repWonDeals + repLostDeals;
        const repWinRate =
          closedDeals > 0 ? Math.round((repWonDeals / closedDeals) * 100) : 0;

        // Calculate total deal value with proper null/undefined handling
        const repDealValue = repDeals.reduce(
          (sum, deal) => sum + (Number(deal.value) || 0),
          0
        );

        return {
          name: rep.name || "Unknown",
          id: rep._id,
          openDeals: repOpenDeals,
          wonDeals: repWonDeals,
          lostDeals: repLostDeals,
          totalDeals: repTotalDeals,
          winRate: repWinRate,
          dealValue: repDealValue,
        };
      })
      .sort((a, b) => b.dealValue - a.dealValue); // Sort by deal value, highest first
  }, [deals, users]);

  // Recent activities
  const recentActivities = [...activities]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  // Upcoming activities - activities with a future date
  const upcomingActivities = activities
    .filter((activity) => new Date(activity.created_at) > new Date())
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .slice(0, 5);

  // Recent files
  const recentFiles = [...files]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  // Deal stage data for pipeline chart
  const dealStageData = useMemo(() => {
    console.log("deals", deals, pipelines);
    if (!deals.length || !pipelines.length) return [];

    // Get the default pipeline or first available
    const defaultPipeline = pipelines.find((p) => p.is_default) || pipelines[0];
    if (
      !defaultPipeline ||
      !defaultPipeline.stages ||
      !Array.isArray(defaultPipeline.stages)
    )
      return [];

    // Count deals in each stage
    const stageCounts = {};
    defaultPipeline.stages.forEach((stage) => {
      if (stage && typeof stage?.name === "string") stageCounts[stage.name] = 0;
    });

    // Handle case where no stages are defined
    if (Object.keys(stageCounts).length === 0) return [];

    // Count open deals in each stage
    deals
      .filter((deal) => deal.status === "open")
      .forEach((deal) => {
        const stageName = defaultPipeline.stages.find(
          (s) => s._id === deal.stage
        );

        // Handle deals with missing stage by assigning to first stage
        if (!deal.stage && defaultPipeline.stages.length > 0) {
          const firstStage = defaultPipeline.stages[0];
          if (typeof firstStage?.name === "string") {
            stageCounts[firstStage.name] =
              (stageCounts[firstStage.name] || 0) + 1;
          }
        } else if (deal?.stage && stageCounts[stageName?.name] !== undefined) {
          stageCounts[stageName.name] += 1;
        } else {
          // Handle deals with invalid stage by assigning to "Other"
          stageCounts["Other"] = (stageCounts["Other"] || 0) + 1;
        }
      });

    // Convert to chart data format
    return Object.entries(stageCounts).map(([name, count]) => ({
      name: name || "Unknown",
      value: count,
    }));
  }, [deals, pipelines]);

  // Deal value by month data for trend chart
  const dealValueByMonthData = useMemo(() => {
    if (!deals.length) return [];

    // Get last 6 months
    const months = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        date: d,
        month:
          d.toLocaleString("default", { month: "short" }) +
          " " +
          d.getFullYear().toString().substr(2, 2),
        "Open Value": 0,
        "Won Value": 0,
        "Lost Value": 0,
      });
    }

    // Group deals by month and status
    deals.forEach((deal) => {
      if (!deal.created_at) return;

      const dealDate = new Date(deal.created_at);
      // Skip invalid dates
      if (isNaN(dealDate.getTime())) return;

      const monthIndex = months.findIndex(
        (m) =>
          m.date.getMonth() === dealDate.getMonth() &&
          m.date.getFullYear() === dealDate.getFullYear()
      );

      if (monthIndex !== -1 && deal.status) {
        // Map status to chart category and handle null/undefined values
        const statusMap = {
          open: "Open Value",
          won: "Won Value",
          lost: "Lost Value",
        };

        const category = statusMap[deal.status];
        if (category) {
          // Convert to number and ensure it's a valid number
          const dealValue = Number(deal.value) || 0;
          months[monthIndex][category] += dealValue;
        }
      }
    });

    // Ensure all values are numbers
    months.forEach((month) => {
      month["Open Value"] = Number(month["Open Value"]) || 0;
      month["Won Value"] = Number(month["Won Value"]) || 0;
      month["Lost Value"] = Number(month["Lost Value"]) || 0;
    });

    return months;
  }, [deals]);

  // Calculate loading state
  const isLoading =
    isDealsLoading ||
    isContactsLoading ||
    isActivitiesLoading ||
    isFilesLoading ||
    isPipelinesLoading ||
    isUsersLoading;

  const user = useSelector(selectUser);

  // First-time user checklist state
  const [checklist, setChecklist] = useState({
    accountCreated: true,
    pipelineSetup: false,
    contactAdded: false,
    dealCreated: false,
  });

  console.log("teamPerformance", teamPerformance);
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
          <Button
            size="sm"
            className="shadow-sm flex gap-2 items-center"
            onClick={() => navigate("/deals/new")}
          >
            <Plus size={16} />
            <span>New Deal</span>
          </Button>
        </div>
      </header>
      {/* Key Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Deals Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-2xl font-bold">{totalDeals}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  deals in pipeline
                </p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deal Value Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pipeline Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(openDealValue)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  in active deals
                </p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Win Rate Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-2xl font-bold">{winRate}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  of deals won
                </p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contacts Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-2xl font-bold">{contacts.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  contacts in database
                </p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* First-time user checklist */}
      {(totalDeals === 0 ||
        pipelines.length === 0 ||
        contacts.length === 0) && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Getting Started Checklist
            </CardTitle>
            <CardDescription>
              Complete these steps to set up your DealSensei CRM
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="mr-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">Account Created</h4>
                  <p className="text-xs text-muted-foreground">
                    Your account is ready to use
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-600 border-green-200"
                >
                  Completed
                </Badge>
              </div>

              <div className="flex items-center">
                <div className="mr-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {pipelines.length > 0 ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">Set Up Pipeline</h4>
                  <p className="text-xs text-muted-foreground">
                    Create your sales pipeline
                  </p>
                </div>
                {pipelines.length > 0 ? (
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-600 border-green-200"
                  >
                    Completed
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => navigate("/pipelines/create")}
                  >
                    Set Up
                  </Button>
                )}
              </div>

              <div className="flex items-center">
                <div className="mr-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {contacts.length > 0 ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">Add Contact</h4>
                  <p className="text-xs text-muted-foreground">
                    Add your first contact
                  </p>
                </div>
                {contacts.length > 0 ? (
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-600 border-green-200"
                  >
                    Completed
                  </Badge>
                ) : (
                  <Button size="sm" onClick={() => navigate("/contacts")}>
                    Add Contact
                  </Button>
                )}
              </div>

              <div className="flex items-center">
                <div className="mr-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {totalDeals > 0 ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">Create Deal</h4>
                  <p className="text-xs text-muted-foreground">
                    Create your first deal
                  </p>
                </div>
                {totalDeals > 0 ? (
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-600 border-green-200"
                  >
                    Completed
                  </Badge>
                ) : (
                  <Button size="sm" onClick={() => navigate("/deals/new")}>
                    Create Deal
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t bg-card/50 flex justify-between">
            <div className="text-xs text-muted-foreground">
              {
                [
                  pipelines.length > 0,
                  contacts.length > 0,
                  totalDeals > 0,
                ].filter(Boolean).length
              }{" "}
              of 3 steps completed
            </div>
            <Progress
              value={
                ([
                  pipelines.length > 0,
                  contacts.length > 0,
                  totalDeals > 0,
                ].filter(Boolean).length /
                  3) *
                100
              }
              className="w-1/3 h-2"
            />
          </CardFooter>
        </Card>
      )}
      {/* Dashboard Widgets Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Deals Summary */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-semibold">
                Deals Summary
              </CardTitle>
            </div>
            <CardDescription>Your sales pipeline at a glance</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading ? (
              <div className="flex justify-center items-center h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : deals.length > 0 ? (
              <div className="space-y-4">
                {/* Get top stages with deals */}
                {Object.entries(
                  dealStageData.reduce((acc, stage) => {
                    console.log(stage, "qqqqqq");
                    if (stage.value > 0) {
                      acc[stage.name] = stage.value;
                    }
                    return acc;
                  }, {})
                )
                  .slice(0, 3)
                  .map(([stageName, count]) => (
                    <div key={stageName} className="flex items-center gap-3">
                      <div
                        className={`w-2 h-full min-h-[24px] ${
                          stageName.toLowerCase().includes("qualified")
                            ? "bg-blue-400"
                            : stageName.toLowerCase().includes("negotiation")
                            ? "bg-yellow-400"
                            : "bg-primary"
                        }`}
                      ></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{stageName}</span>
                          <span className="font-semibold">{count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                <Button
                  variant="link"
                  className="w-full text-primary mt-4 flex items-center justify-center gap-2"
                  onClick={() => navigate("/deals")}
                >
                  <span>View All Deals</span>
                  <ArrowRight size={16} />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center h-[200px] text-muted-foreground">
                <BarChart3 className="h-12 w-12 mb-2 opacity-20" />
                <p>No deals data available</p>
                <Button
                  variant="link"
                  onClick={() => navigate("/deals/new")}
                  className="mt-2"
                >
                  Create your first deal
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-semibold">
                Recent Activities
              </CardTitle>
            </div>
            <CardDescription>Latest interactions with contacts</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading ? (
              <div className="flex justify-center items-center h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-4">
                {activities.slice(0, 3).map((activity) => (
                  <div key={activity._id} className="flex items-start gap-3">
                    <div className="mt-1">
                      {activity.type === "email" ? (
                        <Mail size={18} className="text-blue-500" />
                      ) : activity.type === "call" ? (
                        <Phone size={18} className="text-green-500" />
                      ) : (
                        <CalendarClock size={18} className="text-orange-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {activity.type === "email"
                          ? "Email sent to "
                          : activity.type === "call"
                          ? "Call with "
                          : "Meeting with "}
                        {activity.contact_id?.name || "Contact"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleString("en-US", {
                          weekday: "short",
                          hour: "numeric",
                          minute: "numeric",
                          hour12: true,
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  variant="link"
                  className="w-full text-primary mt-4 flex items-center justify-center gap-2"
                  onClick={() => navigate("/activities")}
                >
                  <span>View All Activities</span>
                  <ArrowRight size={16} />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center h-[200px] text-muted-foreground">
                <Calendar className="h-12 w-12 mb-2 opacity-20" />
                <p>No activities recorded yet</p>
                <Button
                  variant="link"
                  onClick={() => navigate("/activities/new")}
                  className="mt-2"
                >
                  Log your first activity
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-semibold">
                AI Insights
              </CardTitle>
            </div>
            <CardDescription>
              Intelligent recommendations for your deals
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading ? (
              <div className="flex justify-center items-center h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : deals.length > 0 ? (
              <div className="space-y-4">
                <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <AlertCircle size={18} className="text-orange-500" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-orange-700">
                        Opportunity Alert
                      </div>
                      <div className="text-xs text-orange-600 mt-1">
                        The deal has been in the same stage for 14 days.
                        Consider following up.
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  variant="link"
                  className="w-full text-primary mt-4 flex items-center justify-center gap-2"
                  onClick={() => navigate("/ai-tools")}
                >
                  <span>View All Insights</span>
                  <ArrowRight size={16} />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center h-[200px] text-muted-foreground">
                <Sparkles className="h-12 w-12 mb-2 opacity-20" />
                <p>No AI insights available yet</p>
                <p className="text-xs text-center max-w-[200px] mt-1">
                  Add deals and activities to get AI-powered recommendations
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Charts and Visualizations Section */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold">
                Deal Pipeline
              </CardTitle>
              <Badge
                variant="outline"
                className="bg-primary/5 text-primary border-primary/20"
              >
                {openDeals} Active Deals
              </Badge>
            </div>
            <CardDescription>
              Distribution of deals across pipeline stages
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading ? (
              <div className="flex justify-center items-center h-[250px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : dealStageData && dealStageData.length > 0 ? (
              <BarChart
                className="h-[250px]"
                data={dealStageData}
                index="name"
                categories={["value"]}
                colors={["primary"]}
                valueFormatter={(value) => `${value} deals`}
                showLegend={false}
                showGridLines={false}
                yAxisWidth={60}
                layout="vertical"
              />
            ) : (
              <div className="flex flex-col justify-center items-center h-[250px] text-muted-foreground">
                <BarChart3 className="h-12 w-12 mb-2 opacity-20" />
                <p>No deals data available</p>
                <Button
                  variant="link"
                  onClick={() => navigate("/deals/new")}
                  className="mt-2"
                >
                  Create your first deal
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold">
                Deal Value Trend
              </CardTitle>
              <Badge
                variant="outline"
                className="bg-primary/5 text-primary border-primary/20"
              >
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(wonDealValue)}{" "}
                Won
              </Badge>
            </div>
            <CardDescription>Monthly deal values by status</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading ? (
              <div className="flex justify-center items-center h-[250px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : dealValueByMonthData && dealValueByMonthData.length > 0 ? (
              <TremorLineChart
                className="h-[250px]"
                data={dealValueByMonthData}
                index="month"
                categories={["Open Value", "Won Value", "Lost Value"]}
                colors={["blue", "green", "red"]}
                valueFormatter={(value) => {
                  // Ensure value is a number and handle potential NaN
                  const numValue = Number(value) || 0;
                  return new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(numValue);
                }}
                showLegend={true}
                showGridLines={false}
                yAxisWidth={80}
              />
            ) : (
              <div className="flex flex-col justify-center items-center h-[250px] text-muted-foreground">
                <LineChart className="h-12 w-12 mb-2 opacity-20" />
                <p>No trend data available yet</p>
                <Button
                  variant="link"
                  onClick={() => navigate("/deals/new")}
                  className="mt-2"
                >
                  Create your first deal
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div> */}
      {/* Activity and Files Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold">
                Recent Activities
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="hover:text-foreground"
                onClick={() => navigate("/activities")}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-[250px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : recentActivities && recentActivities.length > 0 ? (
              <div className="divide-y">
                {recentActivities.map((activity) => (
                  <div
                    key={activity._id}
                    className="p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center">
                        <Badge
                          className="mr-2"
                          variant={
                            activity.type === "call"
                              ? "default"
                              : activity.type === "email"
                              ? "secondary"
                              : activity.type === "meeting"
                              ? "outline"
                              : "destructive"
                          }
                        >
                          {activity.type.charAt(0).toUpperCase() +
                            activity.type.slice(1)}
                        </Badge>
                        <span className="font-medium">{activity.subject}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {activity.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center h-[250px] text-muted-foreground">
                <Activity className="h-12 w-12 mb-2 opacity-20" />
                <p>No activities recorded yet</p>
                <Button
                  variant="link"
                  onClick={() => navigate("/activities/new")}
                  className="mt-2"
                >
                  Log your first activity
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Files */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold">
                Recent Files
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="hover:text-foreground"
                onClick={() => navigate("/files")}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-[250px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : recentFiles && recentFiles.length > 0 ? (
              <div className="divide-y">
                {recentFiles.map((file) => (
                  <div
                    key={file._id}
                    className="p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="mr-3 p-2 bg-primary/10 rounded">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{file.filename}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.file_size_bytes / 1024).toFixed(1)} KB •
                            {new Date(file.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <a
                        href={file.s3_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="ghost" size="icon">
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center h-[250px] text-muted-foreground">
                <FileText className="h-12 w-12 mb-2 opacity-20" />
                <p>No files uploaded yet</p>
                <Button
                  variant="link"
                  onClick={() => navigate("/files/upload")}
                  className="mt-2"
                >
                  Upload your first file
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Team Performance Section */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold">
              Team Performance
            </CardTitle>
            <Badge
              variant="outline"
              className="bg-primary/5 text-primary border-primary/20"
            >
              {users.filter((user) => user.role === "sales_rep").length} Sales
              Reps
            </Badge>
          </div>
          <CardDescription>
            Performance metrics for your sales team
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-[250px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : teamPerformance && teamPerformance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Team Member
                    </th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">
                      Open Deals
                    </th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">
                      Won Deals
                    </th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">
                      Win Rate
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                      Deal Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {teamPerformance.map((rep) => (
                    <tr
                      key={rep.id}
                      className="border-b border-border/20 hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-4 text-sm font-medium">{rep.name}</td>
                      <td className="p-4 text-sm text-center">
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-600 border-blue-200"
                        >
                          {rep.openDeals}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-center">
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-600 border-green-200"
                        >
                          {rep.wonDeals}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-center">
                        <div className="flex items-center justify-center">
                          <Badge
                            variant="outline"
                            className={`${
                              rep.winRate >= 50
                                ? "bg-green-50 text-green-600 border-green-200"
                                : "bg-amber-50 text-amber-600 border-amber-200"
                            }`}
                          >
                            <span className="flex items-center">
                              {rep.winRate}%
                              {rep.winRate >= 50 ? (
                                <TrendingUp className="h-3 w-3 ml-1" />
                              ) : (
                                <ArrowDown className="h-3 w-3 ml-1" />
                              )}
                            </span>
                          </Badge>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-right font-medium">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                          maximumFractionDigits: 0,
                        }).format(rep.dealValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : users.filter((user) => user.role === "sales_rep").length > 0 ? (
            <div className="flex flex-col justify-center items-center h-[250px] text-muted-foreground">
              <Briefcase className="h-12 w-12 mb-2 opacity-20" />
              <p>No deal data available for your team yet</p>
              <Button
                variant="link"
                onClick={() => navigate("/deals/new")}
                className="mt-2"
              >
                Create your first deal
              </Button>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center h-[250px] text-muted-foreground">
              <Users className="h-12 w-12 mb-2 opacity-20" />
              <p>No sales team members found</p>
              <Button
                variant="link"
                onClick={() => navigate("/team")}
                className="mt-2"
              >
                Add team members
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
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
