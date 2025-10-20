import React, { useState, useRef, useEffect } from "react";
import { getProductAIPrompt } from "./prompt";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Image as ImageIcon, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateProductApi, UpdateProductApi } from "@/app/api/marketPlace";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

const productSchema = z.object({
  images: z.array(z.any()).min(1, "At least one image is required"),
  name: z.string().min(2, "Name is required"),
  price: z.number().min(0, "Price must be positive"),
  description: z.string().min(10, "Description is required"),
  category: z.string().min(1, "Category is required"),
});

export const categories = [
  { label: "Men's Clothing & Shoes", value: "mens_clothings_&_shoes" },
  { label: "Women's Clothing & Shoes", value: "womens_clothings_&_shoes" },
  { label: "Baby & children", value: "baby_&_children" },
  { label: "Electronics", value: "electronics" },
  { label: "Vehicles", value: "vehicles" },
  { label: "Home & Garden", value: "home_&_garden" },
  { label: "Health & Beauty", value: "health_&_beauty" },
  { label: "Sports & Outdoors", value: "sports_&_outdoors" },
];

const ProductUpload = ({
  FetchProducts,
  open,
  setOpen,
  isEdit = false,
  editData = null,
}) => {
  const [files, setFiles] = useState([]);
  const [productName, setProductName] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  function mapCategory(aiCategory) {
    if (!aiCategory) return categories[0].value;
    const lower = aiCategory.toLowerCase();
    const exact = categories.find((cat) =>
      lower.includes(cat.label.toLowerCase())
    );
    if (exact) return exact.value;
    for (const cat of categories) {
      if (lower.includes(cat.label.split(" ")[0].toLowerCase()))
        return cat.value;
    }
    return categories[0].value;
  }

  async function handleGeminiGenerate() {
    setAiLoading(true);
    setAiError("");
    try {
      const name = document.querySelector('input[name="name"]').value;
      const prompt = getProductAIPrompt(name);
      const url =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
      const contents = [{ parts: [{ text: prompt }] }];
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({ contents }),
      });
      const data = await res.json();
      if (!data.candidates || !data.candidates[0].content.parts[0].text)
        throw new Error("No response from Gemini");
      const text = data.candidates[0].content.parts[0].text;
      let description = "";
      let category = categories[0].value;
      const descMatch = text.match(/Description\s*[:\-]?\s*([\s\S]*?)\n/i);
      if (descMatch) description = descMatch[1].trim();
      else description = text;
      const catMatch = text.match(/Category\s*[:\-]?\s*([\w &]+)/i);
      if (catMatch) category = mapCategory(catMatch[1]);
      else category = mapCategory(text);
      setValue("description", description);
      setValue("category", category);
    } catch (err) {
      setAiError("AI generation failed. Try again.");
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  }
  const [uploading, setUploading] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [existingMedia, setExistingMedia] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (files.length > 0) {
      setPreviewImages(files.map((file) => URL.createObjectURL(file)));
    } else {
      setPreviewImages([]);
    }
  }, [files]);

  useEffect(() => {
    if (open && isEdit && editData) {
      const imgs = editData.images || [];
      const normalized = imgs.map((img) => ({
        url: img.url || img,
        public_id: img.public_id || img.publicId || img._id || img.id || null,
      }));
      setExistingMedia(normalized);
      setValue("images", normalized);
      setPreviewImages([]);
      setValue("name", editData.name || "");
      setValue("price", editData.price || "");
      setValue("description", editData.description || "");
      setValue("category", editData.category || categories[0].value);
    }
    if (!open && !isEdit) {
      setExistingMedia([]);
      setFiles([]);
      setPreviewImages([]);
    }
  }, [open, isEdit, editData]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      images: [],
      name: "",
      price: "",
      description: "",
      category: categories[0].value,
    },
  });

  const watchedName = watch("name");
  const watchedImages = watch("images");

  const handleSelectFiles = () => {
    inputRef.current?.click();
  };

  const MAX_FILE_SIZE = 9 * 1024 * 1024;
  const [fileError, setFileError] = useState("");
  const onFilesChange = (e) => {
    setFileError("");
    const newImgs = Array.from(e.target.files);
    const existing = files || [];
    const merged = [...existing];
    let tooLarge = false;
    newImgs.forEach((img) => {
      if (img.size > MAX_FILE_SIZE) {
        tooLarge = true;
        return;
      }
      if (!existing.some((f) => f.name === img.name && f.size === img.size)) {
        merged.push(img);
      }
    });
    if (tooLarge) {
      setFileError("Each file must be less than 9MB.");
    }
    setFiles(merged);
    setValue("images", merged);
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    setValue("images", newFiles);
  };

  const removeExisting = (index) => {
    const newExisting = existingMedia.filter((_, i) => i !== index);
    setExistingMedia(newExisting);
    setValue("images", newExisting);
  };

  const handleProductUpload = async (data) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("price", data.price);
      formData.append("description", data.description);
      formData.append("category", data.category);
      files.forEach((file) => {
        formData.append("images", file);
      });

      if (isEdit && editData && editData._id) {
        const mediaToKeep =
          existingMedia && existingMedia.length > 0
            ? existingMedia.map((m) => m.public_id || m.url)
            : [];
        formData.append("mediaToKeep", JSON.stringify(mediaToKeep));
        await UpdateProductApi(editData._id, formData);
      } else {
        await CreateProductApi(formData);
      }
      if (FetchProducts) {
        await FetchProducts(1);
      }
      setUploading(false);
      setOpen(false);
      setFiles([]);
      setPreviewImages([]);
      setExistingMedia([]);
      reset();
    } catch (error) {
      console.error("Error creating product:", error);
      setUploading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          setFiles([]);
          setPreviewImages([]);
          reset();
        }
        setOpen(value);
      }}
    >
      <DialogContent className="bg-gray-100 text-gray-800  border-none p-0 flex flex-col sm:max-w-5xl rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold mt-4">
            {isEdit ? "Update Product" : "Create Product"}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(handleProductUpload)}
          className="flex flex-col md:flex-row gap-10 w-full px-6 pb-6"
        >
          <div className="md:w-1/2 w-full flex flex-col items-center justify-start bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <label className="block text-base font-semibold mb-2">
              Product Images <span className="text-red-500">*</span>
            </label>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 w-full min-h-[250px] flex flex-col items-center justify-center cursor-pointer bg-white transition-all duration-300",
                files.length > 0 || existingMedia.length > 0
                  ? "border-gray-400 bg-gray-50"
                  : "border-gray-400 hover:border-gray-400 hover:bg-gray-100"
              )}
              onClick={handleSelectFiles}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const dropped = Array.from(e.dataTransfer.files).filter((f) =>
                  f.type.startsWith("image/")
                );
                if (dropped.length) {
                  onFilesChange({ target: { files: dropped } });
                }
              }}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                ref={inputRef}
                onChange={onFilesChange}
              />
              <ImageIcon className="h-10 w-10 text-gray-800 mb-2" />
              <span className="text-base font-medium mb-1">
                Drag & drop or click to select images
              </span>
              <span className="text-xs text-gray-500 mb-2">
                (Max 9MB each, multiple allowed)
              </span>
              <button
                type="button"
                className="px-4 py-2 bg-gray-800 text-white hover:bg-gray-900 rounded-md text-sm font-medium mt-2"
              >
                Select Images
              </button>
            </div>
            {fileError && (
              <div className="text-red-600 text-xs mt-2">{fileError}</div>
            )}
            {errors.images && (
              <div className="text-red-600 text-xs mt-2">
                {errors.images.message}
              </div>
            )}
            {(previewImages.length > 0 || existingMedia.length > 0) && (
              <div className="mt-4 w-full">
                <div className="flex gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 py-2">
                  {previewImages.map((url, i) => (
                    <div
                      key={url}
                      className="relative group min-w-[120px] max-w-[140px] h-32 flex-shrink-0"
                    >
                      <img
                        src={url}
                        alt="preview"
                        className="rounded-lg shadow w-full h-full object-cover bg-white border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-red-100"
                        title="Remove image"
                      >
                        <X size={16} className="text-red-500" />
                      </button>
                    </div>
                  ))}
                  {existingMedia.map((m, i) => (
                    <div
                      key={m.url}
                      className="relative group min-w-[120px] max-w-[140px] h-32 flex-shrink-0"
                    >
                      <img
                        src={m.url}
                        alt="preview-exist"
                        className="rounded-lg shadow w-full h-full object-cover bg-white border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeExisting(i)}
                        className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-red-100"
                        title="Remove image"
                      >
                        <X size={16} className="text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="md:w-1/2 w-full flex flex-col gap-6 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className=" flex-row items-center gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("name")}
                placeholder="Product name"
                className={cn(
                  "block w-full rounded focus:outline-none border bg-white px-3 py-2 sm:text-sm",
                  errors.name &&
                    "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
                onChange={(e) => {
                  setProductName(e.target.value);
                  register("name").onChange(e);
                }}
                value={watchedName}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                {...register("category")}
                className={cn(
                  "block w-full rounded focus:outline-none border bg-white px-3 py-2 sm:text-sm",
                  errors.category &&
                    "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.category.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                {...register("price", { valueAsNumber: true })}
                placeholder="Product price"
                className={cn(
                  "block w-full rounded focus:outline-none border bg-white px-3 py-2 sm:text-sm",
                  errors.price &&
                    "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              />
              {errors.price && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.price.message}
                </p>
              )}
            </div>

            <div className="">
              <div className="flex flex-row  justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  className="ml-2 mb-2 cursor-pointer px-2 py-1 bg-gray-800 text-white rounded text-xs font-medium disabled:opacity-60"
                  onClick={handleGeminiGenerate}
                  disabled={
                    aiLoading ||
                    !watchedName ||
                    !(
                      (Array.isArray(watchedImages) &&
                        watchedImages.length > 0) ||
                      (Array.isArray(existingMedia) && existingMedia.length > 0)
                    )
                  }
                  title="Generate description and category with AI"
                >
                  {aiLoading ? "Generating..." : "Generate with AI"}
                </button>

                {aiError && (
                  <span className="ml-2 text-xs text-red-500">{aiError}</span>
                )}
              </div>
              <textarea
                {...register("description")}
                placeholder="Product description"
                rows={4}
                className={cn(
                  "block w-full rounded focus:outline-none border bg-white px-3 py-2 sm:text-sm",
                  errors.description &&
                    "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              />
              {errors.description && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>
            <div className="flex flex-row gap-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setFiles([]);
                  setPreviewImages([]);
                  reset();
                }}
                disabled={uploading}
                className="w-1/2 px-4 py-2 bg-transparent border border-gray-600 rounded-md text-sm font-medium transition-colors hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className={cn(
                  "w-1/2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  uploading
                    ? "bg-gray-800 text-gray-100 cursor-not-allowed opacity-70"
                    : "bg-gray-800 hover:bg-gray-900 text-white"
                )}
              >
                {uploading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    {isEdit ? "Updating..." : "Creating..."}
                  </span>
                ) : isEdit ? (
                  "Update Product"
                ) : (
                  "Create Product"
                )}
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductUpload;
