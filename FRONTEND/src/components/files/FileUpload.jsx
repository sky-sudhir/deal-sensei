import { useState, useRef } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../ui/dialog";
import { API_FILES_UPLOAD } from "../../imports/api";
import axios from "axios";
import { UploadCloud, X, FileIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import { showToast } from "@/utils/toast";
import { getToken } from "@/imports/localStorage";
import { cn } from "@/lib/utils";

const FileUpload = ({ isOpen, onClose, onSuccess, entityType, entityId }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Reset state when modal closes
  const handleClose = () => {
    setFile(null);
    setUploadProgress(0);
    onClose();
  };

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Clear selected file
  const handleClearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      showToast.error("No file selected");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    // Only append entity information if both type and id are provided
    if (entityType && entityId) {
      formData.append("attached_to_type", entityType);
      formData.append("attached_to_id", entityId);
    }

    try {
      const token = getToken();

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}${API_FILES_UPLOAD}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      showToast.success("File uploaded successfully");

      onSuccess && onSuccess(response.data.data);
      handleClose();
    } catch (error) {
      console.error("Upload error:", error);
      showToast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]" onClose={handleClose}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-primary" />
            Upload File
          </DialogTitle>
          <DialogDescription>
            Upload a file to attach to this {entityType?.toLowerCase() || "item"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!file ? (
            <div 
              className={cn(
                "border-2 border-dashed rounded-lg p-8 transition-colors",
                "hover:border-primary/50 hover:bg-muted/30 cursor-pointer",
                "flex flex-col items-center justify-center text-center"
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Drag & drop or click to upload</p>
                <p className="text-xs text-muted-foreground">
                  Supports documents, images, and other file types
                </p>
              </div>
              <Input
                ref={fileInputRef}
                id="file"
                type="file"
                onChange={handleFileChange}
                disabled={isUploading}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 border rounded-md bg-muted/10">
                <FileIcon className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleClearFile}
                      disabled={isUploading}
                      className="h-7 w-7"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatFileSize(file.size)} • {file.type || "Unknown type"}
                  </p>
                </div>
              </div>
              
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                      <span>Uploading file...</span>
                    </span>
                    <span className="font-medium">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
              
              {!isUploading && (
                <div className="text-xs text-muted-foreground italic">
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Click Upload when you're ready to proceed</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="gap-2 flex-1 sm:flex-none"
            variant={file ? "default" : "outline"}
          >
            {isUploading ? (
              <>
                <span className="inline-block h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin"></span>
                Uploading...
              </>
            ) : (
              <>
                <UploadCloud className="h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FileUpload;
