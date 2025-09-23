import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";

interface Product {
  name: string;
  brand: string;
  url: string;
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
  const [products, setProducts] = useState<Product[]>([{ name: "", brand: "", url: "" }]);
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

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setSelectedImage(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const addProduct = () => {
    setProducts([...products, { name: "", brand: "", url: "" }]);
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
      // Upload image
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
        products: validProducts.map(p => ({
          name: p.name.trim(),
          brand: p.brand.trim(),
          url: p.url.trim() || undefined,
        })),
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
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-primary">Create New Collage</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Upload Your Outfit Photo</h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            {imagePreview ? (
              <div className="space-y-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-full max-h-64 mx-auto rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-primary hover:text-primary-hover transition-colors"
                >
                  Change Image
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-4xl">📸</div>
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-primary hover:text-primary-hover transition-colors font-semibold"
                  >
                    Click to upload
                  </button>
                  <p className="text-gray-500 text-sm mt-2">
                    JPG or PNG, max 10MB
                  </p>
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
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Products in Your Outfit</h2>
            <button
              type="button"
              onClick={addProduct}
              className="text-primary hover:text-primary-hover transition-colors font-semibold"
            >
              + Add Product
            </button>
          </div>
          
          <div className="space-y-4">
            {products.map((product, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">Product {index + 1}</h3>
                  {products.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProduct(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) => updateProduct(index, "name", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="e.g., Vintage Denim Jacket"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand *
                    </label>
                    <input
                      type="text"
                      value={product.brand}
                      onChange={(e) => updateProduct(index, "brand", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="e.g., Levi's"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL (optional)
                    </label>
                    <input
                      type="url"
                      value={product.url}
                      onChange={(e) => updateProduct(index, "url", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Style */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Collage Style</h2>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUploading || !selectedImage}
            className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? "Creating..." : "Create Collage"}
          </button>
        </div>
      </form>
    </div>
  );
}
