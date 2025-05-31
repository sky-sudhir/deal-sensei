import { UserModel } from "./user.schema.js";
import CustomError from "../../utils/CustomError.js";

class UserRepository {
  async createUser(userData) {
    try {
      const user = await UserModel.create(userData);
      // Don't return the password in the response
      const userResponse = user.toObject();
      delete userResponse.password;
      return userResponse;
    } catch (error) {
      throw new CustomError(error);
    }
  }

  async findUserByEmail(email) {
    try {
      const user = await UserModel.findOne({ email });
      return user;
    } catch (error) {
      throw new CustomError(error);
    }
  }

  async findUserById(userId) {
    try {
      const user = await UserModel.findById(userId).select("-password");
      
      if (!user) {
        throw new CustomError("User not found", 404);
      }
      
      return user;
    } catch (error) {
      throw new CustomError(error);
    }
  }

  async updateUser(userId, updateData) {
    try {
      // Don't allow role updates through this method for security
      if (updateData.role) {
        delete updateData.role;
      }

      const user = await UserModel.findById(userId);
      
      if (!user) {
        throw new CustomError("User not found", 404);
      }

      // If updating password, it will be automatically hashed by the pre-save hook
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      ).select("-password");
      
      return updatedUser;
    } catch (error) {
      throw new CustomError(error);
    }
  }

  async getUsersByCompany(companyId, query = {}) {
    try {
      // Combine the company filter with any additional query filters
      const combinedQuery = { 
        company_id: companyId,
        ...query
      };
      
      const users = await UserModel.find(combinedQuery)
        .select("-password")
        .sort({ name: 1 });
        
      return users;
    } catch (error) {
      throw new CustomError(error);
    }
  }

  async deactivateUser(userId) {
    try {
      const user = await UserModel.findById(userId);
      
      if (!user) {
        throw new CustomError("User not found", 404);
      }

      // Check if this is the only admin user for the company
      if (user.role === "admin") {
        const adminCount = await UserModel.countDocuments({
          company_id: user.company_id,
          role: "admin",
          is_active: true
        });

        if (adminCount <= 1) {
          throw new CustomError("Cannot deactivate the only admin user", 400);
        }
      }

      // Instead of hard deleting, set is_active to false
      user.is_active = false;
      await user.save();
      
      return { message: "User deactivated successfully" };
    } catch (error) {
      throw new CustomError(error);
    }
  }
}

export default UserRepository;
