import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input, PasswordInput } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Briefcase, User } from "lucide-react";
import useMutation from "@/hooks/useMutation";
import { USERS_SIGNUP } from "@/imports/api";

const signupSchema = yup.object({
  company: yup.object({
    name: yup.string().required("Company name is required"),
    email: yup
      .string()
      .email("Must be a valid email")
      .required("Company email is required"),
  }),
  admin: yup.object({
    name: yup.string().required("Admin name is required"),
    email: yup
      .string()
      .email("Must be a valid email")
      .required("Admin email is required"),
    password: yup
      .string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
  }),
  termsAccepted: yup
    .boolean()
    .oneOf([true], "You must accept the terms and conditions"),
});

const Signup = () => {
  const navigate = useNavigate();
  const { mutate, loading } = useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signupSchema),
    defaultValues: {
      company: {
        name: "",
        email: "",
      },
      admin: {
        name: "",
        email: "",
        password: "",
      },
      termsAccepted: false,
    },
  });

  const onSubmit = async (data) => {
    // Remove termsAccepted from the payload
    const { termsAccepted, ...signupData } = data;

    const resultAction = await mutate({
      data: signupData,
      method: "POST",
      url: USERS_SIGNUP,
    });

    if (resultAction.success) {
      // Navigate to email verification page
      navigate("/verify-email-sent", {
        state: { email: data.company.email },
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background/95 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background px-4 ">
      {/* Header */}
      <header className="container mx-auto py-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
            DS
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            DealSensei
          </span>
        </Link>
      </header>

      {/* Signup Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-6 bg-card p-8 rounded-xl shadow-lg border border-border/40 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-primary/5 blur-2xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-accent/5 blur-2xl"></div>
          <div className="text-center relative">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Create your DealSensei Account
            </h1>
            <p className="text-muted-foreground mt-2">
              Start your free trial. No credit card required.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Company Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Briefcase size={18} className="text-primary" />
                <span>Company Information</span>
              </h2>

              <div className="space-y-2">
                <Label htmlFor="company.name">Company Name</Label>
                <Input
                  id="company.name"
                  placeholder="Acme Inc."
                  {...register("company.name")}
                  error={errors.company?.name?.message}
                  className="shadow-sm hover:shadow"
                />
                {errors.company?.name && (
                  <p className="text-sm text-destructive">
                    {errors.company.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="company.email">Company Email</Label>
                <Input
                  id="company.email"
                  type="email"
                  placeholder="company@example.com"
                  {...register("company.email")}
                  className="shadow-sm hover:shadow"
                />
                {errors.company?.email && (
                  <p className="text-sm text-destructive">
                    {errors.company.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Admin Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <User size={18} className="text-primary" />
                <span>Admin Account</span>
              </h2>

              <div className="space-y-2">
                <Label htmlFor="admin.name">Your Name</Label>
                <Input
                  id="admin.name"
                  placeholder="John Doe"
                  {...register("admin.name")}
                  className="shadow-sm hover:shadow"
                />
                {errors.admin?.name && (
                  <p className="text-sm text-destructive">
                    {errors.admin.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin.email">Your Email</Label>
                <Input
                  id="admin.email"
                  type="email"
                  placeholder="you@example.com"
                  {...register("admin.email")}
                  className="shadow-sm hover:shadow"
                />
                {errors.admin?.email && (
                  <p className="text-sm text-destructive">
                    {errors.admin.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin.password">Password</Label>
                <div className="relative">
                  <PasswordInput
                    id="admin.password"
                    placeholder="••••••••"
                    {...register("admin.password")}
                    className="shadow-sm hover:shadow"
                  />
                </div>
                {errors.admin?.password && (
                  <p className="text-sm text-destructive">
                    {errors.admin.password.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters
                </p>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-2 pb-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="termsAccepted"
                  onCheckedChange={(checked) => {
                    // This ensures the register function gets the correct value
                    const event = {
                      target: {
                        name: "termsAccepted",
                        value: checked,
                      },
                    };
                    register("termsAccepted").onChange(event);
                  }}
                />
                <label
                  htmlFor="termsAccepted"
                  className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the Terms of Service and Privacy Policy
                </label>
              </div>
              {errors.termsAccepted && (
                <p className="text-sm text-destructive absolute mt-6">
                  {errors.termsAccepted.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full shadow-md hover:shadow-lg transition-all"
              loading={loading}
              gradient={true}
            >
              Create Account
            </Button>
          </form>

          <div className="text-center text-sm">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
