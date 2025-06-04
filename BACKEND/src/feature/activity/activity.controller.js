import ActivityRepository from "./activity.repository.js";
import Response from "../../utils/apiResponse.js";
import CustomError from "../../utils/CustomError.js";

class ActivityController {
  constructor() {
    this.repository = new ActivityRepository();
  }

  /**
   * Create a new activity
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async createActivity(req, res, next) {
    const response = new Response(res);

    try {
      const { user } = req;

      // Add user and company IDs to the activity data
      const activityData = {
        ...req.body,
        user_id: user.userId,
        company_id: user.company_id,
      };

      const activity = await this.repository.createActivity(activityData);

      return response.success(activity, "Activity created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all activities with pagination and filters
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getActivities(req, res, next) {
    const response = new Response(res);

    try {
      const { user } = req;
      const { type, deal_id, contact_id, user_id, page, limit, sort, search } =
        req.query;

      // Build filters object
      const filters = { company_id: user.company_id };

      // Add optional filters if provided
      if (type && type !== "all") filters.type = type;
      if (deal_id && deal_id !== "all") filters.deal_id = deal_id;
      if (contact_id && contact_id !== "all") filters.contact_id = contact_id;

      // For sales_rep role, only show their own activities unless they're explicitly querying for another user
      if (user.role === "sales_rep" && !user_id) {
        filters.user_id = user.userId;
      } else if (user_id && user_id !== "all") {
        filters.user_id = user_id;
      }

      const options = {
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 10,
        sort: sort || "-created_at",
        search,
      };

      const result = await this.repository.getActivities(filters, options);

      return response.success(result, "Activities retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single activity by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getActivityById(req, res, next) {
    const response = new Response(res);
    try {
      const { id } = req.params;
      const { user } = req;

      const activity = await this.repository.getActivityById(
        id,
        user.company_id
      );

      return response.success(activity, "Activity retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update an activity
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async updateActivity(req, res, next) {
    const response = new Response(res);
    try {
      const { id } = req.params;
      const { user } = req;
      const updateData = req.body;

      delete updateData.company_id;
      delete updateData.user_id;

      const activity = await this.repository.updateActivity(
        id,
        user.company_id,
        updateData
      );

      return response.success(activity, "Activity updated successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete an activity
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async deleteActivity(req, res, next) {
    const response = new Response(res);
    try {
      const { id } = req.params;
      const { user } = req;

      await this.repository.deleteActivity(id, user.company_id);

      return response.success(null, "Activity deleted successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get activities for a specific deal
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getActivitiesByDeal(req, res, next) {
    const response = new Response(res);
    try {
      const { id } = req.params;
      const { user } = req;
      const { page, limit, sort } = req.query;

      const options = {
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 10,
        sort: sort || "-created_at",
      };

      const result = await this.repository.getActivitiesByDeal(
        id,
        user.company_id,
        options
      );

      return response.success(
        result,
        "Deal activities retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get activities for a specific contact
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getActivitiesByContact(req, res, next) {
    const response = new Response(res);

    try {
      const { id } = req.params;
      const { user } = req;
      const { page, limit, sort } = req.query;

      const options = {
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 10,
        sort: sort || "-created_at",
      };

      const result = await this.repository.getActivitiesByContact(
        id,
        user.company_id,
        options
      );

      return response.success(
        result,
        "Contact activities retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  }
}

export default ActivityController;
