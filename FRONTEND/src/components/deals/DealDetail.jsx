import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useQuery from "@/hooks/useQuery";
import useMutation from "@/hooks/useMutation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Edit,
  Trash,
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  User,
  DollarSign,
  BarChart,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  IndianRupee,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSelector } from "react-redux";
import ActivityList from "@/components/activities/ActivityList";
import FileList from "@/components/files/FileList";
import { DealCoach, WinLossExplainer, ObjectionHandler } from "@/components/ai";
import ChatBot from "../ai/ChatBot";

const DealDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);

  // Get user role from Redux store
  const { user } = useSelector((state) => state.user);
  const isAdmin = user?.role === "admin";

  // Fetch deal details
  const { data, loading, refetch } = useQuery(`/api/v1/deals/${id}`);
  const deal = data?.data?.data || null;

  // Setup mutation for delete and stage update
  const { mutate, loading: isMutating } = useMutation();

  const handleDeleteDeal = async () => {
    if (window.confirm("Are you sure you want to delete this deal?")) {
      try {
        const response = await mutate({
          url: `/api/v1/deals/${id}`,
          method: "DELETE",
        });

        if (response.success) {
          navigate("/deals");
        }
      } catch (error) {
        console.error("Error deleting deal:", error);
      }
    }
  };

  const handleStageChange = async (stage) => {
    setIsUpdatingStage(true);

    try {
      const response = await mutate({
        url: `/api/v1/deals/${id}/stage`,
        method: "PUT",
        data: { stage },
      });

      if (response.success) {
        refetch();
      }
    } catch (error) {
      console.error("Error updating deal stage:", error);
    } finally {
      setIsUpdatingStage(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "won":
        return "success";
      case "lost":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "won":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "lost":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading deal details...</div>;
  }

  if (!deal) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Deal not found.</p>
        <Button variant="link" onClick={() => navigate("/deals")}>
          Back to Deals
        </Button>
      </div>
    );
  }

  const getStageNameById = (deal) => {
    // Since the backend stores stage as a name string, we can just return it directly
    return (
      deal?.pipeline_id?.stages?.find(
        (s) => s._id === deal.stage || s.name === deal.stage
      )?.name || "Not set"
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/deals")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold">{deal.title}</h2>
          <Badge variant={getStatusBadgeVariant(deal.status)}>
            {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/deals/${id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button variant="destructive" onClick={handleDeleteDeal}>
            <Trash className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Deal Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Deal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <IndianRupee className="mr-3 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Value</p>
                <p className="text-lg font-semibold">
                  ₹{deal.value.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <BarChart className="mr-3 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Pipeline</p>
                <p className="text-sm">{deal.pipeline_id?.name || "Unknown"}</p>
              </div>
            </div>

            <div className="flex items-center">
              <User className="mr-3 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Owner</p>
                <p className="text-sm">
                  {deal.owner_id?.name || "Not assigned"}
                </p>
              </div>
            </div>

            {deal.close_date && (
              <div className="flex items-center">
                <Calendar className="mr-3 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Expected Close Date</p>
                  <p className="text-sm">
                    {new Date(deal.close_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {deal.stage_duration_days > 0 && (
              <div className="flex items-center">
                <Clock className="mr-3 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Time in Current Stage</p>
                  <p className="text-sm">{deal.stage_duration_days} days</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stage Card */}
        <Card>
          <CardHeader>
            <CardTitle>Current Stage</CardTitle>
            <CardDescription>
              Update the deal stage as it progresses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Current Stage:</span>
                <Badge variant="secondary">{deal.stage}</Badge>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Update Stage:</label>
                <Select
                  value={deal.stage}
                  onValueChange={handleStageChange}
                  disabled={isUpdatingStage}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {deal.pipeline_id?.stages.map((stage) => (
                      <SelectItem key={stage._id} value={stage.name}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Deal Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-full py-4">
              {getStatusIcon(deal.status)}
              <h3 className="mt-3 text-xl font-semibold">
                {deal.status === "won"
                  ? "Won"
                  : deal.status === "lost"
                  ? "Lost"
                  : "In Progress"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {deal.status === "won"
                  ? "Congratulations! This deal has been won."
                  : deal.status === "lost"
                  ? "This deal has been lost."
                  : "This deal is still in progress."}
              </p>

              {deal.total_deal_duration_days > 0 && (
                <p className="mt-3 text-sm">
                  Total deal duration:{" "}
                  <span className="font-medium">
                    {deal.total_deal_duration_days} days
                  </span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes Card */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          {deal.notes ? (
            <p className="whitespace-pre-line">{deal.notes}</p>
          ) : (
            <p className="text-muted-foreground italic">No notes available</p>
          )}
        </CardContent>
      </Card>

      {/* Tabs for Contacts, Activities, etc. */}
      <Tabs defaultValue="contacts" className="w-full">
        <TabsList>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          <TabsTrigger value="chatbot">Chatbot</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Associated Contacts</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/deals/${id}/edit`)}
                >
                  <Users className="mr-2 h-4 w-4" /> Manage Contacts
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!deal.contact_ids || deal.contact_ids.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">
                    No contacts associated with this deal.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {deal.contact_ids.map((contact) => (
                    <div
                      key={contact._id}
                      className="flex justify-between items-center p-3 border rounded-lg hover:bg-secondary cursor-pointer"
                      onClick={() => navigate(`/contacts/${contact._id}`)}
                    >
                      <div>
                        <h4 className="font-medium">{contact.name}</h4>
                        {contact.email && (
                          <p className="text-sm text-muted-foreground">
                            {contact.email}
                          </p>
                        )}
                      </div>
                      {contact.phone && (
                        <p className="text-sm">{contact.phone}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="mt-4">
          <ActivityList deal_id={id} />
        </TabsContent>

        <TabsContent value="files" className="mt-4">
          <FileList entityType="deal" entityId={id} deal_id={id} />
        </TabsContent>

        <TabsContent value="ai-insights" className="mt-4">
          <div className="space-y-6">
            {/* Deal Coach */}
            <DealCoach dealId={id} />

            {/* Only show Win-Loss Explainer for closed deals */}
            {deal.status === "won" || deal.status === "lost" ? (
              <WinLossExplainer dealId={id} />
            ) : null}

            {/* Objection Handler */}
            <ObjectionHandler dealId={id} />
          </div>
        </TabsContent>
        <TabsContent value="chatbot" className="mt-4">
          <ChatBot deal_id={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DealDetail;
