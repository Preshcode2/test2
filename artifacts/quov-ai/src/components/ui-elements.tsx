import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "secondary" | "outline" | "ghost" | "destructive", size?: "default" | "sm" | "lg" | "icon", isLoading?: boolean }>(
  ({ className, variant = "default", size = "default", isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-95",
          {
            "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:brightness-110": variant === "default",
            "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
            "border border-border bg-transparent hover:bg-secondary/50 text-foreground": variant === "outline",
            "bg-transparent hover:bg-secondary/50 text-foreground": variant === "ghost",
            "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/20": variant === "destructive",
            "h-11 px-5 py-2": size === "default",
            "h-9 px-3 text-sm rounded-lg": size === "sm",
            "h-14 px-8 text-lg rounded-2xl": size === "lg",
            "size-11": size === "icon",
          },
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-12 w-full rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-xl shadow-black/20 overflow-hidden relative", className)} {...props}>
    {children}
  </div>
);

export const Badge = ({ className, children, variant = "default" }: { className?: string, children: React.ReactNode, variant?: "default" | "outline" | "secondary" | "success" }) => (
  <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors", {
    "bg-primary/20 text-primary border border-primary/30": variant === "default",
    "border border-border text-foreground": variant === "outline",
    "bg-secondary text-secondary-foreground": variant === "secondary",
    "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30": variant === "success",
  }, className)}>
    {children}
  </span>
);
