const path = require("path");
const dotenv = require("dotenv");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

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
      resource_type: "auto", // ◄— Cloudinary detectará automáticamente si es imagen o documento
      public_id: `${Date.now()}-${sanitizeFileName(file.originalname)}`,
      // ◄— Eliminamos "allowed_formats" de aquí para evitar el error con PDFs/Word docs.
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

    let publicId = withoutVersion.join("/");

    // Corrección para borrado de imágenes:
    // Si NO es un archivo raw (PDF, Word), Cloudinary requiere que le quitemos la extensión al public_id
    const isRaw = url.includes("/raw/");
    if (!isRaw) {
      publicId = publicId.split('.').slice(0, -1).join('.');
    }

    return publicId;
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