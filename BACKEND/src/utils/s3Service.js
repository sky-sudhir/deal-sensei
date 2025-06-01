import { S3Client, HeadBucketCommand, CreateBucketCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl as getPresignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
import CustomError from "./CustomError.js";

// Create S3 client instance
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Check if bucket exists, create if it doesn't
const ensureBucketExists = async () => {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: process.env.AWS_S3_BUCKET }));
  } catch (error) {
    if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
      await s3Client.send(new CreateBucketCommand({ Bucket: process.env.AWS_S3_BUCKET }));
    } else {
      console.error("S3 Bucket error:", error);
      throw new CustomError("S3 Bucket error", 500);
    }
  }
};

// Initialize bucket
ensureBucketExists().catch((err) => {
  console.error("Error initializing S3 bucket:", err);
});

// File filter function to restrict file types
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = [
    ".jpg",
    ".jpeg",
    ".png",
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".txt",
  ];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedFileTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new CustomError(
        `File type ${ext} not allowed. Allowed types: ${allowedFileTypes.join(
          ", "
        )}`,
        400
      ),
      false
    );
  }
};

// Configure multer for S3 uploads
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_S3_BUCKET,
    acl: "private",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const companyId = req.user.company_id;
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const fileName = `${companyId}/files/${uniqueSuffix}-${file.originalname}`;
      cb(null, fileName);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter,
});

// Function to generate a signed URL for file access
const getSignedUrl = async (key, expirationInSeconds = 3600) => {
  if (!key) {
    throw new CustomError("File key is required", 400);
  }

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    });
    const url = await getPresignedUrl(s3Client, command, { expiresIn: expirationInSeconds });
    return url;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw new CustomError("Failed to generate file access URL", 500);
  }
};

// Function to delete a file from S3
const deleteFile = async (key) => {
  try {
    await s3Client.send(new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    }));
    return true;
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    throw new CustomError("Failed to delete file", 500);
  }
};

export { upload, getSignedUrl, deleteFile };
