import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import useMutation from "../../hooks/useMutation";
import { API_USER_CREATE } from "../../imports/api";

// Schema for user invitation validation
const inviteUserSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup
    .string()
    .email("Must be a valid email")
    .required("Email is required"),
  role: yup
    .string()
    .oneOf(["admin", "sales_rep"], "Invalid role")
    .required("Role is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

const InviteUserForm = ({ onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(inviteUserSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "sales_rep",
      password: "",
    },
  });

  // Create user mutation
  const { mutate: createUser, loading } = useMutation();

  const onSubmit = async (data) => {
    try {
      const result = await createUser({
        url: API_USER_CREATE,
        method: "POST",
        data,
      });

      if (result.success) {
        onSuccess();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register("password")} />
        {/* <p className="text-xs text-muted-foreground">
          User will be prompted to change this password on first login
        </p> */}
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" disabled={loading}>
          Invite User
        </Button>
      </div>
    </form>
  );
};

export default InviteUserForm;
