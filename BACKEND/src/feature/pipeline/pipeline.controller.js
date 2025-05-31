import Response from "../../utils/apiResponse.js";
import PipelineRepository from "./pipeline.repository.js";

class PipelineController {
  constructor() {
    this.pipelineRepository = new PipelineRepository();
  }

  async createPipeline(req, res, next) {
    const response = new Response(res);
    try {
      // Ensure company_id is set from the authenticated user's company
      if (req.user && req.user.company_id) {
        req.body.company_id = req.user.company_id;
      }
      
      // Set stages order if not explicitly provided
      if (req.body.stages && Array.isArray(req.body.stages)) {
        req.body.stages = req.body.stages.map((stage, index) => ({
          ...stage,
          order: stage.order || index
        }));
      }
      
      const pipeline = await this.pipelineRepository.createPipeline(req.body);
      return response.success(pipeline, "Pipeline created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async getPipelinesByCompany(req, res, next) {
    const response = new Response(res);
    try {
      // Get company_id from authenticated user
      const companyId = req.user.company_id;
      
      const pipelines = await this.pipelineRepository.getPipelinesByCompany(companyId);
      return response.success(pipelines, "Pipelines retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async getPipelineById(req, res, next) {
    const response = new Response(res);
    try {
      const { id } = req.params;
      const pipeline = await this.pipelineRepository.findPipelineById(id);
      
      // Check if pipeline belongs to the same company as the authenticated user
      if (pipeline.company_id.toString() !== req.user.company_id.toString()) {
        return response.forbidden("You do not have permission to access this pipeline");
      }
      
      return response.success(pipeline, "Pipeline retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async updatePipeline(req, res, next) {
    const response = new Response(res);
    try {
      const { id } = req.params;
      
      // Get the pipeline to be updated
      const pipelineToUpdate = await this.pipelineRepository.findPipelineById(id);
      
      // Check if pipeline belongs to the same company as the authenticated user
      if (pipelineToUpdate.company_id.toString() !== req.user.company_id.toString()) {
        return response.forbidden("You do not have permission to update this pipeline");
      }
      
      // Update stages order if provided
      if (req.body.stages && Array.isArray(req.body.stages)) {
        req.body.stages = req.body.stages.map((stage, index) => ({
          ...stage,
          order: stage.order || index
        }));
      }
      
      const updatedPipeline = await this.pipelineRepository.updatePipeline(id, req.body);
      return response.success(updatedPipeline, "Pipeline updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async deletePipeline(req, res, next) {
    const response = new Response(res);
    try {
      const { id } = req.params;
      
      // Get the pipeline to be deleted
      const pipelineToDelete = await this.pipelineRepository.findPipelineById(id);
      
      // Check if pipeline belongs to the same company as the authenticated user
      if (pipelineToDelete.company_id.toString() !== req.user.company_id.toString()) {
        return response.forbidden("You do not have permission to delete this pipeline");
      }
      
      const result = await this.pipelineRepository.deletePipeline(id);
      return response.success(result, "Pipeline deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async getDefaultPipeline(req, res, next) {
    const response = new Response(res);
    try {
      // Get company_id from authenticated user
      const companyId = req.user.company_id;
      
      const defaultPipeline = await this.pipelineRepository.getDefaultPipeline(companyId);
      
      if (!defaultPipeline) {
        return response.notFound("No default pipeline found for this company");
      }
      
      return response.success(defaultPipeline, "Default pipeline retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async setDefaultPipeline(req, res, next) {
    const response = new Response(res);
    try {
      const { id } = req.params;
      
      // Get the pipeline to be set as default
      const pipeline = await this.pipelineRepository.findPipelineById(id);
      
      // Check if pipeline belongs to the same company as the authenticated user
      if (pipeline.company_id.toString() !== req.user.company_id.toString()) {
        return response.forbidden("You do not have permission to modify this pipeline");
      }
      
      // Update the pipeline to be default
      const updatedPipeline = await this.pipelineRepository.updatePipeline(id, { is_default: true });
      
      return response.success(updatedPipeline, "Pipeline set as default successfully");
    } catch (error) {
      next(error);
    }
  }
}

export default PipelineController;
