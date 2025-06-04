import Response from "../../utils/apiResponse.js";
import DealRepository from "./deal.repository.js";
import PipelineRepository from "../pipeline/pipeline.repository.js";
import ContactRepository from "../contact/contact.repository.js";

class DealController {
  constructor() {
    this.dealRepository = new DealRepository();
    this.pipelineRepository = new PipelineRepository();
    this.contactRepository = new ContactRepository();
  }

  async createDeal(req, res, next) {
    const response = new Response(res);
    try {
      if (req.user && req.user.company_id) {
        req.body.company_id = req.user.company_id;
      }
      // Set owner_id to the current user if not provided (for sales reps)
      if (!req.body.owner_id) {
        req.body.owner_id = req.user.userId;
      }

      const deal = await this.dealRepository.createDeal(req.body);
      return response.success(deal, "Deal created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async getDealsByCompany(req, res, next) {
    const response = new Response(res);
    try {
      // Get company_id from authenticated user
      const companyId = req.user.company_id;

      // Extract query parameters
      const { search, limit, page, status, pipeline_id } = req.query;

      // For sales reps, only show their deals
      const options = {
        search,
        limit,
        page,
        status,
        pipelineId: pipeline_id,
      };

      if (req.user.role === "sales_rep") {
        options.ownerId = req.user.userId;
      }

      const result = await this.dealRepository.getDealsByCompany(
        companyId,
        options
      );
      return response.success(result, "Deals retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async getDealById(req, res, next) {
    const response = new Response(res);
    try {
      const { id } = req.params;
      const deal = await this.dealRepository.findDealById(id);

      return response.success(deal, "Deal retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async updateDeal(req, res, next) {
    const response = new Response(res);
    try {
      const { id } = req.params;

      // Prevent changing company_id
      delete req.body.company_id;
      if (req.user.role === "sales_rep") {
        delete req.body.owner_id;
      }

      const updatedDeal = await this.dealRepository.updateDeal(id, req.body);
      return response.success(updatedDeal, "Deal updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async deleteDeal(req, res, next) {
    const response = new Response(res);
    try {
      const { id } = req.params;

      const result = await this.dealRepository.deleteDeal(id);
      return response.success(result, "Deal deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async updateDealStage(req, res, next) {
    const response = new Response(res);
    try {
      const { id } = req.params;
      const { stage } = req.body;

      if (!stage) {
        return response.badRequest("Stage is required");
      }

      // Get the deal to be updated
      const dealToUpdate = await this.dealRepository.findDealById(id);

      // Calculate stage duration
      const now = new Date();
      const updatedAt = new Date(dealToUpdate.updated_at);
      const stageDurationDays = Math.round(
        (now - updatedAt) / (1000 * 60 * 60 * 24)
      );

      // Update stage and duration metrics
      const stageChangeData = {
        stage_duration_days: stageDurationDays,
        total_deal_duration_days:
          dealToUpdate.total_deal_duration_days + stageDurationDays,
      };

      const updatedDeal = await this.dealRepository.updateDealStage(
        id,
        stage,
        stageChangeData
      );
      return response.success(updatedDeal, "Deal stage updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async transferDealOwnership(req, res, next) {
    const response = new Response(res);
    try {
      const { id } = req.params;
      const { new_owner_id } = req.body;

      if (!new_owner_id) {
        return response.badRequest("New owner ID is required");
      }

      // Only admins can transfer ownership
      if (req.user.role !== "admin") {
        return response.forbidden("Only admins can transfer deal ownership");
      }

      // Get the deal to be updated
      const dealToUpdate = await this.dealRepository.findDealById(id);

      // Check if deal belongs to the same company as the authenticated user
      if (
        dealToUpdate.company_id.toString() !== req.user.company_id.toString()
      ) {
        return response.forbidden(
          "You do not have permission to update this deal"
        );
      }

      const updatedDeal = await this.dealRepository.updateDeal(id, {
        owner_id: new_owner_id,
      });
      return response.success(
        updatedDeal,
        "Deal ownership transferred successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async getDealsByContact(req, res, next) {
    const response = new Response(res);
    try {
      const { contactId } = req.params;

      const deals = await this.dealRepository.getDealsByContact(contactId);
      return response.success(deals, "Deals retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async transferDealOwnership(req, res, next) {
    const response = new Response(res);
    try {
      const { id } = req.params;
      const { new_owner_id } = req.body;

      if (!new_owner_id) {
        return response.badRequest("New owner ID is required");
      }

      const updatedDeal = await this.dealRepository.transferOwnership(
        id,
        new_owner_id
      );

      return response.success(
        updatedDeal,
        "Deal ownership transferred successfully"
      );
    } catch (error) {
      next(error);
    }
  }
}

export default DealController;
