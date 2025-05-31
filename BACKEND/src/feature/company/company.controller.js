import Response from "../../utils/apiResponse.js";
import CompanyRepository from "./company.repository.js";

class CompanyController {
  constructor() {
    this.companyRepository = new CompanyRepository();
  }

  async createCompany(req, res, next) {
    const response = new Response(res);
    try {
      const company = await this.companyRepository.createCompany(req.body);
      return response.success(company, "Company created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async getAllCompanies(req, res, next) {
    const response = new Response(res);
    try {
      // Only get active companies by default
      const query = { isActive: true };
      
      // If showAll query param is true and user is SUPERADMIN, show all companies
      if (req.query.showAll === "true" && req.user.role === "SUPERADMIN") {
        delete query.isActive;
      }
      
      const companies = await this.companyRepository.getAllCompanies(query);
      return response.success(companies, "Companies retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async getCompanyById(req, res, next) {
    const response = new Response(res);
    try {
      const { id } = req.params;
      const company = await this.companyRepository.getCompanyById(id);
      return response.success(company, "Company retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async updateCompany(req, res, next) {
    const response = new Response(res);
    try {
      const { id } = req.params;
      const updatedCompany = await this.companyRepository.updateCompany(id, req.body);
      return response.success(updatedCompany, "Company updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async deleteCompany(req, res, next) {
    const response = new Response(res);
    try {
      const { id } = req.params;
      const result = await this.companyRepository.deleteCompany(id);
      return response.success(result, "Company deactivated successfully");
    } catch (error) {
      next(error);
    }
  }

  async getCurrentCompany(req, res, next) {
    const response = new Response(res);
    try {
      // Get company ID from authenticated user
      const companyId = req.user.company_id;
      
      const company = await this.companyRepository.getCompanyById(companyId);
      return response.success(company, "Company retrieved successfully");
    } catch (error) {
      next(error);
    }
  }
}

export default CompanyController;
