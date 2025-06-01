import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "sonner";

// UI Components
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { ArrowLeft } from "lucide-react";

// API Hooks
import useQuery from "@/hooks/useQuery";
import useMutation from "@/hooks/useMutation";
import {
  API_ACTIVITY_DETAILS,
  API_ACTIVITY_UPDATE,
  API_CONTACTS_LIST,
  API_DEALS_LIST,
} from "@/imports/api";

// Schema for form validation
const schema = yup.object({
  type: yup.string().required("Activity type is required"),
  subject: yup.string().required("Subject is required"),
  content: yup.string().required("Content is required"),
  duration_minutes: yup
    .number()
    .typeError("Duration must be a number")
    .min(0, "Duration cannot be negative")
    .max(480, "Duration cannot exceed 8 hours")
    .required("Duration is required"),
  next_steps: yup.string(),
  deal_id: yup.string(),
  contact_id: yup.string(),
});

export default function EditActivityPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Local state for select fields
  const [activityType, setActivityType] = useState("call");
  const [selectedDealId, setSelectedDealId] = useState("");
  const [selectedContactId, setSelectedContactId] = useState("");

  // Form setup with validation
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      type: "call",
      subject: "",
      content: "",
      duration_minutes: 15,
      next_steps: "",
      deal_id: "",
      contact_id: "",
    },
  });

  // Fetch activity data
  const { data: activityData, isLoading: isLoadingActivity } = useQuery(
    `${API_ACTIVITY_DETAILS}${id}`
  );

  // Fetch deals and contacts for dropdowns
  const { data: dealsData = [] } = useQuery(API_DEALS_LIST);
  const { data: contactsData = [] } = useQuery(API_CONTACTS_LIST);

  const deals = dealsData?.data?.data?.deals || [];
  const contacts = contactsData?.data?.data?.contacts || [];

  // Update mutation
  const { mutate, loading: isMutating } = useMutation();

  // Handle form submission
  const onSubmit = async (data) => {
    // Convert empty strings to null for optional fields
    if (data.deal_id === "") data.deal_id = null;
    if (data.contact_id === "") data.contact_id = null;

    const res = await mutate({
      url: `${API_ACTIVITY_UPDATE}${id}`,
      data,
      method: "PUT",
    });

    if (res?.success) {
      navigate("/activities");
    }
  };

  // Handle activity type change
  const handleTypeChange = (value) => {
    setActivityType(value);
    setValue("type", value);
  };

  // Handle deal selection change
  const handleDealChange = (value) => {
    setSelectedDealId(value);
    setValue("deal_id", value);
  };

  // Handle contact selection change
  const handleContactChange = (value) => {
    setSelectedContactId(value);
    setValue("contact_id", value);
  };

  // Load activity data into form when available
  useEffect(() => {
    if (activityData?.data?.data) {
      const activity = activityData.data.data;

      // Set form values
      reset({
        type: activity.type || "call",
        subject: activity.subject || "",
        content: activity.content || "",
        duration_minutes: activity.duration_minutes || 0,
        next_steps: activity.next_steps || "",
        deal_id: activity.deal_id?._id || "",
        contact_id: activity.contact_id?._id || "",
      });

      // Update local state for select fields
      setActivityType(activity.type || "call");
      setSelectedDealId(activity.deal_id?._id || "");
      setSelectedContactId(activity.contact_id?._id || "");
    }
  }, [activityData, reset]);

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Edit Activity</h1>
      </div>

      {isLoadingActivity ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Loading activity data...</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Row 1: Type and Subject */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Activity Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Activity Type</Label>
                <div className="relative">
                  <select
                    id="type"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={activityType}
                    onChange={(e) => handleTypeChange(e.target.value)}
                  >
                    <option value="call">Call</option>
                    <option value="email">Email</option>
                    <option value="meeting">Meeting</option>
                    <option value="note">Note</option>
                    <option value="task">Task</option>
                  </select>
                </div>
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type.message}</p>
                )}
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Activity subject"
                  {...register("subject")}
                />
                {errors.subject && (
                  <p className="text-sm text-red-500">
                    {errors.subject.message}
                  </p>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Activity details"
                rows={4}
                {...register("content")}
              />
              {errors.content && (
                <p className="text-sm text-red-500">{errors.content.message}</p>
              )}
            </div>

            {/* Row 2: Duration and Next Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                <Input
                  id="duration_minutes"
                  type="number"
                  min="0"
                  max="480"
                  {...register("duration_minutes")}
                />
                {errors.duration_minutes && (
                  <p className="text-sm text-red-500">
                    {errors.duration_minutes.message}
                  </p>
                )}
              </div>

              {/* Next Steps */}
              <div className="space-y-2">
                <Label htmlFor="next_steps">Next Steps</Label>
                <Textarea
                  id="next_steps"
                  placeholder="Next steps (optional)"
                  rows={2}
                  {...register("next_steps")}
                />
                {errors.next_steps && (
                  <p className="text-sm text-red-500">
                    {errors.next_steps.message}
                  </p>
                )}
              </div>
            </div>

            {/* Row 3: Related Deal and Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Related Deal */}
              <div className="space-y-2">
                <Label htmlFor="deal_id">Related Deal</Label>
                <div className="relative">
                  <select
                    id="deal_id"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={selectedDealId}
                    onChange={(e) => handleDealChange(e.target.value)}
                  >
                    <option value="">None</option>
                    {deals.map((deal) => (
                      <option key={deal._id} value={deal._id}>
                        {deal.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Related Contact */}
              <div className="space-y-2">
                <Label htmlFor="contact_id">Related Contact</Label>
                <div className="relative">
                  <select
                    id="contact_id"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={selectedContactId}
                    onChange={(e) => handleContactChange(e.target.value)}
                  >
                    <option value="">None</option>
                    {contacts.map((contact) => (
                      <option key={contact._id} value={contact._id}>
                        {contact.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isMutating}>
                {isMutating ? "Updating..." : "Update Activity"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
