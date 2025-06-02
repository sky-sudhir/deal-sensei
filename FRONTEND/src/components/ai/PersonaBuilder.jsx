import React, { useState } from "react";
import useQuery from "@/hooks/useQuery";
import { API_PERSONA_BUILDER } from "@/imports/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, RefreshCw, User, Zap, Brain, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const PersonaBuilder = ({ contactId }) => {
  const {
    data: d,
    loading,
    error,
    refetch,
  } = useQuery(`${API_PERSONA_BUILDER}${contactId}`, {
    skip: !contactId,
  });
  const data = d?.data?.data;

  const handleRefresh = () => {
    refetch();
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
            We need more information to build a persona
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {data.message ||
              "Add more activities, emails, and interactions to generate a persona for this contact."}
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
            Unable to Load Persona
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            There was an error generating the persona for this contact.
          </p>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { persona, motivators, decision_pattern, engagement_tips } = data;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Contact Persona</CardTitle>
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
          AI-generated behavioral profile based on interactions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Communication Style */}
        {persona && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Communication Style</h3>
            </div>
            <Badge variant="outline" className="mb-2">
              {persona.communication_style}
            </Badge>
            <p className="text-sm">{persona.description}</p>
          </div>
        )}

        <Separator />

        {/* Motivators */}
        {motivators && motivators.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Key Motivators</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {motivators.map((motivator, index) => (
                <Badge key={index} variant="secondary">
                  {motivator}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Decision Pattern */}
        {decision_pattern && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Decision Making</h3>
            </div>
            <Badge variant="outline" className="mb-2">
              {decision_pattern.type}
            </Badge>
            <p className="text-sm">{decision_pattern.description}</p>
          </div>
        )}

        <Separator />

        {/* Engagement Tips */}
        {engagement_tips && engagement_tips.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Engagement Tips</h3>
            </div>
            <ul className="space-y-2 text-sm">
              {engagement_tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonaBuilder;
