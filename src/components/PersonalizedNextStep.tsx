import { ArrowRight, Compass, Home, MapPinned } from "lucide-react";
import { Link } from "react-router-dom";
import { usePersonalization } from "@/hooks/usePersonalization";

const iconMap = {
  property: Home,
  area: MapPinned,
  guide: Compass,
  catalog: ArrowRight,
} as const;

type PersonalizedNextStepProps = {
  title?: string;
  description?: string;
};

const PersonalizedNextStep = ({
  title = "Pick up where the search starts making sense",
  description = "A better next step is not another generic reset. It is the route that takes you back to the right homes with the context you already have.",
}: PersonalizedNextStepProps) => {
  const { hasSignal, suggestions, intentStage, intentScore } = usePersonalization();

  if (!hasSignal || suggestions.length === 0) return null;

  const dynamicTitle =
    intentStage === "late"
      ? "This already looks close to a real shortlist"
      : intentStage === "mid"
        ? "Your search already has real direction"
        : title;
  const dynamicDescription =
    intentStage === "late"
      ? "We are seeing strong buying signals here. The best next move is not more browsing for the sake of it, but opening the right property pages and deciding which homes deserve a proper enquiry."
      : intentStage === "mid"
        ? "There is already enough context to stop treating this like a cold start. Use these next steps to get back into the right homes faster."
        : description;
  const stageLabel =
    intentStage === "late" ? "High intent" : intentStage === "mid" ? "Shortlist building" : "Early direction";

  return (
    <section className="py-10 sm:py-12 md:py-16">
      <div className="container">
        <div className="rounded-[28px] sm:rounded-[32px] border border-primary/20 bg-[linear-gradient(180deg,rgba(255,248,235,0.95),rgba(255,255,255,0.92))] p-5 sm:p-8 md:p-10">
          <div className="max-w-3xl">
            <p className="text-[11px] sm:text-sm font-semibold uppercase tracking-[0.18em] sm:tracking-[0.24em] text-primary">
              Personalized next step
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                {stageLabel}
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Intent score {intentScore}/100
              </span>
            </div>
            <h2 className="mt-4 font-serif text-[1.9rem] sm:text-3xl font-semibold md:text-4xl leading-[1.08]">{dynamicTitle}</h2>
            <p className="mt-4 text-sm sm:text-base leading-6 sm:leading-7 text-muted-foreground">{dynamicDescription}</p>
          </div>

          <div className="mt-8 grid gap-4 sm:gap-5 md:grid-cols-3">
            {suggestions.map((suggestion) => {
              const Icon = iconMap[suggestion.kind];

              return (
                <Link
                  key={suggestion.href}
                  to={suggestion.href}
                  className="rounded-[24px] sm:rounded-[26px] border border-border/35 bg-background p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
                  </div>
                  <h3 className="mt-4 sm:mt-5 font-serif text-xl sm:text-2xl font-semibold leading-tight">{suggestion.title}</h3>
                  <p className="mt-3 text-sm leading-6 sm:leading-7 text-muted-foreground">{suggestion.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PersonalizedNextStep;
