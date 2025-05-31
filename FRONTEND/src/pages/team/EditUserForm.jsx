import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import useMutation from "../../hooks/useMutation";
import { API_USER_UPDATE } from "../../imports/api";

// Schema for user edit validation
const editUserSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup
    .string()
    .email("Must be a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .nullable()
    .transform((value) => (value === "" ? null : value)),
  is_active: yup.boolean(),
});

const EditUserForm = ({ user, onSuccess }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(editUserSchema),
    defaultValues: {
      name: user.name || "",
      email: user.email || "",
      password: "",
      is_active: user.is_active || false,
    },
  });

  // Update user mutation
  const { mutate: updateUser, loading } = useMutation();

  const onSubmit = async (data) => {
    // Remove password if it's empty
    const formData = { ...data };
    if (!formData.password) {
      delete formData.password;
    }
    
    // Ensure is_active is properly sent as a boolean
    formData.is_active = Boolean(formData.is_active);

    try {
      const result = await updateUser({
        url: `${API_USER_UPDATE}${user._id}`,
        method: "PUT",
        data: formData,
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
        <Label htmlFor="password">New Password (Optional)</Label>
        <Input id="password" type="password" {...register("password")} />
        <p className="text-xs text-muted-foreground">
          Leave blank to keep current password
        </p>
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Controller
          name="is_active"
          control={control}
          render={({ field }) => (
            <Switch
              id="is_active"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Label htmlFor="is_active">Active Account</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" disabled={loading}>
          Update User
        </Button>
      </div>
    </form>
  );
};

export default EditUserForm;
