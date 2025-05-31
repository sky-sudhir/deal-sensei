import React from "react";
import useQuery from "../../hooks/useQuery";
import useMutation from "../../hooks/useMutation";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import { useSelector } from "react-redux";
import {
  API_PIPELINES_LIST,
  API_PIPELINE_DELETE,
  API_PIPELINE_SET_DEFAULT,
} from "../../imports/api";

const PipelineList = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const isAdmin = user?.role === "admin";

  // Fetch pipelines
  const {
    data: pipelinesResponse,
    loading,
    error,
    refetch,
  } = useQuery(API_PIPELINES_LIST);
  const pipelines = pipelinesResponse?.data?.data || [];

  // Delete pipeline mutation
  const { mutate: deletePipeline, loading: deleteLoading } = useMutation();

  // Set default pipeline mutation
  const { mutate: setDefaultPipeline, loading: setDefaultLoading } =
    useMutation();

  const handleEdit = (pipelineId) => {
    navigate(`/pipelines/edit/${pipelineId}`);
  };

  const handleDelete = async (id) => {
    const result = await deletePipeline({
      url: `${API_PIPELINE_DELETE}${id}`,
      method: "DELETE",
    });

    if (result.success) {
      refetch();
    }
  };

  const handleSetDefault = async (id) => {
    const result = await setDefaultPipeline({
      url: `${API_PIPELINE_SET_DEFAULT.replace("{id}", id)}`,
      method: "PUT",
    });

    if (result.success) {
      refetch();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading pipelines...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        Error loading pipelines. Please try again.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sales Pipelines</h1>
        {isAdmin && (
          <Button onClick={() => navigate("/pipelines/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Pipeline
          </Button>
        )}
      </div>

      {pipelines?.length === 0 ? (
        <div className="text-center py-12 bg-muted rounded-lg">
          <h3 className="text-xl font-medium mb-2">No pipelines found</h3>
          <p className="text-muted-foreground mb-4">
            Create your first pipeline to get started
          </p>
          {isAdmin && (
            <Button onClick={() => navigate("/pipelines/create")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Pipeline
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pipelines?.map((pipeline) => (
            <Card
              key={pipeline._id}
              className={pipeline.is_default ? "border-primary" : ""}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{pipeline.name}</CardTitle>
                    <CardDescription>
                      {pipeline.stages.length} stages
                      {pipeline.is_default && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                          Default
                        </span>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pipeline.stages.map((stage, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-muted rounded-md"
                    >
                      <span>{stage.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {stage.win_probability}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
              {isAdmin && (
                <CardFooter className="flex justify-between">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(pipeline._id)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    {!pipeline.is_default && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the pipeline. This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(pipeline._id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                  {!pipeline.is_default && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSetDefault(pipeline._id)}
                    >
                      Set as Default
                    </Button>
                  )}
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* No more edit dialog - using routes instead */}
    </div>
  );
};

export default PipelineList;
