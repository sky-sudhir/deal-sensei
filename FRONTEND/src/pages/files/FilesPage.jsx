import { useState, useEffect, useCallback } from "react";
import useQuery from "../../hooks/useQuery";
import {
  API_FILES_LIST,
  API_DEALS_LIST,
  API_CONTACTS_LIST,
} from "../../imports/api";
import { Card, CardContent } from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { SearchIcon } from "lucide-react";
import FileUpload from "../../components/files/FileUpload";
import { formatDistanceToNow } from "date-fns";
import { Pagination } from "../../components/ui/pagination";
import { showToast } from "@/utils/toast";
import { generateParam } from "../../hooks/useQuery";

const FilesPage = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filters, setFilters] = useState({
    entity_type: "",
    entity_id: "",
    file_type: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Fetch deals for filter dropdown
  const { data: dealsData } = useQuery(API_DEALS_LIST);

  // Fetch contacts for filter dropdown
  const { data: contactsData } = useQuery(API_CONTACTS_LIST);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Build query params for files
  const buildQueryParams = useCallback(() => {
    const params = {
      page,
      limit,
      ...(filters.entity_type !== "__all" &&
        filters.entity_type &&
        filters.entity_id && {
          attached_to_type: filters.entity_type,
          attached_to_id: filters.entity_id,
        }),
      // ...(filters.file_type && { file_type: filters.file_type }),
      ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
    };
    return params;
  }, [page, limit, filters, debouncedSearchQuery]);

  // Generate query params string
  const queryParams = buildQueryParams();
  // Fetch files
  const {
    data: filesData,
    isLoading,
    refetch,
  } = useQuery(`${API_FILES_LIST}?${generateParam(queryParams)}`);

  const files = filesData?.data?.data?.data?.fileAttachments || [];
  const pagination = filesData?.data?.data?.data?.pagination || {
    total: 0,
    pages: 1,
  };
  const deals = dealsData?.data?.data?.deals || [];
  const contacts = contactsData?.data?.data?.contacts || [];

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      entity_type: "",
      entity_id: "",
      file_type: "",
    });
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setPage(1);
  };

  // Get entity options based on selected entity type
  const getEntityOptions = () => {
    if (filters.entity_type === "deal") {
      return deals.map((deal) => ({
        id: deal._id,
        name: deal.title,
      }));
    } else if (filters.entity_type === "contact") {
      return contacts.map((contact) => ({
        id: contact._id,
        name: contact.name,
      }));
    }
    return [];
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Files</h1>
        <Button onClick={() => setIsUploadModalOpen(true)}>Upload File</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="entity-type-filter">Attached To</Label>
              <Select
                value={filters.entity_type}
                onValueChange={(value) => {
                  handleFilterChange("entity_type", value);
                  handleFilterChange("entity_id", "");
                }}
              >
                <SelectTrigger id="entity-type-filter">
                  <SelectValue placeholder="All Files" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">All Files</SelectItem>
                  <SelectItem value="deal">Deals</SelectItem>
                  <SelectItem value="contact">Contacts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filters.entity_type && (
              <div className="space-y-2">
                <Label htmlFor="entity-id-filter">
                  Select {filters.entity_type === "deal" ? "Deal" : "Contact"}
                </Label>
                <Select
                  value={filters.entity_id}
                  onValueChange={(value) =>
                    handleFilterChange("entity_id", value)
                  }
                >
                  <SelectTrigger id="entity-id-filter">
                    <SelectValue
                      placeholder={`Select ${
                        filters.entity_type === "deal" ? "Deal" : "Contact"
                      }`}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {getEntityOptions().map((entity) => (
                      <SelectItem key={entity.id} value={entity.id}>
                        {entity.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* <div className="space-y-2">
              <Label htmlFor="file-type-filter">File Type</Label>
              <Select
                value={filters.file_type}
                onValueChange={(value) =>
                  handleFilterChange("file_type", value)
                }
              >
                <SelectTrigger id="file-type-filter">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                  <SelectItem value="pdf">PDFs</SelectItem>
                  <SelectItem value="spreadsheet">Spreadsheets</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search files..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && searchQuery !== debouncedSearchQuery && (
                  <div className="absolute right-2.5 top-2.5">
                    <div className="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent"></div>
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="shrink-0"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : files.length === 0 ? (
        <Card className="bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground mb-4">No files found</p>
            <Button onClick={() => setIsUploadModalOpen(true)}>
              Upload a file
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {files.map((file) => (
              <Card key={file._id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="text-muted-foreground">
                        {file.file_type.startsWith("image/") ? (
                          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                            <span className="text-xs">IMG</span>
                          </div>
                        ) : file.file_type === "application/pdf" ? (
                          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                            <span className="text-xs">PDF</span>
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                            <span className="text-xs">DOC</span>
                          </div>
                        )}
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

                          {file.attached_to_type && file.attached_to_id && (
                            <span>
                              Attached to:{" "}
                              {file.attached_to_type === "deal"
                                ? "Deal"
                                : "Contact"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <Button onClick={() => handleDownload(file)} size="sm">
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={page}
                totalPages={pagination.pages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}

      {/* File Upload Modal */}
      <FileUpload
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={refetch}
        entityType={filters.entity_type !== "__all" ? filters.entity_type : ""}
        entityId={filters.entity_id || ""}
      />
    </div>
  );
};

export default FilesPage;
