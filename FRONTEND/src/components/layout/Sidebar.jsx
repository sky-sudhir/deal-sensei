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
} from "lucide-react";
import { Button } from "../ui/button";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const [activeGroup, setActiveGroup] = useState(null);
  const { user } = useSelector((state) => state.user);
  const isAdmin = user?.role === 'admin';

  // Define sidebar navigation items
  const sidebarItems = [
    {
      title: "Overview",
      items: [
        {
          name: "Home",
          path: "/home",
          icon: LayoutDashboard,
        },
        {
          name: "Dashboard",
          path: "/dashboard",
          icon: PieChart,
        },
        {
          name: "Analytics",
          path: "/analytics",
          icon: PieChart,
        },
      ],
    },
    {
      title: "Sales",
      items: [
        {
          name: "Deals",
          path: "/deals",
          icon: DollarSign,
        },
        {
          name: "Pipelines",
          path: "/pipelines",
          icon: Layers,
        },
      ],
    },
    {
      title: "Contacts",
      items: [
        {
          name: "Contacts",
          path: "/contacts",
          icon: Users,
        },
        {
          name: "Activities",
          path: "/activities",
          icon: Calendar,
        },
      ],
    },
    {
      title: "Communication",
      items: [
        {
          name: "Messages",
          path: "/messages",
          icon: MessageSquare,
        },
        {
          name: "Documents",
          path: "/documents",
          icon: FileText,
        },
      ],
    },
    ...(isAdmin ? [
      {
        title: "Administration",
        items: [
          {
            name: "Team Management",
            path: "/team",
            icon: UserCog,
          },
        ],
      },
    ] : []),
  ];

  // Toggle sidebar group
  const toggleGroup = (title) => {
    setActiveGroup(activeGroup === title ? null : title);
  };

  // Check if path is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Initialize active group based on current path
  useEffect(() => {
    const currentGroup = sidebarItems.find((group) =>
      group.items.some((item) => isActive(item.path))
    );

    if (currentGroup) {
      setActiveGroup(currentGroup.title);
    }
  }, [location.pathname]);

  return (
    <aside
      className={cn(
        "h-full bg-card border-r border-border/40 transition-all duration-300 ease-in-out",
        "flex flex-col shadow-md overflow-hidden",
        isOpen ? "w-64" : "md:w-16 w-0", // Full width when open, 16px on desktop or 0 on mobile when closed
        !isOpen && "-translate-x-full md:translate-x-0" // Hide on mobile when closed
      )}
    >
      {/* Close button for mobile */}
      <button
        onClick={() => setIsOpen(false)}
        className="md:hidden absolute right-2 top-2 p-2 rounded-full bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-foreground"
      >
        <X size={18} />
      </button>
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border/40 bg-gradient-to-r from-background to-background/50">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
            DS
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            DealSensei
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        <nav className="space-y-1">
          {sidebarItems.map((group) => (
            <div key={group.title} className="mb-4">
              <button
                onClick={() => toggleGroup(group.title)}
                className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50"
              >
                <span>{group.title}</span>
                {activeGroup === group.title ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>

              {activeGroup === group.title && (
                <div className="mt-1 ml-2 space-y-1">
                  {group.items.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 text-sm rounded-md transition-all duration-200",
                        "hover:bg-muted/60 group",
                        isActive(item.path)
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground/80"
                      )}
                    >
                      <div
                        className={cn(
                          "p-1.5 rounded-md transition-colors",
                          isActive(item.path)
                            ? "bg-primary/20 text-primary shadow-sm"
                            : "bg-muted/40 text-muted-foreground group-hover:text-foreground group-hover:shadow-sm"
                        )}
                      >
                        <item.icon size={16} />
                      </div>
                      <span>{item.name}</span>

                      {isActive(item.path) && (
                        <div className="absolute right-0 w-1.5 h-8 bg-primary rounded-l-md shadow-[0_0_8px_rgba(var(--primary)/0.5)]"></div>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Settings */}
      <div className="p-4 border-t border-border/40 bg-gradient-to-r from-background to-background/50">
        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-3 px-4 py-2 text-sm rounded-md transition-all duration-200",
            "hover:bg-muted/60",
            isActive("/settings")
              ? "bg-primary/10 text-primary font-medium"
              : "text-foreground/80"
          )}
        >
          <div
            className={cn(
              "p-1.5 rounded-md transition-colors",
              isActive("/settings")
                ? "bg-primary/20 text-primary shadow-sm"
                : "bg-muted/40 text-muted-foreground hover:shadow-sm"
            )}
          >
            <Settings size={16} />
          </div>
          <span>Settings</span>
        </Link>
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
          className="h-8 w-8 rounded-full shadow-lg border border-border"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </Button> */}
      </div>
    </aside>
  );
};

export default Sidebar;
