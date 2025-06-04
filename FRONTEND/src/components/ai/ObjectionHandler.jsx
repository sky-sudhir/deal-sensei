import React, { useState } from "react";
import useMutation from "@/hooks/useMutation";
import { API_OBJECTION_HANDLER } from "@/imports/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  AlertCircle,
  MessageSquare,
  Send,
  Lightbulb,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ObjectionHandler = ({ dealId = null, contactId = null }) => {
  const [objectionText, setObjectionText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { mutate, data: d, loading, error } = useMutation();
  const data = d?.data?.data?.data;
  console.log(data, "qqqqqqqqqqqqqqqq");
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!objectionText.trim()) return;

    const payload = {
      objection_text: objectionText,
      ...(dealId && { deal_id: dealId }),
      ...(contactId && { contact_id: contactId }),
    };

    await mutate({
      url: API_OBJECTION_HANDLER,
      method: "POST",
      data: payload,
    });

    setSubmitted(true);
  };

  const handleReset = () => {
    setObjectionText("");
    setSubmitted(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Objection Handler
        </CardTitle>
        <CardDescription>
          Get AI-powered responses to customer objections
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="objection" className="text-sm font-medium">
                What objection did the customer raise?
              </label>
              <Textarea
                id="objection"
                placeholder="Enter the customer's objection here..."
                value={objectionText}
                onChange={(e) => setObjectionText(e.target.value)}
                className="min-h-[100px]"
                required
              />
              <p className="text-xs text-muted-foreground">
                Be specific about what they said to get the most relevant
                responses.
              </p>
            </div>
            <Button type="submit" disabled={loading || !objectionText.trim()}>
              {loading ? (
                <>Analyzing...</>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" /> Get Responses
                </>
              )}
            </Button>
          </form>
        ) : (
          <>
            {error ? (
              <div className="text-center py-4">
                <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-2" />
                <h3 className="font-medium text-lg mb-2">
                  Error Processing Objection
                </h3>
                <p className="text-muted-foreground mb-4">
                  We couldn't analyze this objection. Please try again.
                </p>
                <Button onClick={handleReset} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm font-medium mb-1">
                    Customer Objection:
                  </p>
                  <p className="text-sm">{data?.objection_text}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {data?.category || "Uncategorized"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Recommended tone: {data?.tone_advice || "Professional"}
                  </span>
                </div>

                <Tabs defaultValue="responses">
                  <TabsList className="mb-4">
                    <TabsTrigger value="responses">Responses</TabsTrigger>
                    <TabsTrigger value="questions">
                      Follow-up Questions
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="responses">
                    <div className="space-y-4">
                      {data?.responses?.map((response, index) => (
                        <Card key={index} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-2">
                              <Lightbulb className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <p className="text-sm">{response}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="questions">
                    <div className="space-y-4">
                      {data?.follow_up_questions?.map((question, index) => (
                        <Card key={index} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-2">
                              <HelpCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <p className="text-sm">{question}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </>
        )}
      </CardContent>
      {submitted && !error && (
        <CardFooter className="flex justify-end">
          <Button onClick={handleReset} variant="outline">
            Handle Another Objection
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ObjectionHandler;
