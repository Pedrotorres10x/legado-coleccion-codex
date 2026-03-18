import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
  onCheckedChange?: (checked: boolean) => void;
};

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, disabled, ...props }, ref) => (
    <label
      className={cn(
        "relative inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-primary ring-offset-background",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        checked ? "bg-primary text-primary-foreground" : "bg-background",
        className
      )}
    >
      <input
        ref={ref}
        type="checkbox"
        className="peer absolute inset-0 h-full w-full cursor-inherit opacity-0"
        checked={checked === true}
        disabled={disabled}
        onChange={(event) => onCheckedChange?.(event.target.checked)}
        {...props}
      />
      <Check className={cn("h-4 w-4 transition-opacity", checked ? "opacity-100" : "opacity-0")} />
    </label>
  )
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
