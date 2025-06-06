import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ObjectionHandler } from "@/components/ai";
import {
  Brain,
  MessageSquare,
  Sparkles,
  Lightbulb,
  BotMessageSquare,
} from "lucide-react";
import ChatBot from "@/components/ai/ChatBot";

const AiToolsPage = () => {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            AI Tools
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered tools to help you close more deals
          </p>
        </div>
      </div>

      <Tabs defaultValue="chatbot" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="chatbot" className="flex items-center gap-2">
            <BotMessageSquare className="h-4 w-4" />
            <span>Chatbot</span>
          </TabsTrigger>
          <TabsTrigger
            value="objection-handler"
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Objection Handler</span>
          </TabsTrigger>
          <TabsTrigger value="coming-soon" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span>Coming Soon</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="objection-handler">
          <ObjectionHandler />
        </TabsContent>

        <TabsContent value="chatbot">
          <ChatBot />
        </TabsContent>

        <TabsContent value="coming-soon">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                More AI Tools Coming Soon
              </CardTitle>
              <CardDescription>
                We're working on additional AI tools to help you sell more
                effectively
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Email Template Generator</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    AI-powered email templates tailored to your specific sales
                    scenarios
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Competitive Analysis</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get AI insights on how to position against competitors
                    mentioned in your deals
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Sales Call Analyzer</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload call recordings for AI analysis of sentiment,
                    objections, and next steps
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AiToolsPage;
