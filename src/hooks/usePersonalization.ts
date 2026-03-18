import { useEffect, useState } from "react";
import {
  getIntentScore,
  getIntentStage,
  getPersonalizedSuggestions,
  hasPersonalizationSignal,
  readPersonalizationProfile,
  subscribeToPersonalizationUpdates,
} from "@/lib/personalization";

export function usePersonalization() {
  const [profile, setProfile] = useState(readPersonalizationProfile);

  useEffect(() => {
    return subscribeToPersonalizationUpdates(() => {
      setProfile(readPersonalizationProfile());
    });
  }, []);

  return {
    profile,
    hasSignal: hasPersonalizationSignal(profile),
    suggestions: getPersonalizedSuggestions(profile),
    intentScore: getIntentScore(profile),
    intentStage: getIntentStage(profile),
  };
}
