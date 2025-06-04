import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate, useLocation } from "react-router-dom";
import { dealSchema } from "@/schemas/dealSchema";
import useMutation from "@/hooks/useMutation";
import useQuery from "@/hooks/useQuery";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useSelector } from "react-redux";
import { Checkbox } from "@/components/ui/checkbox";
import moment from "moment";

const DealForm = ({ initialData = null, isEdit = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [selectedContacts, setSelectedContacts] = useState([]);

  // Get URL params for pre-filling contact
  const queryParams = new URLSearchParams(location.search);
  const preSelectedContactId = queryParams.get("contact");

  // Get user role from Redux store
  const { user } = useSelector((state) => state.user);
  const isAdmin = user?.role === "admin";

  // Fetch pipelines for selection
  const { data: pipelinesData, loading: pipelinesLoading } =
    useQuery("api/v1/pipelines");
  const pipelines = pipelinesData?.data?.data || [];

  // Get team members for owner selection (admin only)
  const { data: teamData } = useQuery("api/v1/users");
  const teamMembers = teamData?.data?.data || [];

  // Fetch contacts for selection
  const { data: contactsData, loading: contactsLoading } =
    useQuery("api/v1/contacts");
  const contacts = contactsData?.data?.data?.contacts || [];

  // Setup form with validation
  const form = useForm({
    resolver: yupResolver(dealSchema),
    defaultValues: {
      title: "",
      value: "",
      pipeline_id: "",
      stage: "",
      contact_ids: [],
      owner_id: "",
      status: "open",
      close_date: "",
      notes: "",
    },
  });

  // Setup mutation for create/update
  const { mutate } = useMutation();

  // Set form values if editing
  useEffect(() => {
    if (initialData && pipelines.length > 0) {
      // Find the pipeline object from the pipelines array
      const pipelineObj = pipelines.find((p) => {
        // Handle both string ID and object with _id
        const initialPipelineId =
          typeof initialData.pipeline_id === "object"
            ? initialData.pipeline_id._id
            : initialData.pipeline_id;
        return p._id === initialPipelineId;
      });

      // Set the selected pipeline first
      setSelectedPipeline(pipelineObj || null);

      // Then reset the form with all values
      form.reset({
        title: initialData.title || "",
        value: initialData.value || "",
        pipeline_id:
          typeof initialData.pipeline_id === "object"
            ? initialData.pipeline_id._id
            : initialData.pipeline_id,
        stage: initialData.stage || "",
        contact_ids:
          initialData.contact_ids?.map((c) =>
            typeof c === "object" ? c._id : c
          ) || [],
        owner_id:
          typeof initialData.owner_id === "object"
            ? initialData.owner_id._id
            : initialData.owner_id,
        status: initialData.status || "open",
        close_date: initialData.close_date
          ? new Date(initialData.close_date).toISOString().split("T")[0]
          : "",
        notes: initialData.notes || "",
      });

      // Set selected contacts
      setSelectedContacts(
        initialData.contact_ids?.map((c) =>
          typeof c === "object" ? c._id : c
        ) || []
      );
    } else if (preSelectedContactId && contacts.length > 0) {
      // Pre-select contact if provided in URL
      setSelectedContacts([preSelectedContactId]);
      form.setValue("contact_ids", [preSelectedContactId]);
    }
  }, [initialData, pipelines.length, contacts.length]);

  // Handle pipeline change to update available stages
  const handlePipelineChange = (pipelineId) => {
    const pipeline = pipelines.find((p) => p._id === pipelineId);
    setSelectedPipeline(pipeline);

    // Reset stage when pipeline changes
    form.setValue("stage", "");

    console.log("Selected pipeline:", pipeline);
  };

  // Handle contact selection
  const handleContactChange = (contactId, isChecked) => {
    let updatedContacts;

    if (isChecked) {
      updatedContacts = [...selectedContacts, contactId];
    } else {
      updatedContacts = selectedContacts.filter((id) => id !== contactId);
    }

    setSelectedContacts(updatedContacts);
    form.setValue("contact_ids", updatedContacts);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    const obj = {
      ...data,
      close_date: moment(data.close_date).format("YYYY-MM-DD"),
    };

    try {
      // Make sure we're using the correct URL format without double slashes
      const endpoint = isEdit
        ? { url: `api/v1/deals/${initialData._id}`, method: "PUT", data: obj }
        : { url: `api/v1/deals`, method: "POST", data: obj };

      console.log("Submitting to endpoint:", endpoint);
      const response = await mutate(endpoint);

      if (response.success) {
        // Navigate to deal detail or deals list
        if (isEdit) {
          navigate(`/deals/${initialData._id}`);
        } else if (response.data?._id) {
          navigate(`/deals/${response.data._id}`);
        } else {
          navigate("/deals");
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log("pipelines", pipelines);
  console.log("teamMembers", teamMembers);
  console.log("contacts", contacts);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold">
          {isEdit ? "Edit Deal" : "Create New Deal"}
        </h2>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{isEdit ? "Edit Deal" : "Create New Deal"}</CardTitle>
            <CardDescription>
              {isEdit
                ? "Update the deal information"
                : "Enter the details for the new deal"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Deal Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Deal Title</Label>
              <Input
                id="title"
                {...form.register("title")}
                placeholder="Enter deal title"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            {/* Deal Value */}
            <div className="space-y-2">
              <Label htmlFor="value">Deal Value</Label>
              <Input
                id="value"
                type="number"
                placeholder="Enter deal value"
                {...form.register("value", {
                  setValueAs: (value) => parseFloat(value) || "",
                })}
              />
              {form.formState.errors.value && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.value.message}
                </p>
              )}
            </div>

            {/* Pipeline Selection */}
            <div className="space-y-2">
              <Label htmlFor="pipeline_id">Pipeline</Label>
              <Controller
                control={form.control}
                name="pipeline_id"
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handlePipelineChange(value);
                    }}
                    value={field.value}
                  >
                    <SelectTrigger id="pipeline_id">
                      <SelectValue placeholder="Select a pipeline" />
                    </SelectTrigger>
                    <SelectContent>
                      {pipelines.map((pipeline) => (
                        <SelectItem key={pipeline._id} value={pipeline._id}>
                          {pipeline.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.pipeline_id && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.pipeline_id.message}
                </p>
              )}
            </div>

            {/* Stage Selection */}
            <div className="space-y-2">
              <Label htmlFor="stage">Stage</Label>
              <Controller
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!selectedPipeline}
                  >
                    <SelectTrigger id="stage">
                      <SelectValue placeholder="Select a stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedPipeline?.stages?.map((stage) => (
                        <SelectItem key={stage.name} value={stage?.name || ""}>
                          {stage?.name || ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.stage && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.stage.message}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="won">Won</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.status && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.status.message}
                </p>
              )}
            </div>

            {/* Close Date */}
            <div className="space-y-2">
              <Label htmlFor="close_date">Expected Close Date</Label>
              <Controller
                control={form.control}
                name="close_date"
                render={({ field }) => (
                  <Input
                    id="close_date"
                    type="date"
                    {...field}
                    value={
                      field.value
                        ? new Date(field.value).toISOString().split("T")[0]
                        : ""
                    }
                  />
                )}
              />
              {form.formState.errors.close_date && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.close_date.message}
                </p>
              )}
            </div>

            {/* Owner Selection (Admin only) */}
            {isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="owner_id">Deal Owner</Label>
                <Controller
                  control={form.control}
                  name="owner_id"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="owner_id">
                        <SelectValue placeholder="Select deal owner" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers.map((member) => (
                          <SelectItem key={member._id} value={member._id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.owner_id && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.owner_id.message}
                  </p>
                )}
              </div>
            )}

            {/* Contact selection */}
            <div className="space-y-4">
              <Label>Associated Contacts</Label>
              {contactsLoading ? (
                <div>Loading contacts...</div>
              ) : contacts.length === 0 ? (
                <div className="text-muted-foreground">
                  No contacts available
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {contacts.map((contact) => (
                    <div
                      key={contact._id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`contact-${contact._id}`}
                        checked={selectedContacts.includes(contact._id)}
                        onCheckedChange={(checked) =>
                          handleContactChange(contact._id, checked)
                        }
                      />
                      <label
                        htmlFor={`contact-${contact._id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {contact.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
              {form.formState.errors.contact_ids?.message && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.contact_ids.message}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Controller
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <Textarea
                    id="notes"
                    placeholder="Enter any additional notes"
                    {...field}
                    value={field.value || ""}
                    className="min-h-[100px]"
                  />
                )}
              />
              {form.formState.errors.notes && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.notes.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEdit
                ? "Update Deal"
                : "Create Deal"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default DealForm;
