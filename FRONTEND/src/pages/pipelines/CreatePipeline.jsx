import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import PipelineForm from "./PipelineForm";
import { Button } from "../../components/ui/button";
import { ArrowLeft } from "lucide-react";

const CreatePipeline = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/pipelines");
  };

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
        <h1 className="text-3xl font-bold">Create New Pipeline</h1>
        <p className="text-muted-foreground mt-2">
          Set up a new sales pipeline with customized stages and win
          probabilities.
        </p>
      </div>

      <div className="bg-card p-6 rounded-lg border">
        <PipelineForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
};

export default CreatePipeline;
