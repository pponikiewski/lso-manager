import { MinistrantsList } from "@/components/ministrants/ministrants-list";
import { AddMinistrantDialog } from "@/components/ministrants/add-ministrant-dialog"; // <--- Import

export default function Home() {
  return (
    <main className="container mx-auto py-10 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">LSO Manager</h1>
        <AddMinistrantDialog /> {/* <--- Przycisk z modalem */}
      </div>
      
      <MinistrantsList />
    </main>
  );
}