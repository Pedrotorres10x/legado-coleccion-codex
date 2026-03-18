import { useLocation } from "react-router-dom";
import usePageTracking from "@/hooks/usePageTracking";

const PageTracker = () => {
  usePageTracking();
  return null;
};

export default PageTracker;
