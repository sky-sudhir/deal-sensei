import React, { useState } from "react";
import useQuery from "@/hooks/useQuery";
import { API_WIN_LOSS_EXPLAINER } from "@/imports/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const WinLossExplainer = ({ dealId }) => {
  const { data, loading, error, refetch } = useQuery(
    `${API_WIN_LOSS_EXPLAINER}${dealId}`,
    {
      skip: !dealId,
    }
  );

  const handleRefresh = () => {
    refetch();
  };

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
            Unable to Load Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            There was an error analyzing this deal.
          </p>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { outcome, key_factors, recommendations, detailed_analysis } =
    data?.data?.data?.data;
  const isWon = outcome === "won";

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            {isWon ? (
              <>
                <TrendingUp className="h-5 w-5 text-green-500" />
                Win Analysis
              </>
            ) : (
              <>
                <TrendingDown className="h-5 w-5 text-destructive" />
                Loss Analysis
              </>
            )}
          </CardTitle>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="hover:text-foreground"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
        <CardDescription>
          Understanding why this deal was {isWon ? "won" : "lost"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Analysis */}
        <div className="space-y-3">
          <h3 className="font-medium">Summary</h3>
          <p className="text-sm">{detailed_analysis}</p>
        </div>

        <Separator />

        {/* Key Factors */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Key Factors</h3>
          </div>
          <div className="space-y-4">
            {key_factors && key_factors.length > 0 ? (
              key_factors.map((factor, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Badge
                    variant="outline"
                    className={`mt-0.5 ${
                      factor.impact === "high" ? "border-primary" : ""
                    }`}
                  >
                    {factor.impact}
                  </Badge>
                  <div>
                    <p className="font-medium text-sm">{factor.factor}</p>
                    <p className="text-sm text-muted-foreground">
                      {factor.description}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                No key factors available.
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Recommendations */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Recommendations</h3>
          </div>
          {recommendations && recommendations.length > 0 ? (
            <ul className="space-y-2">
              {recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-primary">•</span>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">
              No recommendations available.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WinLossExplainer;
