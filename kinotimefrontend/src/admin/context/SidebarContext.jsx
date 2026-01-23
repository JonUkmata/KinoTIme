import { createContext, useContext, useMemo, useState } from "react";

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => setIsExpanded((prev) => !prev);
  const toggleMobileSidebar = () => setIsMobileOpen((prev) => !prev);

  const value = useMemo(
    () => ({
      isExpanded,
      isHovered,
      isMobileOpen,
      setIsHovered,
      toggleSidebar,
      toggleMobileSidebar,
    }),
    [isExpanded, isHovered, isMobileOpen]
  );

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
}
