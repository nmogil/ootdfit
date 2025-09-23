import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { CollageGrid } from "./CollageGrid";
import { NewCollageForm } from "./NewCollageForm";
import { CollageDetails } from "./CollageDetails";
import { Id } from "../convex/_generated/dataModel";

export function Dashboard() {
  const [view, setView] = useState<"grid" | "new" | "details">("grid");
  const [selectedCollageId, setSelectedCollageId] = useState<Id<"collages"> | null>(null);
  
  const collages = useQuery(api.collages.getUserCollages);

  if (collages === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleViewCollage = (collageId: Id<"collages">) => {
    setSelectedCollageId(collageId);
    setView("details");
  };

  const handleBackToGrid = () => {
    setView("grid");
    setSelectedCollageId(null);
  };

  const handleNewCollage = () => {
    setView("new");
  };

  const handleCollageCreated = () => {
    setView("grid");
  };

  return (
    <div className="space-y-6">
      {view === "grid" && (
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-primary">Your Collages</h1>
            <button
              onClick={handleNewCollage}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-semibold"
            >
              Create New Collage
            </button>
          </div>
          <CollageGrid collages={collages} onViewCollage={handleViewCollage} />
        </>
      )}

      {view === "new" && (
        <NewCollageForm 
          onBack={handleBackToGrid}
          onCollageCreated={handleCollageCreated}
        />
      )}

      {view === "details" && selectedCollageId && (
        <CollageDetails 
          collageId={selectedCollageId}
          onBack={handleBackToGrid}
        />
      )}
    </div>
  );
}
