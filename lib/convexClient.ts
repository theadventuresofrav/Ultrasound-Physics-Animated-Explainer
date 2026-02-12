import { ConvexReactClient } from "convex/react";

// Assume CONVEX_URL is available in the environment or provide a default for initialization
const convexUrl = (import.meta as any).env?.VITE_CONVEX_URL || (typeof process !== 'undefined' ? process.env?.CONVEX_URL : undefined) || "https://placeholder-url.convex.cloud";

export const convex = new ConvexReactClient(convexUrl);