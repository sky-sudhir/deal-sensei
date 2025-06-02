import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { contactSchema } from "@/schemas/contactSchema";
import useMutation from "@/hooks/useMutation";
import useQuery from "@/hooks/useQuery";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

const ContactForm = ({
  isOpen,
  onClose,
  onSuccess,
  initialData = null,
  isEdit = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get team members for owner selection (admin only)
  const { data: teamData } = useQuery("api/v1/users?showAll=true");
  const teamMembers = teamData?.data || [];

  // Setup form with validation
  const form = useForm({
    resolver: yupResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      notes: "",
      owner_id: "",
    },
  });

  // Setup mutation for create/update
  const { mutate } = useMutation();

  // Set form values if editing
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        notes: initialData.notes || "",
        owner_id: initialData.owner_id || "",
      });
    }
  }, [initialData, form]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const endpoint = isEdit
        ? { url: `api/v1/contacts/${initialData._id}`, method: "PUT", data }
        : { url: "api/v1/contacts", method: "POST", data };

      const response = await mutate(endpoint);

      if (response.success) {
        if (onSuccess) {
          onSuccess(response.data);
        }

        onClose();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[525px]" onClose={handleOpenChange}>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Contact" : "Add New Contact"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Contact name"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              placeholder="Enter phone number"
              {...form.register("phone")}
            />
            {form.formState.errors.phone && (
              <p className="text-sm text-destructive">
                {form.formState.errors.phone.message}
              </p>
            )}
          </div>

          {/* Owner selection (admin only) */}
          {teamMembers.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="owner_id">Owner</Label>
              <Controller
                control={form.control}
                name="owner_id"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <SelectTrigger id="owner_id">
                      <SelectValue placeholder="Select an owner" />
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

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional information about this contact"
              className="min-h-[100px]"
              {...form.register("notes")}
            />
            {form.formState.errors.notes && (
              <p className="text-sm text-destructive">
                {form.formState.errors.notes.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEdit
                ? "Update Contact"
                : "Add Contact"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactForm;
