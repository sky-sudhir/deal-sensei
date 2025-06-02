import { useState, useEffect } from "react";
import useQuery, { generateParam } from "../../hooks/useQuery";
import useMutation from "../../hooks/useMutation";
import { API_ACTIVITIES_LIST, API_ACTIVITY_DELETE } from "../../imports/api";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
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
  CalendarIcon,
  ClockIcon,
  UserIcon,
  BuildingIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

const ActivityList = ({ deal_id = null, contact_id = null, apiUrl = null }) => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [type, setType] = useState("");
  // Removed edit modal state as we're using a dedicated page now
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const navigate = useNavigate();

  // Build query params based on filters and pagination
  const queryParams = {
    page,
    limit,
    ...(type && type !== "all" && { type }),
    ...(deal_id && deal_id !== "all" && { deal_id }),
    ...(contact_id && contact_id !== "all" && { contact_id }),
  };

  // Determine the URL to use for fetching activities
  const url = apiUrl || `${API_ACTIVITIES_LIST}?${generateParam(queryParams)}`;

  // Fetch activities
  const { data, isLoading, refetch } = useQuery(url);

  // Delete activity mutation
  const { mutate: deleteActivity, isLoading: isDeleting } = useMutation();

  const activities = data?.data?.data?.activities || [];
  const pagination = data?.data?.data?.pagination || { total: 0, pages: 1 };

  // Get activity type badge color
  const getActivityTypeColor = (type) => {
    switch (type) {
      case "call":
        return "bg-blue-500";
      case "email":
        return "bg-green-500";
      case "meeting":
        return "bg-purple-500";
      case "note":
        return "bg-yellow-500";
      case "task":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Format activity type for display
  const formatActivityType = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Handle activity deletion
  const handleDeleteActivity = async () => {
    await deleteActivity({
      url: `${API_ACTIVITY_DELETE}${selectedActivity?._id}`,
      method: "DELETE",
    });
    setIsDeleteDialogOpen(false);
    refetch();
  };

  // Handle edit button click
  const handleEditClick = (activity) => {
    navigate(`/activities/${activity._id}/edit`);
  };

  // Handle delete button click
  const handleDeleteClick = (activity) => {
    setSelectedActivity(activity);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Activities</h2>
        {/* <Button onClick={() => navigate("/activities/new")}>
          Log Activity
        </Button> */}
      </div>

      {!apiUrl && (
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="w-full md:w-auto">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="note">Note</SelectItem>
                <SelectItem value="task">Task</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : activities.length === 0 ? (
        <Card className="bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground mb-4">No activities found</p>
            <Button onClick={() => navigate("/activities/new")}>
              Log your first activity
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {activities.map((activity) => (
              <Card key={activity._id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge
                        className={`${getActivityTypeColor(
                          activity.type
                        )} text-white mb-2`}
                      >
                        {formatActivityType(activity.type)}
                      </Badge>
                      <CardTitle className="text-lg">
                        {activity.subject}
                      </CardTitle>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:text-foreground"
                        onClick={() => handleEditClick(activity)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        className="hover:text-foreground"
                        size="icon"
                        onClick={() => handleDeleteClick(activity)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-muted-foreground mb-4">
                    {activity.content}
                  </p>

                  {activity.next_steps && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold">Next Steps:</h4>
                      <p className="text-sm text-muted-foreground">
                        {activity.next_steps}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                    {activity.duration_minutes > 0 && (
                      <div className="flex items-center">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        <span>{activity.duration_minutes} minutes</span>
                      </div>
                    )}

                    {activity.user_id && (
                      <div className="flex items-center">
                        <UserIcon className="h-3 w-3 mr-1" />
                        <span>{activity.user_id.name}</span>
                      </div>
                    )}

                    {activity.deal_id && (
                      <div className="flex items-center">
                        <BuildingIcon className="h-3 w-3 mr-1" />
                        <span>Deal: {activity.deal_id.title}</span>
                      </div>
                    )}

                    {activity.contact_id && (
                      <div className="flex items-center">
                        <UserIcon className="h-3 w-3 mr-1" />
                        <span>Contact: {activity.contact_id.name}</span>
                      </div>
                    )}

                    <div className="flex items-center">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      <span>
                        {formatDistanceToNow(new Date(activity.created_at), {
                          addSuffix: true,
                        })}
                      </span>
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
              activity.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteActivity}
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

export default ActivityList;
