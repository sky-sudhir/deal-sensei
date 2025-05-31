import Response from "../../utils/apiResponse.js";
import UserRepository from "./user.repository.js";
import jwt from "jsonwebtoken";
import "dotenv/config";

class UserController {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async deactivateUser(req, res, next) {
    const response = new Response(res);
    try {
      const { id } = req.params;

      // Check if user exists and belongs to the same company
      const user = await this.userRepository.findUserById(id);

      if (!user) {
        return response.notFound("User not found");
      }

      // Ensure user belongs to the same company
      if (user.company_id.toString() !== req.user.company_id.toString()) {
        return response.forbidden(
          "You do not have permission to deactivate this user"
        );
      }

      // Don't allow deactivating yourself
      if (user._id.toString() === req.user._id.toString()) {
        return response.badRequest("You cannot deactivate your own account");
      }

      // Update user to inactive
      const updatedUser = await this.userRepository.updateUser(id, {
        is_active: false,
      });

      return response.success(updatedUser, "User deactivated successfully");
    } catch (error) {
      next(error);
    }
  }

  async createUser(req, res, next) {
    const response = new Response(res);
    try {
      // Ensure company_id is set from the authenticated user's company
      if (req.user && req.user.company_id) {
        req.body.company_id = req.user.company_id;
      }

      const user = await this.userRepository.createUser(req.body);
      return response.success(user, "User created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async getUsersByCompany(req, res, next) {
    const response = new Response(res);
    try {
      // Get company_id from authenticated user
      const companyId = req.user.company_id;

      // Only get active users by default
      const query = { is_active: req.query?.showInactive === "true" };

      // If showAll query param is true and user is admin, show all users
      if (req.query.showAll === "true" && req.user.role === "admin") {
        delete query.is_active;
      }

      const users = await this.userRepository.getUsersByCompany(
        companyId,
        query
      );
      return response.success(users, "Users retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    const response = new Response(res);
    try {
      const { id } = req.params;
      const user = await this.userRepository.findUserById(id);

      // Check if user belongs to the same company as the authenticated user
      if (user.company_id.toString() !== req.user.company_id.toString()) {
        return response.forbidden(
          "You do not have permission to access this user"
        );
      }

      return response.success(user, "User retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    const response = new Response(res);
    try {
      const { id } = req.params;

      // Get the user to be updated
      const userToUpdate = await this.userRepository.findUserById(id);

      // Check if user belongs to the same company as the authenticated user
      if (
        userToUpdate.company_id.toString() !== req.user.company_id.toString()
      ) {
        return response.forbidden(
          "You do not have permission to update this user"
        );
      }

      // Only admins can update other users
      if (id !== req.user.userId && req.user.role !== "admin") {
        return response.forbidden(
          "You do not have permission to update this user"
        );
      }

      const updatedUser = await this.userRepository.updateUser(id, req.body);
      return response.success(updatedUser, "User updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async deactivateUser(req, res, next) {
    const response = new Response(res);
    try {
      const { id } = req.params;

      // Get the user to be deactivated
      const userToDeactivate = await this.userRepository.findUserById(id);

      // Check if user belongs to the same company as the authenticated user
      if (
        userToDeactivate.company_id.toString() !==
        req.user.company_id.toString()
      ) {
        return response.forbidden(
          "You do not have permission to deactivate this user"
        );
      }

      // Only admins can deactivate users
      if (req.user.role !== "admin") {
        return response.forbidden(
          "You do not have permission to deactivate users"
        );
      }

      // Prevent self-deactivation
      if (id === req.user.userId) {
        return response.badRequest("You cannot deactivate your own account");
      }

      const result = await this.userRepository.deactivateUser(id);
      return response.success(result, "User deactivated successfully");
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
