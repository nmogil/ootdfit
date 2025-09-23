import { Id } from "../convex/_generated/dataModel";

interface Collage {
  _id: Id<"collages">;
  _creationTime: number;
  status: "generating" | "completed" | "failed";
  originalImageUrl: string | null;
  collageImageUrl: string | null;
  products: Array<{
    name: string;
    brand: string;
  }>;
}

interface CollageGridProps {
  collages: Collage[];
  onViewCollage: (collageId: Id<"collages">) => void;
}

export function CollageGrid({ collages, onViewCollage }: CollageGridProps) {
  if (collages.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">👗</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No collages yet</h3>
        <p className="text-gray-500">Create your first OOTD collage to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {collages.map((collage) => (
        <div
          key={collage._id}
          className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
          onClick={() => onViewCollage(collage._id)}
        >
          <div className="aspect-square bg-gray-100 relative">
            {collage.status === "completed" && collage.collageImageUrl ? (
              <img
                src={collage.collageImageUrl}
                alt="Generated collage"
                className="w-full h-full object-cover"
              />
            ) : collage.originalImageUrl ? (
              <img
                src={collage.originalImageUrl}
                alt="Original outfit"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-4xl">👗</div>
              </div>
            )}
            
            {collage.status === "generating" && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto mb-2"></div>
                  <p className="text-sm">Generating...</p>
                </div>
              </div>
            )}
            
            {collage.status === "failed" && (
              <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                <div className="text-red-600 text-center">
                  <div className="text-2xl mb-1">⚠️</div>
                  <p className="text-sm">Failed</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4">
            <div className="text-sm text-gray-500 mb-2">
              {new Date(collage._creationTime).toLocaleDateString()}
            </div>
            <div className="text-sm text-gray-600">
              {collage.products.length} item{collage.products.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
