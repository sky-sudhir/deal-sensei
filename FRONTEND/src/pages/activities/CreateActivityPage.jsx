import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, useLocation } from "react-router-dom";

// UI Components
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { ArrowLeft } from "lucide-react";

import useQuery from "@/hooks/useQuery";
import useMutation from "@/hooks/useMutation";
import {
  API_ACTIVITY_CREATE,
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

export default function CreateActivityPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // Get deal_id and contact_id from URL params if they exist
  const initialDealId = queryParams.get("deal_id") || "";
  const initialContactId = queryParams.get("contact_id") || "";

  // Local state for select fields
  const [activityType, setActivityType] = useState("call");
  const [selectedDealId, setSelectedDealId] = useState(initialDealId);
  const [selectedContactId, setSelectedContactId] = useState(initialContactId);

  // Form setup with validation
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      type: "call",
      subject: "",
      content: "",
      duration_minutes: 15,
      next_steps: "",
      deal_id: initialDealId,
      contact_id: initialContactId,
    },
  });

  // Fetch deals and contacts for dropdowns
  const { data: dealsData = [] } = useQuery(API_DEALS_LIST);

  const { data: contactsData = [] } = useQuery(API_CONTACTS_LIST);

  const deals = dealsData?.data?.data?.deals || [];
  const contacts = contactsData?.data?.data?.contacts || [];

  // Create activity mutation
  const { mutate, isLoading } = useMutation();

  // Handle form submission
  const onSubmit = async (data) => {
    // Convert empty strings to null for optional fields
    if (data.deal_id === "") data.deal_id = null;
    if (data.contact_id === "") data.contact_id = null;

    const res = await mutate({
      url: API_ACTIVITY_CREATE,
      data,
      method: "POST",
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
        <h1 className="text-2xl font-bold">Create New Activity</h1>
      </div>

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
                <p className="text-sm text-red-500">{errors.subject.message}</p>
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
                  disabled={initialDealId !== ""}
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
                  disabled={initialContactId !== ""}
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Activity"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
