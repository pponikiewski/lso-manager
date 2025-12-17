import { DashboardLayout, Header } from "@/components/layout";
import { MinistrantsList } from "@/components/ministrants/ministrants-list";
import { AddMinistrantDialog } from "@/components/ministrants/add-ministrant-dialog";

export default function MinistrantsPage() {
  return (
    <DashboardLayout>
      <Header
        title="Ministranci"
        description="Zarządzanie listą ministrantów i ich grupami"
      />
      
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              Przeglądaj i zarządzaj ministrantami w systemie
            </p>
          </div>
          <AddMinistrantDialog />
        </div>
        
        <MinistrantsList />
      </div>
    </DashboardLayout>
  );
}
