import { ActivityModel } from "./activity.schema.js";
import CustomError from "../../utils/CustomError.js";
import mongoose from "mongoose";

class ActivityRepository {
  /**
   * Create a new activity
   * @param {Object} activityData - Activity data
   * @returns {Promise<Object>} Created activity
   */
  async createActivity(activityData) {
    try {
      const activity = await ActivityModel.create(activityData);
      return activity;
    } catch (error) {
      throw new CustomError(error);
    }
  }

  /**
   * Get activities with pagination and filters
   * @param {Object} filters - Query filters
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<Object>} Activities and pagination info
   */
  async getActivities(filters, options) {
    try {
      const { page = 1, limit = 10, sort = "-created_at", search } = options;
      const skip = (page - 1) * limit;

      // Handle search parameter if provided
      if (search) {
        // Create a text search filter
        filters.$or = [
          { subject: { $regex: search, $options: "i" } },
          { content: { $regex: search, $options: "i" } },
          { type: { $regex: search, $options: "i" } },
        ];
      }

      const query = ActivityModel.find(filters)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("user_id", "name email")
        .populate("deal_id", "title value")
        .populate("contact_id", "name email");

      const [activities, total] = await Promise.all([
        query.exec(),
        ActivityModel.countDocuments(filters),
      ]);

      return {
        activities,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new CustomError(error);
    }
  }

  /**
   * Get a single activity by ID
   * @param {string} activityId - Activity ID
   * @param {string} companyId - Company ID
   * @returns {Promise<Object>} Activity
   */
  async getActivityById(activityId, companyId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(activityId)) {
        throw new CustomError("Invalid activity ID", 400);
      }

      const activity = await ActivityModel.findOne({
        _id: activityId,
        company_id: companyId,
      })
        .populate("user_id", "name email")
        .populate("deal_id", "title value")
        .populate("contact_id", "name email");

      if (!activity) {
        throw new CustomError("Activity not found", 404);
      }

      return activity;
    } catch (error) {
      throw new CustomError(error);
    }
  }

  /**
   * Update an activity
   * @param {string} activityId - Activity ID
   * @param {string} companyId - Company ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated activity
   */
  async updateActivity(activityId, companyId, updateData) {
    try {
      if (!mongoose.Types.ObjectId.isValid(activityId)) {
        throw new CustomError("Invalid activity ID", 400);
      }

      const activity = await ActivityModel.findOneAndUpdate(
        { _id: activityId, company_id: companyId },
        updateData,
        { new: true, runValidators: true }
      )
        .populate("user_id", "name email")
        .populate("deal_id", "title value")
        .populate("contact_id", "name email");

      if (!activity) {
        throw new CustomError("Activity not found", 404);
      }

      return activity;
    } catch (error) {
      throw new CustomError(error);
    }
  }

  /**
   * Delete an activity
   * @param {string} activityId - Activity ID
   * @param {string} companyId - Company ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteActivity(activityId, companyId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(activityId)) {
        throw new CustomError("Invalid activity ID", 400);
      }

      const activity = await ActivityModel.findOneAndDelete({
        _id: activityId,
        company_id: companyId,
      });

      if (!activity) {
        throw new CustomError("Activity not found", 404);
      }

      return true;
    } catch (error) {
      throw new CustomError(error);
    }
  }

  /**
   * Get activities for a specific deal
   * @param {string} dealId - Deal ID
   * @param {string} companyId - Company ID
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<Object>} Activities and pagination info
   */
  async getActivitiesByDeal(dealId, companyId, options) {
    try {
      if (!mongoose.Types.ObjectId.isValid(dealId)) {
        throw new CustomError("Invalid deal ID", 400);
      }

      const filters = { deal_id: dealId, company_id: companyId };
      return await this.getActivities(filters, options);
    } catch (error) {
      throw new CustomError(error);
    }
  }

  /**
   * Get activities for a specific contact
   * @param {string} contactId - Contact ID
   * @param {string} companyId - Company ID
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<Object>} Activities and pagination info
   */
  async getActivitiesByContact(contactId, companyId, options) {
    try {
      if (!mongoose.Types.ObjectId.isValid(contactId)) {
        throw new CustomError("Invalid contact ID", 400);
      }

      const filters = { contact_id: contactId, company_id: companyId };
      return await this.getActivities(filters, options);
    } catch (error) {
      throw new CustomError(error);
    }
  }

  /**
   * Get activities for a specific user
   * @param {string} userId - User ID
   * @param {string} companyId - Company ID
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<Object>} Activities and pagination info
   */
  async getActivitiesByUser(userId, companyId, options) {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new CustomError("Invalid user ID", 400);
      }

      const filters = { user_id: userId, company_id: companyId };
      return await this.getActivities(filters, options);
    } catch (error) {
      throw new CustomError(error);
    }
  }
}

export default ActivityRepository;
