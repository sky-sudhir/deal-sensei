import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { useSelector } from "react-redux";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Calendar,
  Settings,
  PieChart,
  Layers,
  MessageSquare,
  FileText,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  UserCog,
  Brain,
  IndianRupee,
} from "lucide-react";
import { Button } from "../ui/button";
import { motion } from "framer-motion";

// Function to get section-specific colors
const getSectionColor = (section) => {
  return {
    gradient: "from-primary via-primary/90 to-accent",
    hoverGradient: "from-accent via-primary/90 to-primary",
    textColor: "text-primary",
    bgLight: "bg-primary-50",
    bgDark: "dark:bg-primary-950/20",
    borderColor: "border-primary-200 dark:border-primary-800",
    shadowColor: "shadow-primary/20",
  };
};

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { user } = useSelector((state) => state.user);
  const isAdmin = user?.role === "admin";

  // Define flattened sidebar navigation items
  const sidebarItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: PieChart,
      section: "Overview",
    },
    {
      name: "Pipelines",
      path: "/pipelines",
      icon: Layers,
      section: "Sales",
    },
    {
      name: "Contacts",
      path: "/contacts",
      icon: Users,
      section: "Contacts",
    },
    {
      name: "Deals",
      path: "/deals",
      icon: IndianRupee,
      section: "Sales",
    },
    {
      name: "Activities",
      path: "/activities",
      icon: Calendar,
      section: "Activities",
    },
    {
      name: "Files",
      path: "/files",
      icon: FileText,
      section: "Activities",
    },
    {
      name: "AI Tools",
      path: "/ai-tools",
      icon: Brain,
      section: "AI Tools",
    },
    ...(isAdmin
      ? [
          {
            name: "Team Management",
            path: "/team",
            icon: UserCog,
            section: "Administration",
          },
        ]
      : []),
  ];

  // Check if path is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside
      className={cn(
        "h-full bg-gradient-to-b from-card via-card/95 to-card/90 border-r border-border/40 transition-all duration-300 ease-in-out",
        "flex flex-col shadow-lg overflow-hidden backdrop-blur-sm relative",
        isOpen ? "w-64" : "md:w-16 w-0", // Full width when open, 16px on desktop or 0 on mobile when closed
        !isOpen && "-translate-x-full md:translate-x-0" // Hide on mobile when closed
      )}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0"></div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent/0 via-accent/30 to-accent/0"></div>
      <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-gradient-to-b from-primary/30 via-primary/0 to-primary/0"></div>
      <div className="absolute top-0 bottom-0 right-0 w-0.5 bg-gradient-to-b from-accent/0 via-accent/0 to-accent/30"></div>
      {/* Close button for mobile */}
      <button
        onClick={() => setIsOpen(false)}
        className="md:hidden absolute right-2 top-2 p-2 rounded-full bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:bg-background/90 hover:shadow-md transition-all duration-300 z-50"
      >
        <X
          size={18}
          className="transition-transform duration-300 hover:rotate-90"
        />
      </button>
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border/40 bg-gradient-to-r from-background/80 to-background/30 backdrop-blur-sm relative overflow-hidden">
        {/* Subtle background animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/0 to-primary/5 animate-pulse-slow opacity-30"></div>

        <Link
          to="/dashboard"
          className="flex items-center gap-2 group relative z-10"
        >
          <div className="w-9 h-9 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110 relative overflow-hidden">
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            {/* Shine effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <div className="absolute inset-0 translate-x-full group-hover:translate-x-[-180%] transition-transform duration-1500 bg-white/20 skew-x-[45deg]"></div>
            </div>
            <span className="relative z-10">DS</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent group-hover:from-accent group-hover:to-primary transition-all duration-500 relative">
            DealSensei
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-500 rounded-full"></span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:20px_20px]"></div>
        <nav className="space-y-3 relative z-10">
          {sidebarItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm rounded-md transition-all duration-300",
                "group relative overflow-hidden",
                isActive(item.path)
                  ? `bg-gradient-to-r from-${
                      getSectionColor(item.section).bgLight
                    } to-transparent dark:from-${
                      getSectionColor(item.section).bgDark
                    } dark:to-transparent text-foreground font-medium shadow-sm`
                  : "text-foreground/80 hover:bg-muted/30"
              )}
            >
              {/* Hover effect - subtle gradient */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-r from-primary/20 via-background to-accent/20"></div>

              {/* Icon container with gradient background */}
              <div
                className={cn(
                  "p-1.5 rounded-md transition-all duration-300 relative overflow-hidden",
                  isActive(item.path)
                    ? `bg-gradient-to-r ${
                        getSectionColor(item.section).gradient
                      } text-white shadow-md`
                    : "bg-muted/40 text-muted-foreground group-hover:text-foreground group-hover:shadow-sm group-hover:bg-muted/60"
                )}
              >
                {/* Animated gradient overlay on hover */}
                {!isActive(item.path) && (
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${
                      getSectionColor(item.section).gradient
                    } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  ></div>
                )}

                {/* Shine effect for active items */}
                {isActive(item.path) && (
                  <div className="absolute inset-0 opacity-100">
                    <div className="absolute inset-0 translate-x-full animate-shimmer-slow bg-white/20 skew-x-[45deg]"></div>
                  </div>
                )}

                <item.icon
                  size={16}
                  className={cn(
                    "relative z-10 transition-all duration-300",
                    !isActive(item.path) && "group-hover:text-white"
                  )}
                />
              </div>

              {/* Item name with underline effect on hover */}
              <span className="relative">
                {item.name}
                <span
                  className={`absolute bottom-0 left-0 w-0 h-0.5 ${
                    isActive(item.path)
                      ? getSectionColor(item.section).gradient
                      : "bg-foreground/30"
                  } group-hover:w-full transition-all duration-500 rounded-full opacity-70`}
                ></span>
              </span>

              {/* Active indicator - right border */}
              {isActive(item.path) && (
                <div
                  className={`absolute right-0 top-0 w-1 h-full bg-gradient-to-b ${
                    getSectionColor(item.section).gradient
                  }`}
                />
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* Sidebar toggle for desktop */}
      <div
        className={cn(
          "absolute top-1/2 -right-3 transform -translate-y-1/2 hidden md:block z-50",
          !isOpen && "right-auto left-3"
        )}
      >
        {/* <Button
          size="icon"
          variant="default"
          className="h-8 w-8 rounded-full shadow-lg border border-border bg-gradient-to-r from-primary/80 to-accent/80 text-white hover:shadow-xl transition-all duration-300 hover:scale-110"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping-slow opacity-75"></span>
        </Button> */}
      </div>
    </aside>
  );
};

export default Sidebar;
