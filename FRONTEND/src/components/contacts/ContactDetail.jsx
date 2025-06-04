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
  Phone,
  Mail,
  Edit,
  Trash,
  ArrowLeft,
  Briefcase,
  Calendar,
  Clock,
  FileText,
  User,
} from "lucide-react";
import ContactForm from "./ContactForm";
import { useSelector } from "react-redux";
import { Badge } from "@/components/ui/badge";
import ActivityList from "@/components/activities/ActivityList";
import FileList from "@/components/files/FileList";
import { PersonaBuilder, ObjectionHandler } from "@/components/ai";
import ChatBot from "../ai/ChatBot";

const ContactDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Get user role from Redux store
  const { user } = useSelector((state) => state.user);
  const isAdmin = user?.role === "admin";

  // Fetch contact details
  const { data, loading, refetch } = useQuery(`/api/v1/contacts/${id}`);
  const contact = data?.data?.data || null;

  // Fetch deals associated with this contact
  const { data: dealsData, loading: dealsLoading } = useQuery(
    `/api/v1/deals/contact/${id}`
  );
  const deals = dealsData?.data?.data || [];

  // Setup mutation for delete
  const { mutate } = useMutation();

  const handleEditSuccess = () => {
    refetch();
    setIsEditModalOpen(false);
  };

  const handleDeleteContact = async () => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        const response = await mutate({
          url: `/api/v1/contacts/${id}`,
          method: "DELETE",
        });

        if (response.success) {
          navigate("/contacts");
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleCreateDeal = () => {
    navigate(`/deals/new?contact=${id}`);
  };

  if (loading) {
    return <div className="text-center py-10">Loading contact details...</div>;
  }

  if (!contact) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Contact not found.</p>
        <Button variant="link" onClick={() => navigate("/contacts")}>
          Back to Contacts
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/contacts")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold">{contact.name}</h2>
          {contact.engagement_score > 0 && (
            <Badge
              variant={
                contact.engagement_score > 70
                  ? "success"
                  : contact.engagement_score > 30
                  ? "warning"
                  : "outline"
              }
            >
              {contact.engagement_score}% Engaged
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button variant="outline" onClick={handleCreateDeal}>
            <Briefcase className="mr-2 h-4 w-4" /> Create Deal
          </Button>
          <Button variant="destructive" onClick={handleDeleteContact}>
            <Trash className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {contact.email && (
              <div className="flex items-center">
                <Mail className="mr-3 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-sm hover:underline"
                  >
                    {contact.email}
                  </a>
                </div>
              </div>
            )}

            {contact.phone && (
              <div className="flex items-center">
                <Phone className="mr-3 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <a
                    href={`tel:${contact.phone}`}
                    className="text-sm hover:underline"
                  >
                    {contact.phone}
                  </a>
                </div>
              </div>
            )}

            <div className="flex items-center">
              <User className="mr-3 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Owner</p>
                <p className="text-sm">
                  {contact.owner_id?.name || "Not assigned"}
                </p>
              </div>
            </div>

            {contact.last_interaction_date && (
              <div className="flex items-center">
                <Calendar className="mr-3 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Last Interaction</p>
                  <p className="text-sm">
                    {new Date(
                      contact.last_interaction_date
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {contact.notes ? (
              <p className="whitespace-pre-line">{contact.notes}</p>
            ) : (
              <p className="text-muted-foreground italic">No notes available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Deals, Activities, etc. */}
      <Tabs defaultValue="deals" className="w-full">
        <TabsList>
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          <TabsTrigger value="chatbot">Chatbot</TabsTrigger>
        </TabsList>

        <TabsContent value="deals" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Associated Deals</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateDeal}
                  className="hover:text-foreground"
                >
                  <Briefcase className="mr-2 h-4 w-4" /> New Deal
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {dealsLoading ? (
                <div className="text-center py-4">Loading deals...</div>
              ) : deals.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">
                    No deals associated with this contact.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {deals.map((deal) => (
                    <div
                      key={deal._id}
                      className="flex justify-between items-center p-3 border rounded-lg hover:bg-secondary cursor-pointer"
                      onClick={() => navigate(`/deals/${deal._id}`)}
                    >
                      <div>
                        <h4 className="font-medium">{deal.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Value: ₹{deal.value.toLocaleString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          deal.status === "won"
                            ? "success"
                            : deal.status === "lost"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {deal.status.charAt(0).toUpperCase() +
                          deal.status.slice(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="mt-4">
          <ActivityList contact_id={id} />
        </TabsContent>

        <TabsContent value="files" className="mt-4">
          <FileList entityType="contact" entityId={id} />
        </TabsContent>

        <TabsContent value="ai-insights" className="mt-4">
          <div className="space-y-6">
            {/* Persona Builder */}
            <PersonaBuilder contactId={id} />

            {/* Objection Handler */}
            <ObjectionHandler contactId={id} />
          </div>
        </TabsContent>

        <TabsContent value="chatbot" className="mt-4">
          <ChatBot contact_id={id} />
        </TabsContent>
      </Tabs>

      {/* Edit Contact Modal */}
      {isEditModalOpen && (
        <ContactForm
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
          initialData={contact}
          isEdit={true}
        />
      )}
    </div>
  );
};

export default ContactDetail;
