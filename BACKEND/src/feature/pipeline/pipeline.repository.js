import { PipelineModel } from "./pipeline.schema.js";
import CustomError from "../../utils/CustomError.js";

class PipelineRepository {
  async createPipeline(pipelineData) {
    try {
      // If this is set as default, unset any existing default pipelines for this company
      if (pipelineData.is_default) {
        await this.unsetDefaultPipelines(pipelineData.company_id);
      }
      
      const pipeline = await PipelineModel.create(pipelineData);
      return pipeline;
    } catch (error) {
      throw new CustomError(error);
    }
  }

  async findPipelineById(pipelineId) {
    try {
      const pipeline = await PipelineModel.findById(pipelineId);
      
      if (!pipeline) {
        throw new CustomError("Pipeline not found", 404);
      }
      
      return pipeline;
    } catch (error) {
      throw new CustomError(error);
    }
  }

  async getPipelinesByCompany(companyId) {
    try {
      const pipelines = await PipelineModel.find({ company_id: companyId })
        .sort({ is_default: -1, name: 1 });
        
      return pipelines;
    } catch (error) {
      throw new CustomError(error);
    }
  }

  async updatePipeline(pipelineId, updateData) {
    try {
      // If this is being set as default, unset any existing default pipelines
      if (updateData.is_default) {
        const pipeline = await PipelineModel.findById(pipelineId);
        if (pipeline) {
          await this.unsetDefaultPipelines(pipeline.company_id);
        }
      }

      const updatedPipeline = await PipelineModel.findByIdAndUpdate(
        pipelineId,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!updatedPipeline) {
        throw new CustomError("Pipeline not found", 404);
      }
      
      return updatedPipeline;
    } catch (error) {
      throw new CustomError(error);
    }
  }

  async deletePipeline(pipelineId) {
    try {
      // Check if pipeline exists
      const pipeline = await PipelineModel.findById(pipelineId);
      
      if (!pipeline) {
        throw new CustomError("Pipeline not found", 404);
      }
      
      // Don't allow deletion of default pipeline
      if (pipeline.is_default) {
        throw new CustomError("Cannot delete the default pipeline", 400);
      }
      
      // Check if this pipeline is being used in any deals
      // This would require a Deal model check, but we'll implement this later
      // when we have the Deal model
      
      await PipelineModel.findByIdAndDelete(pipelineId);
      
      return { message: "Pipeline deleted successfully" };
    } catch (error) {
      throw new CustomError(error);
    }
  }

  async unsetDefaultPipelines(companyId) {
    try {
      await PipelineModel.updateMany(
        { company_id: companyId, is_default: true },
        { is_default: false }
      );
    } catch (error) {
      throw new CustomError(error);
    }
  }

  async getDefaultPipeline(companyId) {
    try {
      const defaultPipeline = await PipelineModel.findOne({
        company_id: companyId,
        is_default: true
      });
      
      return defaultPipeline;
    } catch (error) {
      throw new CustomError(error);
    }
  }
}

export default PipelineRepository;
