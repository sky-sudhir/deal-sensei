import { useState } from "react";
import useQuery from "../../hooks/useQuery";
import useMutation from "../../hooks/useMutation";
import { API_FILES_BY_ENTITY, API_FILE_DELETE } from "../../imports/api";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Pagination } from "../ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  FileIcon,
  DownloadIcon,
  TrashIcon,
  FileTextIcon,
  FileImageIcon,
  File,
} from "lucide-react";
import FileUpload from "./FileUpload";
import { formatDistanceToNow } from "date-fns";
import { showToast } from "@/utils/toast";

const FileList = ({ entityType, entityId, deal_id, contact_id }) => {
  const [page, setPage] = useState(1);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Fetch files for the entity
  const { data, isLoading, refetch } = useQuery(
    `${API_FILES_BY_ENTITY}${entityType}/${entityId}`
  );

  // Delete file mutation
  const { mutate: deleteFile, isLoading: isDeleting } = useMutation();

  const files = data?.data?.data?.data?.fileAttachments || [];
  console.log(files, "qqqqqqqqqq");
  const pagination = data?.data?.data?.data?.pagination || {
    total: 0,
    pages: 1,
  };

  // Get appropriate icon and color based on file type
  const getFileTypeInfo = (fileType) => {
    if (fileType.startsWith("image/")) {
      return {
        icon: <FileImageIcon className="h-5 w-5" />,
        color: "bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500",
        textColor: "text-blue-500",
        hoverBg: "group-hover:bg-blue-50 dark:group-hover:bg-blue-950/20",
        borderColor:
          "group-hover:border-blue-200 dark:group-hover:border-blue-800",
      };
    } else if (fileType === "application/pdf") {
      return {
        icon: <FileIcon className="h-5 w-5" />,
        color: "bg-gradient-to-r from-red-400 via-red-500 to-rose-500",
        textColor: "text-red-500",
        hoverBg: "group-hover:bg-red-50 dark:group-hover:bg-red-950/20",
        borderColor:
          "group-hover:border-red-200 dark:group-hover:border-red-800",
      };
    } else if (fileType.startsWith("text/")) {
      return {
        icon: <FileTextIcon className="h-5 w-5" />,
        color: "bg-gradient-to-r from-green-400 via-green-500 to-emerald-500",
        textColor: "text-green-500",
        hoverBg: "group-hover:bg-green-50 dark:group-hover:bg-green-950/20",
        borderColor:
          "group-hover:border-green-200 dark:group-hover:border-green-800",
      };
    } else if (
      fileType.includes("spreadsheet") ||
      fileType.includes("excel") ||
      fileType.includes("csv")
    ) {
      return {
        icon: <FileTextIcon className="h-5 w-5" />,
        color: "bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500",
        textColor: "text-emerald-500",
        hoverBg: "group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/20",
        borderColor:
          "group-hover:border-emerald-200 dark:group-hover:border-emerald-800",
      };
    } else if (
      fileType.includes("presentation") ||
      fileType.includes("powerpoint")
    ) {
      return {
        icon: <FileTextIcon className="h-5 w-5" />,
        color: "bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500",
        textColor: "text-amber-500",
        hoverBg: "group-hover:bg-amber-50 dark:group-hover:bg-amber-950/20",
        borderColor:
          "group-hover:border-amber-200 dark:group-hover:border-amber-800",
      };
    } else if (
      fileType.includes("zip") ||
      fileType.includes("archive") ||
      fileType.includes("compressed")
    ) {
      return {
        icon: <FileTextIcon className="h-5 w-5" />,
        color: "bg-gradient-to-r from-purple-400 via-purple-500 to-violet-500",
        textColor: "text-purple-500",
        hoverBg: "group-hover:bg-purple-50 dark:group-hover:bg-purple-950/20",
        borderColor:
          "group-hover:border-purple-200 dark:group-hover:border-purple-800",
      };
    } else {
      return {
        icon: <FileIcon className="h-5 w-5" />,
        color: "bg-gradient-to-r from-gray-400 via-gray-500 to-slate-500",
        textColor: "text-gray-500",
        hoverBg: "group-hover:bg-gray-50 dark:group-hover:bg-gray-800/20",
        borderColor:
          "group-hover:border-gray-200 dark:group-hover:border-gray-700",
      };
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

  // Handle file download
  const handleDownload = (file) => {
    if (file.signed_url) {
      window.open(file.signed_url, "_blank");
    } else {
      showToast.error("No download URL available");
    }
  };

  // Handle file deletion
  const handleDeleteFile = async () => {
    await deleteFile({
      url: `${API_FILE_DELETE}${selectedFile?._id}`,
      method: "DELETE",
    });

    setIsDeleteDialogOpen(false);
    refetch();
  };

  // Handle delete button click
  const handleDeleteClick = (file) => {
    setSelectedFile(file);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold relative">
          Files
          <span className="absolute -bottom-1 left-0 w-1/2 h-1 bg-gradient-to-r from-primary to-accent rounded-full"></span>
        </h2>
        <Button
          onClick={() => setIsUploadModalOpen(true)}
          className="relative overflow-hidden group"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/10 to-primary/0 group-hover:translate-x-full -translate-x-full transition-transform duration-1000"></span>
          Upload File
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="relative">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary/30"></div>
            <div className="absolute top-0 left-0 animate-spin rounded-full h-10 w-10 border-b-2 border-r-2 border-primary"></div>
          </div>
        </div>
      ) : files.length === 0 ? (
        <Card className="bg-gradient-to-b from-muted/30 to-muted/50 border-border/40 hover:border-border transition-all duration-300 overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center py-12 relative">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0"></div>
            <div className="rounded-full bg-muted/80 p-6 mb-4 relative">
              <File className="h-8 w-8 text-muted-foreground/60" />
              <span className="absolute -right-1 -top-1 text-lg">+</span>
            </div>
            <p className="text-muted-foreground mb-4 text-center">
              No files uploaded yet
            </p>
            <Button
              onClick={() => setIsUploadModalOpen(true)}
              className="relative overflow-hidden group bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 group-hover:translate-x-full -translate-x-full transition-transform duration-1000"></span>
              Upload your first file
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-3">
            {files.map((file) => {
              const fileTypeInfo = getFileTypeInfo(file.file_type);
              return (
                <Card
                  key={file._id}
                  className={`overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group border border-border/40 ${fileTypeInfo.borderColor} ${fileTypeInfo.hoverBg}`}
                >
                  <CardContent className="p-4 relative">
                    {/* Top accent line */}
                    <div
                      className={`absolute top-0 left-0 right-0 h-0.5 ${fileTypeInfo.color} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}
                    ></div>

                    {/* Subtle gradient background that appears on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-r from-primary/20 via-background to-accent/20"></div>

                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className={`p-2.5 rounded-md ${fileTypeInfo.color} text-white shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-110`}
                        >
                          {fileTypeInfo.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-medium truncate group-hover:${fileTypeInfo.textColor} transition-colors duration-300`}
                            title={file.original_filename}
                          >
                            <span className="relative inline-block">
                              {file.original_filename}
                              <span
                                className={`absolute bottom-0 left-0 w-0 h-0.5 ${fileTypeInfo.color} group-hover:w-full transition-all duration-500 rounded-full opacity-70`}
                              ></span>
                            </span>
                          </p>
                          <div className="flex flex-wrap gap-x-4 text-xs text-muted-foreground">
                            <span className="group-hover:text-foreground/70 transition-colors duration-300">
                              {formatFileSize(file.file_size_bytes)}
                            </span>
                            <span className="group-hover:text-foreground/70 transition-colors duration-300">
                              Uploaded{" "}
                              {formatDistanceToNow(new Date(file.created_at), {
                                addSuffix: true,
                              })}
                            </span>
                            {file.uploaded_by && (
                              <span className="group-hover:text-foreground/70 transition-colors duration-300">
                                by {file.uploaded_by.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(file)}
                          title="Download"
                          className="opacity-70 hover:opacity-100 transition-all duration-300 hover:bg-blue-500/10 hover:scale-110 hover:-translate-y-0.5"
                        >
                          <DownloadIcon className="h-4 w-4 text-blue-500" />
                          <span className="absolute inset-0 rounded-full bg-blue-400/10 scale-0 group-hover:scale-100 transition-transform duration-300 -z-10"></span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(file)}
                          title="Delete"
                          className="opacity-70 hover:opacity-100 transition-all duration-300 hover:bg-red-500/10 hover:scale-110 hover:-translate-y-0.5"
                        >
                          <TrashIcon className="h-4 w-4 text-red-500" />
                          <span className="absolute inset-0 rounded-full bg-red-400/10 scale-0 group-hover:scale-100 transition-transform duration-300 -z-10"></span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {pagination.pages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={pagination.pages}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {/* File Upload Modal */}
      <FileUpload
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={refetch}
        entityType={entityType}
        entityId={entityId}
        deal_id={deal_id}
        contact_id={contact_id}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFile}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FileList;
