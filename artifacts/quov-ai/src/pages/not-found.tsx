import { useLocation } from "wouter";
import { Button } from "@/components/ui-elements";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 text-center p-8 max-w-md">
        <div className="size-20 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="size-10 text-destructive" />
        </div>
        <div>
          <h1 className="text-4xl font-display font-bold text-white">404</h1>
          <p className="text-lg text-muted-foreground mt-2">Page not found</p>
        </div>
        <Button onClick={() => setLocation("/")}>Go Home</Button>
      </div>
    </div>
  );
}
