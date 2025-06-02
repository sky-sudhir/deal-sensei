import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Moon,
  Sun,
  Bell,
  Search,
  Menu,
  User,
  LogOut,
  Settings as SettingsIcon,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { logout } from "@/redux/features/user/userSlice";

const Topbar = ({ toggleSidebar, isSidebarOpen, isMobile }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // Handle theme toggle
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
  };

  // Only render UI after mounted to prevent hydration mismatch
  if (!mounted) return null;

  return (
    <div className="flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 shadow-sm w-full">
      {/* Left section with mobile menu toggle and search */}
      <div className="flex items-center gap-2 lg:gap-4">
        <Button
          variant="default"
          size="icon"
          onClick={toggleSidebar}
          className={cn(
            "relative shadow-lg",
            isMobile ? "bg-primary text-white" : "md:hidden"
          )}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>

        {/* <div className="flex relative max-w-md z-10">
          <Input
            type="text"
            placeholder="Search..."
            className="pl-10 w-[200px] focus:w-[280px] transition-all duration-300 shadow-sm hover:shadow"
            icon={Search}
          />
        </div> */}
      </div>

      {/* Right section with notifications, theme toggle, and profile */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full hover:bg-muted/80 shadow-sm"
        >
          {isDarkMode ? (
            <Sun size={20} className="text-amber-500" />
          ) : (
            <Moon size={20} className="text-indigo-400" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-10 rounded-full shadow-sm hover:shadow hover:bg-muted/50"
            >
              <Avatar className="h-10 w-10 border-2 border-primary/20 shadow-sm">
                <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary/80 to-accent/80 text-foreground">
                  {user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 shadow-lg border border-border/60"
            align="end"
            forceMount
            sideOffset={8}
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => dispatch(logout())}
              className="text-destructive flex items-center gap-2"
            >
              <LogOut size={16} />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Topbar;
