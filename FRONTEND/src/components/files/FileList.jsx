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

const FileList = ({ entityType, entityId }) => {
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

  // Get appropriate icon based on file type
  const getFileIcon = (fileType) => {
    if (fileType.startsWith("image/")) {
      return <FileImageIcon className="h-5 w-5 hover:text-foreground" />;
    } else if (fileType === "application/pdf") {
      return <FileIcon className="h-5 w-5 hover:text-foreground" />;
    } else if (fileType.startsWith("text/")) {
      return <FileTextIcon className="h-5 w-5 hover:text-foreground" />;
    } else {
      return <FileIcon className="h-5 w-5 hover:text-foreground" />;
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
        <h2 className="text-2xl font-bold">Files</h2>
        <Button onClick={() => setIsUploadModalOpen(true)}>Upload File</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : files.length === 0 ? (
        <Card className="bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground mb-4">No files uploaded yet</p>
            <Button onClick={() => setIsUploadModalOpen(true)}>
              Upload your first file
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-2">
            {files.map((file) => (
              <Card key={file._id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="text-muted-foreground">
                        {getFileIcon(file.file_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-medium truncate"
                          title={file.original_filename}
                        >
                          {file.original_filename}
                        </p>
                        <div className="flex flex-wrap gap-x-4 text-xs text-muted-foreground">
                          <span>{formatFileSize(file.file_size_bytes)}</span>
                          <span>
                            Uploaded{" "}
                            {formatDistanceToNow(new Date(file.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                          {file.uploaded_by && (
                            <span>by {file.uploaded_by.name}</span>
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
                      >
                        <DownloadIcon className="h-4 w-4 hover:text-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(file)}
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4 hover:text-foreground" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
