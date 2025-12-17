import { MinistrantsList } from "@/components/ministrants/ministrants-list";
import { AddMinistrantDialog } from "@/components/ministrants/add-ministrant-dialog";
import { SundaySchedule } from "@/components/schedule/sunday-schedule"; // <--- Import grafiku
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // <--- Import zakładek

export default function Home() {
  return (
    <main className="container mx-auto py-10 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          LSO Manager
        </h1>
        {/* Przycisk dodawania zostawiamy widoczny zawsze, ale można go schować w zakładce */}
        <AddMinistrantDialog /> 
      </div>
      
      <Tabs defaultValue="ministrants" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="ministrants">Lista Ministrantów</TabsTrigger>
          <TabsTrigger value="schedule">Grafik Niedzielny</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ministrants">
          <MinistrantsList />
        </TabsContent>
        
        <TabsContent value="schedule">
          <SundaySchedule />
        </TabsContent>
      </Tabs>
    </main>
  );
}