const path = require("path");
const dotenv = require("dotenv");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const envPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath });

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
} else {
  console.warn("Cloudinary no está configurado correctamente. Revisa las variables CLOUDINARY_* en el archivo .env.");
}

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
    params: async (_req, file) => {
      // Extraemos la extensión (.pdf, .doc, etc) del nombre original
      const ext = path.extname(file.originalname);
      // Obtenemos el nombre base sin la extensión
      const baseName = path.basename(file.originalname, ext);
      // Limpiamos caracteres extraños del nombre base
      const cleanName = sanitizeFileName(baseName);

      return {
        folder,
        resource_type: "auto",
        public_id: `${Date.now()}-${cleanName}`, // ID final sin la extensión
      };
    },
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