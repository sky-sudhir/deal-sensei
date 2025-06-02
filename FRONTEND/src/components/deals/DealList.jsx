import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useQuery from "@/hooks/useQuery";
import useMutation from "@/hooks/useMutation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MoreVertical,
  Edit,
  Trash,
  Plus,
  Search,
  UserPlus,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { useSelector } from "react-redux";
import TransferDealModal from "./TransferDealModal";
import DeleteDealDialog from "./DeleteDealDialog";

const DealList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [pipelineFilter, setPipelineFilter] = useState("");
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState(null);
  const [selectedDealTitle, setSelectedDealTitle] = useState("");
  const limit = 10;

  // Get user role from Redux store
  const { user } = useSelector((state) => state.user);
  const isAdmin = user?.role === "admin";

  // Fetch pipelines for filtering
  const { data: pipelinesData } = useQuery("api/v1/pipelines");
  const pipelines = pipelinesData?.data?.data || [];

  // Fetch deals with pagination, search and filters
  const { data, loading, refetch } = useQuery(
    `api/v1/deals?search=${searchTerm}&page=${currentPage}&limit=${limit}&status=${statusFilter}&pipeline_id=${pipelineFilter}`
  );

  const deals = data?.data?.data?.deals || [];
  const pagination = data?.data?.data?.pagination || { total: 0, pages: 1 };

  // Setup mutation for delete
  const { mutate, loading: isDeleting } = useMutation();

  // Get stage name from pipeline stages
  const getStageNameById = (deal) => {
    // Since the backend stores stage as a name string, we can just return it directly
    return (
      deal?.pipeline_id?.stages?.find((s) => s._id === deal.stage)?.name ||
      "Not set"
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    refetch();
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status === "all" ? "" : status);
    setCurrentPage(1);
    refetch();
  };

  const handlePipelineFilterChange = (pipelineId) => {
    setPipelineFilter(pipelineId === "all" ? "" : pipelineId);
    setCurrentPage(1);
    refetch();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    refetch();
  };

  const handleDeleteDeal = (dealId, dealTitle) => {
    setSelectedDealId(dealId);
    setSelectedDealTitle(dealTitle);
    setDeleteDialogOpen(true);
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "won":
        return "success";
      case "lost":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Deals</h2>
        <Button onClick={() => navigate("/deals/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Deal
        </Button>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <form
          onSubmit={handleSearch}
          className="flex w-full max-w-sm items-center space-x-2"
        >
          <Input
            type="search"
            placeholder="Search deals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="submit" variant="secondary">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <div className="flex gap-2">
          <Select
            value={statusFilter || "all"}
            onValueChange={handleStatusFilterChange}
          >
            <SelectTrigger className="w-[150px]">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <span>
                  {statusFilter
                    ? `Status: ${
                        statusFilter.charAt(0).toUpperCase() +
                        statusFilter.slice(1)
                      }`
                    : "All Statuses"}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="won">Won</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={pipelineFilter || "all"}
            onValueChange={handlePipelineFilterChange}
          >
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <span>
                  {pipelineFilter
                    ? pipelines.find((p) => p._id === pipelineFilter)?.name ||
                      "Pipeline Filter"
                    : "All Pipelines"}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pipelines</SelectItem>
              {pipelines.map((pipeline) => (
                <SelectItem key={pipeline._id} value={pipeline._id}>
                  {pipeline.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Deal list */}
      {loading ? (
        <div className="text-center py-10">Loading deals...</div>
      ) : deals.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            No deals found. Add your first deal to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deals.map((deal) => (
            <Card
              key={deal._id}
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/deals/${deal._id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="truncate">{deal.title}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4 hover:text-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenuItem
                        onClick={() => navigate(`/deals/${deal._id}/edit`)}
                      >
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedDealId(deal._id);
                            setTransferModalOpen(true);
                          }}
                        >
                          <UserPlus className="mr-2 h-4 w-4" /> Transfer
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDeleteDeal(deal._id, deal.title)}
                      >
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">
                      ₹{deal.value.toLocaleString()}
                    </span>
                    <Badge variant={getStatusBadgeVariant(deal.status)}>
                      {deal.status}
                    </Badge>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Pipeline:</span>
                      <span className="font-medium">
                        {deal.pipeline_id?.name || "Unknown"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Stage:</span>
                      <span className="font-medium">
                        {getStageNameById(deal)}
                      </span>
                    </div>
                    {deal.owner_id && (
                      <div className="flex justify-between">
                        <span>Owner:</span>
                        <span className="font-medium">
                          {deal.owner_id.name}
                        </span>
                      </div>
                    )}
                    {deal.close_date && (
                      <div className="flex justify-between">
                        <span>Close Date:</span>
                        <span className="font-medium">
                          {new Date(deal.close_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {deal.contact_ids && deal.contact_ids.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-1">
                        Associated Contacts:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {deal.contact_ids.slice(0, 2).map((contact) => (
                          <Badge
                            key={contact._id}
                            variant="secondary"
                            className="text-xs"
                          >
                            {contact.name}
                          </Badge>
                        ))}
                        {deal.contact_ids.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{deal.contact_ids.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.pages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Transfer Deal Modal */}
      {isAdmin && (
        <TransferDealModal
          isOpen={transferModalOpen}
          onClose={() => setTransferModalOpen(false)}
          dealId={selectedDealId}
          onTransferComplete={refetch}
        />
      )}

      {/* Delete Deal Dialog */}
      <DeleteDealDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        dealId={selectedDealId}
        dealTitle={selectedDealTitle}
        onDeleteComplete={refetch}
      />
    </div>
  );
};

export default DealList;
