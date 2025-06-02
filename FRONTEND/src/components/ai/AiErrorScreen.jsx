import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ServerOff, Database, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Error types: 'service-unavailable' | 'cold-start'
const AiErrorScreen = ({ 
  type = 'service-unavailable', 
  message, 
  onRetry, 
  onContinue,
  entityType = 'data' 
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          {type === 'service-unavailable' ? (
            <>
              <ServerOff className="h-5 w-5 text-destructive" />
              AI Service Unavailable
            </>
          ) : (
            <>
              <Database className="h-5 w-5 text-amber-500" />
              Not Enough Data
            </>
          )}
        </CardTitle>
        <CardDescription>
          {type === 'service-unavailable' 
            ? 'Our AI service is temporarily unavailable'
            : `We need more ${entityType} to provide AI insights`
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-6">
          {message || (type === 'service-unavailable' 
            ? 'We are experiencing technical difficulties with our AI service. Please try again later.'
            : `Add more ${entityType} to get AI-powered insights. The AI needs sufficient data to generate meaningful analysis.`
          )}
        </p>
        <div className="flex flex-wrap gap-3">
          {onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" /> Try Again
            </Button>
          )}
          {onContinue && (
            <Button onClick={onContinue} variant={type === 'service-unavailable' ? 'default' : 'outline'} size="sm">
              {type === 'service-unavailable' ? 'Continue Without AI' : 'Add More Data'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AiErrorScreen;
