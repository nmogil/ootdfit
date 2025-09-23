import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { toast } from "sonner";

interface CollageDetailsProps {
  collageId: Id<"collages">;
  onBack: () => void;
}

export function CollageDetails({ collageId, onBack }: CollageDetailsProps) {
  const collage = useQuery(api.collages.getCollage, { collageId });

  if (collage === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!collage) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Collage not found</h3>
        <button
          onClick={onBack}
          className="text-primary hover:text-primary-hover transition-colors"
        >
          ← Back to collages
        </button>
      </div>
    );
  }

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Download started!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Download failed. Please try again.");
    }
  };

  const exportForInstagram = () => {
    if (collage.collageImageUrl) {
      downloadImage(collage.collageImageUrl, `ootd-collage-instagram-${Date.now()}.png`);
    }
  };

  const exportForTikTok = () => {
    if (collage.collageImageUrl) {
      // For now, we'll download the same image
      // In a real implementation, you'd resize to 1080x1920
      downloadImage(collage.collageImageUrl, `ootd-collage-tiktok-${Date.now()}.png`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-1 sm:px-0">
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800 active:text-gray-900 transition-colors min-h-[44px] flex items-center px-1 touch-manipulation"
        >
          ← Back
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">Collage Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Images */}
        <div className="space-y-4 sm:space-y-6">
          {collage.status === "completed" && collage.collageImageUrl && (
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Generated Collage</h2>
              <img
                src={collage.collageImageUrl}
                alt="Generated collage"
                className="w-full rounded-lg"
              />

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-4">
                <button
                  onClick={exportForInstagram}
                  className="w-full sm:flex-1 px-3 sm:px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 active:from-purple-700 active:to-pink-700 transition-colors font-semibold text-xs sm:text-sm min-h-[44px] touch-manipulation"
                >
                  Export for Instagram
                </button>
                <button
                  onClick={exportForTikTok}
                  className="w-full sm:flex-1 px-3 sm:px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 active:bg-gray-900 transition-colors font-semibold text-xs sm:text-sm min-h-[44px] touch-manipulation"
                >
                  Export for TikTok
                </button>
              </div>
            </div>
          )}

          {collage.originalImageUrl && (
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Original Photo</h2>
              <img
                src={collage.originalImageUrl}
                alt="Original outfit"
                className="w-full rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4 sm:space-y-6">
          {/* Status */}
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Status</h2>
            <div className="flex items-center gap-3">
              {collage.status === "generating" && (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                  <span className="text-primary font-medium">Generating collage...</span>
                </>
              )}
              {collage.status === "completed" && (
                <>
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-green-600 font-medium">Completed</span>
                </>
              )}
              {collage.status === "failed" && (
                <>
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">!</span>
                  </div>
                  <span className="text-red-600 font-medium">Failed</span>
                  {collage.errorMessage && (
                    <span className="text-gray-500 text-sm">- {collage.errorMessage}</span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Products */}
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Products</h2>
            <div className="space-y-3 sm:space-y-4">
              {collage.products.map((product, index) => (
                <div key={index} className="border-l-4 border-primary pl-3 sm:pl-4 py-1">
                  <div className="font-medium text-sm sm:text-base">{product.name}</div>
                  <div className="text-gray-600 text-xs sm:text-sm">by {product.brand}</div>
                  {product.url && (
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-primary hover:text-primary-hover active:text-primary-hover transition-colors text-xs sm:text-sm mt-1 min-h-[44px] py-2 touch-manipulation"
                    >
                      View Product →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Style & Prompt */}
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Style</h2>
            <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">{collage.style}</p>

            <h3 className="font-semibold mb-2 text-sm sm:text-base">AI Prompt</h3>
            <p className="text-xs sm:text-sm text-gray-600 bg-gray-50 p-3 rounded">
              {collage.prompt}
            </p>
          </div>

          {/* Created Date */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Created</h2>
            <p className="text-gray-700">
              {new Date(collage._creationTime).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
