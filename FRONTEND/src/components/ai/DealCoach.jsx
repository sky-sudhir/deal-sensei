import React, { useState } from "react";
import useQuery from "@/hooks/useQuery";
import { API_DEAL_COACH } from "@/imports/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DealCoach = ({ dealId }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const { data, loading, error } = useQuery(`${API_DEAL_COACH}${dealId}`, {
    skip: !dealId,
    key: refreshKey,
  });

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Handle cold start (not enough data)
  if (data?.cold_start) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Not Enough Data
          </CardTitle>
          <CardDescription>
            We need more information to provide meaningful insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {data.message ||
              "Add more activities and interactions to get AI-powered deal coaching."}
          </p>
          <div className="flex flex-col gap-3 mt-6">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              Log an Activity
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Unable to Load Deal Coach
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            There was an error loading the AI insights for this deal.
          </p>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const {
    health_score,
    recommendations,
    risks,
    stage_analysis,
    activity_analysis,
  } = data;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Deal Coach</CardTitle>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
        <CardDescription>
          AI-powered insights and recommendations for this deal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="risks">Risks</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Health Score */}
              <div>
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium">Deal Health Score</h3>
                  <span className="font-medium">{health_score}%</span>
                </div>
                <Progress
                  value={health_score}
                  className="h-2"
                  style={{
                    background:
                      health_score < 30
                        ? "var(--destructive)"
                        : health_score < 70
                        ? "var(--amber-500)"
                        : "var(--primary)",
                  }}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {health_score < 30
                    ? "This deal needs immediate attention"
                    : health_score < 70
                    ? "This deal is progressing but has some concerns"
                    : "This deal is on track to close successfully"}
                </p>
              </div>

              {/* Stage Analysis */}
              {stage_analysis && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Stage Analysis</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Current Stage</p>
                      <p className="font-medium">
                        {stage_analysis.current_stage}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Days in Stage</p>
                      <p className="font-medium flex items-center">
                        {stage_analysis.days_in_stage}
                        {stage_analysis.is_overdue && (
                          <Badge variant="destructive" className="ml-2">
                            Overdue
                          </Badge>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Average Time</p>
                      <p className="font-medium">
                        {stage_analysis.average_days_in_stage} days
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Activity Analysis */}
              {activity_analysis && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Activity Analysis</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Activities</p>
                      <p className="font-medium">
                        {activity_analysis.total_activities}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Recent Activity</p>
                      <p className="font-medium flex items-center">
                        {activity_analysis.recent_activity ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                            Yes
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-amber-500 mr-1" />
                            No
                          </>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Activity Trend</p>
                      <p className="font-medium capitalize">
                        {activity_analysis.activity_trend}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="recommendations">
            <div className="space-y-4">
              <h3 className="font-medium">Recommended Actions</h3>
              {recommendations && recommendations.length > 0 ? (
                <ul className="space-y-3">
                  {recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">
                  No recommendations available.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="risks">
            <div className="space-y-4">
              <h3 className="font-medium">Potential Risks</h3>
              {risks && risks.length > 0 ? (
                <ul className="space-y-3">
                  {risks.map((risk, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">
                  No significant risks detected.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DealCoach;
