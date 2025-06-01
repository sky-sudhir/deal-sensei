import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import useMutation from "../../hooks/useMutation";
import useQuery from "../../hooks/useQuery";
import {
  API_ACTIVITY_CREATE,
  API_DEALS_LIST,
  API_CONTACTS_LIST,
} from "../../imports/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";

const schema = yup.object().shape({
  type: yup.string().required("Activity type is required"),
  subject: yup
    .string()
    .required("Subject is required")
    .min(3, "Subject must be at least 3 characters"),
  content: yup
    .string()
    .required("Content is required")
    .min(5, "Content must be at least 5 characters"),
  duration_minutes: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .nullable()
    .min(0, "Duration cannot be negative")
    .max(480, "Duration cannot exceed 8 hours (480 minutes)"),
  next_steps: yup.string(),
  deal_id: yup.string().nullable(),
  contact_id: yup.string().nullable(),
});

const ActivityForm = ({
  isOpen,
  onClose,
  onSuccess,
  initialData = {},
  dealId = null,
  contactId = null,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activityType, setActivityType] = useState(initialData.type || "note");
  const [selectedDealId, setSelectedDealId] = useState(dealId || initialData.deal_id || "");
  const [selectedContactId, setSelectedContactId] = useState(contactId || initialData.contact_id || "");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      type: "note",
      subject: "",
      content: "",
      duration_minutes: 0,
      next_steps: "",
      deal_id: null,
      contact_id: null,
    },
  });

  // Fetch deals for dropdown
  const { data: dealsData } = useQuery(API_DEALS_LIST);

  // Fetch contacts for dropdown
  const { data: contactsData } = useQuery(API_CONTACTS_LIST);

  const deals = dealsData?.data?.data?.deals || [];
  const contacts = contactsData?.data?.data?.contacts || [];

  // Create activity mutation
  const { mutate } = useMutation({
    url: API_ACTIVITY_CREATE,
  });

  // Handle form reset when dialog opens
  useEffect(() => {
    if (isOpen) {
      setActivityType(initialData.type || "note");
      setSelectedDealId(dealId || initialData.deal_id || "");
      setSelectedContactId(contactId || initialData.contact_id || "");
      
      reset({
        type: initialData.type || "note",
        subject: initialData.subject || "",
        content: initialData.content || "",
        duration_minutes: initialData.duration_minutes || 0,
        next_steps: initialData.next_steps || "",
        deal_id: dealId || initialData.deal_id || null,
        contact_id: contactId || initialData.contact_id || null,
      });
    }
  }, [isOpen, initialData, dealId, contactId, reset]);

  // Handle type change
  const handleTypeChange = (value) => {
    setActivityType(value);
    setValue("type", value);
  };

  // Handle deal change
  const handleDealChange = (value) => {
    setSelectedDealId(value);
    setValue("deal_id", value === "" ? null : value);
  };

  // Handle contact change
  const handleContactChange = (value) => {
    setSelectedContactId(value);
    setValue("contact_id", value === "" ? null : value);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      await mutate(data);
      onSuccess && onSuccess();
      onClose();
      reset();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Log Activity</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
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
            {!dealId && (
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
            )}

            {/* Related Contact */}
            {!contactId && (
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
            )}
          </div>

          {/* Form Actions */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Activity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityForm;
