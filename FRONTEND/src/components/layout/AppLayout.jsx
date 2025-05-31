import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import { cn } from "../../lib/utils";

/**
 * AppLayout component that wraps protected routes with Topbar and Sidebar
 * Provides consistent layout for authenticated pages
 */
const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if the screen is mobile size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Initial check
    checkMobile();

    // Add resize listener
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Toggle sidebar function for Topbar component
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed position sidebar */}
      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      </div>

      {/* Main content wrapper with margin for sidebar */}
      <div
        className={cn(
          "min-h-screen flex flex-col transition-all duration-300",
          sidebarOpen ? "md:ml-64" : "ml-0 md:ml-16"
        )}
      >
        {/* Fixed position topbar */}
        <div className="sticky top-0 z-40 w-full">
          <Topbar
            toggleSidebar={toggleSidebar}
            isSidebarOpen={sidebarOpen}
            isMobile={isMobile}
          />
        </div>

        {/* Overlay for mobile when sidebar is open */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 px-4 md:px-6">
          <div className="max-w-6xl mx-auto py-4 md:py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
