import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">LSO Manager</h1>
      <p className="text-muted-foreground">System zarządzania służbą liturgiczną</p>
      <div className="flex gap-2">
        <Button>Zaloguj się</Button>
        <Button variant="outline">Dokumentacja</Button>
      </div>
    </div>
  );
}