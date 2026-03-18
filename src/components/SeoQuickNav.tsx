import { Link } from "react-router-dom";

type QuickLink = {
  label: string;
  href: string;
};

type SeoQuickNavProps = {
  links: QuickLink[];
};

const SeoQuickNav = ({ links }: SeoQuickNavProps) => {
  return (
    <div className="border-y border-border/35 bg-card/30">
      <div className="container py-4">
        <div className="flex flex-wrap gap-3">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="rounded-full border border-border/40 bg-background px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeoQuickNav;
