import fs from "fs";
import path from "path";
import multer from "multer";

export const resumesDirectory = path.join(process.cwd(), "uploads", "resumes");

fs.mkdirSync(resumesDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, resumesDirectory);
  },
  filename: (req, file, callback) => {
    const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "-");
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1_000_000
    )}-${safeOriginalName}`;

    callback(null, uniqueName);
  },
});

export const resumeUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const isPdf =
      file.mimetype === "application/pdf" && extension === ".pdf";

    if (!isPdf) {
      callback(new Error("Only PDF files are allowed"));
      return;
    }

    callback(null, true);
  },
});
