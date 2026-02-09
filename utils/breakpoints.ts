/**
 * Tailwind CSS Standard Breakpoints
 * These breakpoints are used for responsive design across the application
 */

export const BREAKPOINTS = {
  // Tailwind standard breakpoints
  sm: 640,      // Small devices
  md: 768,      // Medium devices (tablets)
  lg: 1024,     // Large devices (small laptops)
  xl: 1280,     // Extra large devices (desktops)
  '2xl': 1536,  // 2X large devices (large screens)
} as const;

/**
 * Sidebar visibility breakpoint
 * Sidebar is collapsed by default below this breakpoint
 */
export const SIDEBAR_BREAKPOINT = BREAKPOINTS.xl; // 1280px
