import { ConvexReactClient } from "convex/react";

// Assume CONVEX_URL is available in the environment or provide a default for initialization
const convexUrl = (process.env.CONVEX_URL as string) || "https://placeholder-url.convex.cloud";

export const convex = new ConvexReactClient(convexUrl);