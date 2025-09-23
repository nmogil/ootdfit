import { useState, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";

interface Product {
  name: string;
  brand: string;
  url: string;
  imageFile?: File;
  imagePreview?: string;
  imageId?: string;
}

interface AdvancedOptions {
  colorPalette?: string;
  mood?: string;
  textStyle?: string;
  showLabels?: boolean;
  labelPlacement?: string;
  layout?: string;
  spacing?: string;
  background?: string;
  texture?: boolean;
  decorativeElements?: boolean;
  borderStyle?: string;
}

interface NewCollageFormProps {
  onBack: () => void;
  onCollageCreated: () => void;
}

export function NewCollageForm({ onBack, onCollageCreated }: NewCollageFormProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([{ name: "", brand: "", url: "", imageFile: undefined, imagePreview: undefined, imageId: undefined }]);
  const [style, setStyle] = useState("Creative & cute with handwritten notes");
  const [isUploading, setIsUploading] = useState(false);

  // Advanced options state
  const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState<AdvancedOptions>({
    colorPalette: 'default',
    mood: 'default',
    textStyle: 'default',
    showLabels: true,
    labelPlacement: 'default',
    layout: 'default',
    spacing: 'default',
    background: 'default',
    texture: false,
    decorativeElements: false,
    borderStyle: 'none',
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(api.collages.generateUploadUrl);
  const createCollage = useMutation(api.collages.createCollage);

  useEffect(() => {
    const handleGlobalPaste = (event: ClipboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }
      handlePaste(event);
    };

    document.addEventListener('paste', handleGlobalPaste);
    return () => {
      document.removeEventListener('paste', handleGlobalPaste);
    };
  }, []);

  const validateAndProcessImage = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      return false;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return false;
    }

    setSelectedImage(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    return true;
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    validateAndProcessImage(file);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const files = Array.from(event.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith("image/"));

    if (!imageFile) {
      toast.error("Please drop an image file");
      return;
    }

    validateAndProcessImage(imageFile);
  };

  const handlePaste = (event: ClipboardEvent) => {
    const items = Array.from(event.clipboardData?.items || []);
    const imageItem = items.find(item => item.type.startsWith("image/"));

    if (imageItem) {
      event.preventDefault();
      const file = imageItem.getAsFile();
      if (file) {
        validateAndProcessImage(file);
        toast.success("Image pasted successfully!");
      }
    }
  };

  const addProduct = () => {
    setProducts([...products, { name: "", brand: "", url: "", imageFile: undefined, imagePreview: undefined, imageId: undefined }]);
  };

  const removeProduct = (index: number) => {
    if (products.length > 1) {
      setProducts(products.filter((_, i) => i !== index));
    }
  };

  const updateProduct = (index: number, field: keyof Product, value: string) => {
    const updated = [...products];
    updated[index] = { ...updated[index], [field]: value };
    setProducts(updated);
  };

  const validateAndProcessProductImage = (index: number, file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      return false;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return false;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const updated = [...products];
      updated[index] = {
        ...updated[index],
        imageFile: file,
        imagePreview: e.target?.result as string
      };
      setProducts(updated);
    };
    reader.readAsDataURL(file);
    return true;
  };

  const handleProductImageSelect = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    validateAndProcessProductImage(index, file);
  };

  const handleProductImageDrop = (index: number, event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const files = Array.from(event.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith("image/"));

    if (!imageFile) {
      toast.error("Please drop an image file");
      return;
    }

    validateAndProcessProductImage(index, imageFile);
  };

  const removeProductImage = (index: number) => {
    const updated = [...products];
    updated[index] = {
      ...updated[index],
      imageFile: undefined,
      imagePreview: undefined,
      imageId: undefined
    };
    setProducts(updated);
  };

  const updateAdvancedOption = (field: keyof AdvancedOptions, value: any) => {
    setAdvancedOptions(prev => ({ ...prev, [field]: value }));
  };

  const resetAdvancedOptions = () => {
    setAdvancedOptions({
      colorPalette: 'default',
      mood: 'default',
      textStyle: 'default',
      showLabels: true,
      labelPlacement: 'default',
      layout: 'default',
      spacing: 'default',
      background: 'default',
      texture: false,
      decorativeElements: false,
      borderStyle: 'none',
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!selectedImage) {
      toast.error("Please select an image");
      return;
    }

    const validProducts = products.filter(p => p.name.trim() && p.brand.trim());
    if (validProducts.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    setIsUploading(true);

    try {
      // Upload main image
      const uploadUrl = await generateUploadUrl();
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": selectedImage.type },
        body: selectedImage,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }

      const { storageId } = await uploadResponse.json();

      // Upload product images
      const productsWithImages = await Promise.all(
        validProducts.map(async (product) => {
          let imageId: string | undefined = undefined;

          if (product.imageFile) {
            try {
              const productUploadUrl = await generateUploadUrl();
              const productUploadResponse = await fetch(productUploadUrl, {
                method: "POST",
                headers: { "Content-Type": product.imageFile.type },
                body: product.imageFile,
              });

              if (productUploadResponse.ok) {
                const { storageId: productStorageId } = await productUploadResponse.json();
                imageId = productStorageId;
              }
            } catch (error) {
              console.error(`Failed to upload image for product ${product.name}:`, error);
            }
          }

          return {
            name: product.name.trim(),
            brand: product.brand.trim(),
            url: product.url.trim() || undefined,
            imageId,
          };
        })
      );

      // Filter advanced options to only include non-default values
      const filteredAdvancedOptions: Partial<AdvancedOptions> = {};
      Object.entries(advancedOptions).forEach(([key, value]) => {
        if (key === 'showLabels' && value !== true) {
          filteredAdvancedOptions[key as keyof AdvancedOptions] = value;
        } else if (key === 'texture' && value === true) {
          filteredAdvancedOptions[key as keyof AdvancedOptions] = value;
        } else if (key === 'decorativeElements' && value === true) {
          filteredAdvancedOptions[key as keyof AdvancedOptions] = value;
        } else if (typeof value === 'string' && value !== 'default' && value !== 'none') {
          filteredAdvancedOptions[key as keyof AdvancedOptions] = value;
        }
      });

      // Create collage
      await createCollage({
        originalImageId: storageId,
        products: productsWithImages,
        style,
        advancedOptions: Object.keys(filteredAdvancedOptions).length > 0 ? filteredAdvancedOptions : undefined,
      });

      toast.success("Collage creation started! Check back in a few moments.");
      onCollageCreated();
    } catch (error) {
      console.error("Error creating collage:", error);
      toast.error("Failed to create collage. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-1 sm:px-0">
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800 active:text-gray-900 transition-colors min-h-[44px] flex items-center px-1 touch-manipulation"
        >
          ← Back
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">Create New Collage</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Image Upload */}
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Upload Your Outfit Photo</h2>

          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-8 text-center hover:border-primary hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 cursor-pointer touch-manipulation"
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <div className="space-y-3 sm:space-y-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-full max-h-48 sm:max-h-64 mx-auto rounded-lg"
                />
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="text-primary hover:text-primary-hover active:text-primary-hover transition-colors font-semibold min-h-[44px] px-3 py-2 touch-manipulation"
                  >
                    Change Image
                  </button>
                  <div className="text-xs sm:text-sm text-gray-500">
                    <span className="sm:hidden">Tap to browse • Copy & paste</span>
                    <span className="hidden sm:inline">Click to browse • Drag & drop • Copy & paste (Ctrl+V)</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                <div className="text-3xl sm:text-4xl">📸</div>
                <div>
                  <p className="text-primary hover:text-primary-hover transition-colors font-semibold text-base sm:text-lg">
                    <span className="sm:hidden">Tap to upload</span>
                    <span className="hidden sm:inline">Click to upload</span>
                  </p>
                  <p className="text-gray-600 mt-2 text-sm sm:text-base">
                    <span className="sm:hidden">or copy & paste your image</span>
                    <span className="hidden sm:inline">or drag and drop your image here</span>
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm mt-2">
                    JPG or PNG, max 10MB
                  </p>
                  <div className="flex items-center justify-center gap-1 sm:gap-2 mt-3 text-xs text-gray-500 flex-wrap">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                      <span className="sm:hidden">Tap to browse</span>
                      <span className="hidden sm:inline">Click to browse</span>
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs hidden sm:inline">Drag & drop</span>
                    <span>•</span>
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">Paste (Ctrl+V)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        {/* Products */}
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">Products in Your Outfit</h2>
            <button
              type="button"
              onClick={addProduct}
              className="w-full sm:w-auto text-primary hover:text-primary-hover active:text-primary-hover transition-colors font-semibold py-2 sm:py-0 min-h-[44px] touch-manipulation"
            >
              + Add Product
            </button>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {products.map((product, index) => (
              <div key={index} className="border rounded-lg p-3 sm:p-4">
                <div className="flex justify-between items-center mb-2 sm:mb-3">
                  <h3 className="font-medium text-sm sm:text-base">Product {index + 1}</h3>
                  {products.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProduct(index)}
                      className="text-red-500 hover:text-red-700 active:text-red-800 transition-colors min-h-[44px] px-2 touch-manipulation"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) => updateProduct(index, "name", e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base min-h-[44px] touch-manipulation"
                      placeholder="e.g., Vintage Denim Jacket"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Brand *
                    </label>
                    <input
                      type="text"
                      value={product.brand}
                      onChange={(e) => updateProduct(index, "brand", e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base min-h-[44px] touch-manipulation"
                      placeholder="e.g., Levi's"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      URL (optional)
                    </label>
                    <input
                      type="url"
                      value={product.url}
                      onChange={(e) => updateProduct(index, "url", e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base min-h-[44px] touch-manipulation"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Product Image (optional)
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Upload a clear image of this specific product for better collage accuracy
                    </p>

                    {product.imagePreview ? (
                      <div className="flex items-center gap-3 sm:gap-4">
                        <img
                          src={product.imagePreview}
                          alt={`${product.name} preview`}
                          className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border"
                        />
                        <div className="flex-1">
                          <div className="flex gap-3 mb-1">
                            <button
                              type="button"
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                input.onchange = (e) => handleProductImageSelect(index, e as any);
                                input.click();
                              }}
                              className="text-primary hover:text-primary-hover active:text-primary-hover transition-colors text-xs sm:text-sm min-h-[44px] px-2 touch-manipulation"
                            >
                              Change
                            </button>
                            <button
                              type="button"
                              onClick={() => removeProductImage(index)}
                              className="text-red-500 hover:text-red-700 active:text-red-800 transition-colors text-xs sm:text-sm min-h-[44px] px-2 touch-manipulation"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="text-xs text-gray-500">
                            <span className="sm:hidden">Tap Change • Drop new image</span>
                            <span className="hidden sm:inline">Click Change • Drop new image here</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="w-full px-3 py-4 border-2 border-dashed border-gray-300 rounded-md hover:border-primary active:border-primary active:bg-gray-50 transition-all text-gray-500 hover:text-primary cursor-pointer text-center touch-manipulation min-h-[60px] flex items-center justify-center"
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleProductImageDrop(index, e)}
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => handleProductImageSelect(index, e as any);
                          input.click();
                        }}
                      >
                        <div className="space-y-1">
                          <div className="text-sm sm:text-base">📷 Upload Product Image</div>
                          <div className="text-xs">
                            <span className="sm:hidden">Tap to browse</span>
                            <span className="hidden sm:inline">Click to browse or drag & drop</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Style */}
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Collage Style</h2>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base min-h-[44px] touch-manipulation"
          >
            <option value="Creative & cute with handwritten notes">Creative & cute with handwritten notes</option>
            <option value="Minimalist and clean">Minimalist and clean</option>
            <option value="Vintage magazine style">Vintage magazine style</option>
            <option value="Modern editorial layout">Modern editorial layout</option>
          </select>
        </div>

        {/* Advanced Options */}
        <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
          <button
            type="button"
            onClick={() => setIsAdvancedExpanded(!isAdvancedExpanded)}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-xl font-semibold text-gray-700">Advanced Options (Optional)</h2>
            <span className={`transition-transform duration-200 ${isAdvancedExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          <div className={`transition-all duration-300 overflow-hidden ${isAdvancedExpanded ? 'max-h-screen opacity-100 mt-6' : 'max-h-0 opacity-0'}`}>
            <div className="space-y-6">
              {/* Visual Style Section */}
              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Visual Style</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color Palette
                    </label>
                    <select
                      value={advancedOptions.colorPalette}
                      onChange={(e) => updateAdvancedOption('colorPalette', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="default">Default</option>
                      <option value="vibrant">Vibrant & Bold</option>
                      <option value="pastel">Soft Pastels</option>
                      <option value="monochrome">Monochrome</option>
                      <option value="earth">Earth Tones</option>
                      <option value="neon">Neon Colors</option>
                      <option value="bw">Black & White</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mood
                    </label>
                    <select
                      value={advancedOptions.mood}
                      onChange={(e) => updateAdvancedOption('mood', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="default">Default</option>
                      <option value="playful">Playful & Fun</option>
                      <option value="elegant">Elegant & Refined</option>
                      <option value="edgy">Edgy & Bold</option>
                      <option value="minimalist">Clean & Minimal</option>
                      <option value="maximalist">Rich & Layered</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Typography Section */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Text & Labels</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="showLabels"
                      checked={advancedOptions.showLabels}
                      onChange={(e) => updateAdvancedOption('showLabels', e.target.checked)}
                      className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                    />
                    <label htmlFor="showLabels" className="text-sm font-medium text-gray-700">
                      Show text labels for products
                    </label>
                  </div>

                  {advancedOptions.showLabels && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Typography Style
                        </label>
                        <select
                          value={advancedOptions.textStyle}
                          onChange={(e) => updateAdvancedOption('textStyle', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="default">Default</option>
                          <option value="handwritten">Handwritten</option>
                          <option value="modern">Modern Sans</option>
                          <option value="script">Elegant Script</option>
                          <option value="vintage">Vintage Type</option>
                          <option value="bold">Bold Block</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Label Placement
                        </label>
                        <select
                          value={advancedOptions.labelPlacement}
                          onChange={(e) => updateAdvancedOption('labelPlacement', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="default">Default</option>
                          <option value="overlay">Overlay on Images</option>
                          <option value="side">Side of Images</option>
                          <option value="bottom">Bottom of Collage</option>
                          <option value="scattered">Scattered</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Layout Section */}
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Layout & Composition</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Layout Style
                    </label>
                    <select
                      value={advancedOptions.layout}
                      onChange={(e) => updateAdvancedOption('layout', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="default">Default</option>
                      <option value="grid">Clean Grid</option>
                      <option value="collage">Natural Collage</option>
                      <option value="centered">Central Focus</option>
                      <option value="asymmetric">Asymmetric</option>
                      <option value="magazine">Magazine Style</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Spacing
                    </label>
                    <select
                      value={advancedOptions.spacing}
                      onChange={(e) => updateAdvancedOption('spacing', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="default">Default</option>
                      <option value="tight">Tight & Dense</option>
                      <option value="balanced">Balanced</option>
                      <option value="spacious">Spacious</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Background & Effects Section */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Background & Effects</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Background
                      </label>
                      <select
                        value={advancedOptions.background}
                        onChange={(e) => updateAdvancedOption('background', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="default">Default</option>
                        <option value="white">Clean White</option>
                        <option value="paper">Paper Texture</option>
                        <option value="gradient">Gradient</option>
                        <option value="pattern">Subtle Pattern</option>
                        <option value="photo">Photo Background</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Border Style
                      </label>
                      <select
                        value={advancedOptions.borderStyle}
                        onChange={(e) => updateAdvancedOption('borderStyle', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="none">None</option>
                        <option value="torn">Torn Paper</option>
                        <option value="polaroid">Polaroid Frames</option>
                        <option value="rounded">Rounded Corners</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="texture"
                        checked={advancedOptions.texture}
                        onChange={(e) => updateAdvancedOption('texture', e.target.checked)}
                        className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                      />
                      <label htmlFor="texture" className="text-sm font-medium text-gray-700">
                        Add texture overlay
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="decorativeElements"
                        checked={advancedOptions.decorativeElements}
                        onChange={(e) => updateAdvancedOption('decorativeElements', e.target.checked)}
                        className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                      />
                      <label htmlFor="decorativeElements" className="text-sm font-medium text-gray-700">
                        Include decorative elements (stars, hearts, doodles)
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reset Button */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetAdvancedOptions}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Reset to Defaults
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:flex-1 px-4 sm:px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors font-semibold min-h-[44px] touch-manipulation"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUploading || !selectedImage}
            className="w-full sm:flex-1 px-4 sm:px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover active:bg-primary-hover transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] touch-manipulation"
          >
            {isUploading ? "Creating..." : "Create Collage"}
          </button>
        </div>
      </form>
    </div>
  );
}
