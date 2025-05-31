import { CompanyModel } from "./company.schema.js";
import CustomError from "../../utils/CustomError.js";

class CompanyRepository {
  async createCompany(companyData) {
    try {
      const company = await CompanyModel.create(companyData);
      return company;
    } catch (error) {
      throw new CustomError(error);
    }
  }
  
  async findCompanyByEmail(email) {
    try {
      const company = await CompanyModel.findOne({ email });
      return company;
    } catch (error) {
      throw new CustomError(error);
    }
  }

  async getAllCompanies(query = {}) {
    try {
      const companies = await CompanyModel.find(query).sort({ name: 1 });
      return companies;
    } catch (error) {
      throw new CustomError(error);
    }
  }

  async getCompanyById(companyId) {
    try {
      const company = await CompanyModel.findById(companyId);
      
      if (!company) {
        throw new CustomError("Company not found", 404);
      }
      
      return company;
    } catch (error) {
      throw new CustomError(error);
    }
  }

  async updateCompany(companyId, updateData) {
    try {
      const company = await CompanyModel.findById(companyId);
      
      if (!company) {
        throw new CustomError("Company not found", 404);
      }

      const updatedCompany = await CompanyModel.findByIdAndUpdate(
        companyId,
        updateData,
        { new: true, runValidators: true }
      );
      
      return updatedCompany;
    } catch (error) {
      throw new CustomError(error);
    }
  }

  async deleteCompany(companyId) {
    try {
      const company = await CompanyModel.findById(companyId);
      
      if (!company) {
        throw new CustomError("Company not found", 404);
      }

      // Instead of hard deleting, set isActive to false
      company.isActive = false;
      await company.save();
      
      return { message: "Company deactivated successfully" };
    } catch (error) {
      throw new CustomError(error);
    }
  }
}

export default CompanyRepository;
