import { MinistrantsList } from "@/components/ministrants/ministrants-list";

export default function Home() {
  return (
    <main className="container mx-auto py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">LSO Manager</h1>
      <MinistrantsList />
    </main>
  );
}