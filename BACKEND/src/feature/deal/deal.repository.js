import { DealModel } from "./deal.schema.js";
import CustomError from "../../utils/CustomError.js";

class DealRepository {
  async createDeal(dealData) {
    try {
      const deal = await DealModel.create(dealData);
      return deal;
    } catch (error) {
      throw new CustomError(error);
    }
  }

  async findDealById(dealId) {
    try {
      const deal = await DealModel.findById(dealId)
        .populate('contact_ids', 'name email phone')
        .populate('owner_id', 'name email')
        .populate('pipeline_id', 'name stages');
      
      if (!deal) {
        throw new CustomError("Deal not found", 404);
      }
      
      return deal;
    } catch (error) {
      throw new CustomError(error);
    }
  }

  async getDealsByCompany(companyId, options = {}) {
    try {
      const { search, limit = 10, page = 1, ownerId, status, pipelineId } = options;
      const skip = (page - 1) * limit;
      
      // Base query
      const query = { company_id: companyId };
      
      // Add owner filter if provided (for sales reps)
      if (ownerId) {
        query.owner_id = ownerId;
      }
      
      // Add status filter if provided
      if (status) {
        query.status = status;
      }
      
      // Add pipeline filter if provided
      if (pipelineId) {
        query.pipeline_id = pipelineId;
      }
      
      // Add search filter if provided
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { notes: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Execute query with pagination
      const deals = await DealModel.find(query)
        .populate('contact_ids', 'name email')
        .populate('owner_id', 'name email')
        .populate('pipeline_id', 'name stages')
        .sort({ updated_at: -1 })
        .skip(skip)
        .limit(limit);
      
      // Get total count for pagination
      const total = await DealModel.countDocuments(query);
      
      return {
        deals,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new CustomError(error);
    }
  }

  async updateDeal(dealId, updateData) {
    try {
      const updatedDeal = await DealModel.findByIdAndUpdate(
        dealId,
        updateData,
        { new: true, runValidators: true }
      ).populate('contact_ids', 'name email phone')
       .populate('owner_id', 'name email')
       .populate('pipeline_id', 'name stages');
      
      if (!updatedDeal) {
        throw new CustomError("Deal not found", 404);
      }
      
      return updatedDeal;
    } catch (error) {
      throw new CustomError(error);
    }
  }

  async deleteDeal(dealId) {
    try {
      const deletedDeal = await DealModel.findByIdAndDelete(dealId);
      
      if (!deletedDeal) {
        throw new CustomError("Deal not found", 404);
      }
      
      return { message: "Deal deleted successfully" };
    } catch (error) {
      throw new CustomError(error);
    }
  }

  async getDealsByPipeline(pipelineId) {
    try {
      const deals = await DealModel.find({ pipeline_id: pipelineId, status: 'open' })
        .select('_id title');
      return deals;
    } catch (error) {
      throw new CustomError(error);
    }
  }

  async getDealsByContact(contactId) {
    try {
      const deals = await DealModel.find({ contact_ids: contactId })
        .select('_id title status value')
        .sort({ updated_at: -1 });
      return deals;
    } catch (error) {
      throw new CustomError(error);
    }
  }

  async updateDealStage(dealId, stage, stageChangeData = {}) {
    try {
      // Get current timestamp
      const now = new Date();
      
      // Update stage and related metrics
      const updatedDeal = await DealModel.findByIdAndUpdate(
        dealId,
        {
          stage,
          ...stageChangeData,
          updated_at: now
        },
        { new: true, runValidators: true }
      );
      
      if (!updatedDeal) {
        throw new CustomError("Deal not found", 404);
      }
      
      return updatedDeal;
    } catch (error) {
      throw new CustomError(error);
    }
  }

  async transferOwnership(dealId, newOwnerId) {
    try {
      const updatedDeal = await DealModel.findByIdAndUpdate(
        dealId,
        { 
          owner_id: newOwnerId,
          updated_at: new Date()
        },
        { new: true, runValidators: true }
      )
      .populate('contact_ids', 'name email phone')
      .populate('owner_id', 'name email')
      .populate('pipeline_id', 'name stages');
      
      if (!updatedDeal) {
        throw new CustomError("Deal not found", 404);
      }
      
      return updatedDeal;
    } catch (error) {
      throw new CustomError(error);
    }
  }
}

export default DealRepository;
