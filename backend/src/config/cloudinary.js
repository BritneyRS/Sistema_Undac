const path = require("path");
const dotenv = require("dotenv");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function sanitizeFileName(name) {
  return name
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .toLowerCase();
}

function createCloudinaryStorage(folder) {
  return new CloudinaryStorage({
    cloudinary,
    params: async (_req, file) => ({
      folder,
      resource_type: "auto",
      public_id: `${Date.now()}-${sanitizeFileName(file.originalname)}`,
      allowed_formats: ["jpg", "jpeg", "png", "pdf", "doc", "docx"],
    }),
  });
}

function getPublicIdFromUrl(url) {
  if (!url || !/^https?:\/\//i.test(url)) return null;

  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    const uploadIndex = parts.findIndex((part) => part === "upload");

    if (uploadIndex === -1) return null;

    const withoutVersion = [...parts.slice(uploadIndex + 1)];
    if (withoutVersion[0] && /^v\d+$/.test(withoutVersion[0])) {
      withoutVersion.shift();
    }

    return withoutVersion.join("/");
  } catch {
    return null;
  }
}

function getResourceTypeFromUrl(url) {
  if (!url) return "image";
  return url.includes("/raw/") ? "raw" : "image";
}

async function deleteFromCloudinaryByUrl(url) {
  const publicId = getPublicIdFromUrl(url);
  if (!publicId) return false;

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: getResourceTypeFromUrl(url),
  });

  return result?.result === "ok";
}

module.exports = {
  cloudinary,
  createCloudinaryStorage,
  deleteFromCloudinaryByUrl,
};