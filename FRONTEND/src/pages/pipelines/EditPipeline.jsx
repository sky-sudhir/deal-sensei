import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import PipelineForm from "./PipelineForm";
import { Button } from "../../components/ui/button";
import { ArrowLeft } from "lucide-react";
import useQuery from "../../hooks/useQuery";
import { API_PIPELINE_DETAILS } from "../../imports/api";

const EditPipeline = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch pipeline details
  const {
    data: pipelineResponse,
    loading,
    error,
  } = useQuery(`${API_PIPELINE_DETAILS}${id}`);
  const pipeline = pipelineResponse?.data?.data;

  const handleSuccess = () => {
    navigate("/pipelines");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading pipeline details...
      </div>
    );
  }

  if (error || !pipeline) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/pipelines")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Pipelines
          </Button>
        </div>
        <div className="bg-destructive/10 p-6 rounded-lg border border-destructive text-center">
          <h2 className="text-xl font-semibold text-destructive mb-2">
            Error Loading Pipeline
          </h2>
          <p className="text-muted-foreground mb-4">
            We couldn't load the pipeline details. It may have been deleted or
            you don't have permission to view it.
          </p>
          <Button onClick={() => navigate("/pipelines")}>
            Return to Pipeline List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/pipelines")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Pipelines
        </Button>
        <h1 className="text-3xl font-bold">Edit Pipeline</h1>
        <p className="text-muted-foreground mt-2">
          Update pipeline "{pipeline.name}" and its stages.
        </p>
      </div>

      <div className="bg-card p-6 rounded-lg border">
        <PipelineForm pipeline={pipeline} onSuccess={handleSuccess} />
      </div>
    </div>
  );
};

export default EditPipeline;
