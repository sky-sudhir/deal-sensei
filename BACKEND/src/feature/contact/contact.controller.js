import Response from "../../utils/apiResponse.js";
import ContactRepository from "./contact.repository.js";

class ContactController {
  constructor() {
    this.contactRepository = new ContactRepository();
  }

  async createContact(req, res, next) {
    const response = new Response(res);
    try {
      // Ensure company_id is set from the authenticated user's company
      if (req.user && req.user.company_id) {
        req.body.company_id = req.user.company_id;
      }

      // Set owner_id to the current user if not provided (for sales reps)
      if (!req.body.owner_id) {
        req.body.owner_id = req.user.userId;
      }
      const contact = await this.contactRepository.createContact(req.body);
      return response.success(contact, "Contact created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async getContactsByCompany(req, res, next) {
    const response = new Response(res);
    try {
      // Get company_id from authenticated user
      const companyId = req.user.company_id;

      // Extract query parameters
      const { search, limit, page } = req.query;

      // For sales reps, only show their contacts
      const options = { search, limit, page };
      if (req.user.role === "sales_rep") {
        options.ownerId = req.user.userId;
      }

      const result = await this.contactRepository.getContactsByCompany(
        companyId,
        options
      );
      return response.success(result, "Contacts retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async getContactById(req, res, next) {
    const response = new Response(res);
    try {
      const { id } = req.params;
      const contact = await this.contactRepository.findContactById(id);

      // For sales reps, check if they own the contact
      if (
        req.user.role === "sales_rep" &&
        contact.owner_id.toString() !== req.user.userId.toString()
      ) {
        return response.forbidden(
          "You do not have permission to access this contact"
        );
      }

      return response.success(contact, "Contact retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async updateContact(req, res, next) {
    const response = new Response(res);
    try {
      const { id } = req.params;

      // Get the contact to be updated
      const contactToUpdate = await this.contactRepository.findContactById(id);

      // For sales reps, check if they own the contact
      if (
        req.user.role === "sales_rep" &&
        contactToUpdate.owner_id.toString() !== req.user.userId.toString()
      ) {
        return response.forbidden(
          "You do not have permission to update this contact"
        );
      }

      // For sales reps, check if they own the contact
      if (
        req.user.role === "sales_rep" &&
        contactToUpdate.owner_id.toString() !== req.user.userId.toString()
      ) {
        return response.forbidden(
          "You do not have permission to update this contact"
        );
      }

      // Prevent changing company_id
      delete req.body.company_id;

      // For sales reps, prevent changing owner_id
      if (req.user.role === "sales_rep") {
        delete req.body.owner_id;
      }

      const updatedContact = await this.contactRepository.updateContact(
        id,
        req.body
      );
      return response.success(updatedContact, "Contact updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async deleteContact(req, res, next) {
    const response = new Response(res);
    try {
      const { id } = req.params;

      // Get the contact to be deleted
      const contactToDelete = await this.contactRepository.findContactById(id);

      // For sales reps, check if they own the contact
      if (
        req.user.role === "sales_rep" &&
        contactToDelete.owner_id.toString() !== req.user.userId.toString()
      ) {
        return response.forbidden(
          "You do not have permission to delete this contact"
        );
      }

      // For sales reps, check if they own the contact
      if (
        req.user.role === "sales_rep" &&
        contactToDelete.owner_id.toString() !== req.user.userId.toString()
      ) {
        return response.forbidden(
          "You do not have permission to delete this contact"
        );
      }

      // TODO: Check if contact is linked to any deals before deleting

      const result = await this.contactRepository.deleteContact(id);
      return response.success(result, "Contact deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async transferContactOwnership(req, res, next) {
    const response = new Response(res);
    try {
      const { id } = req.params;
      const { new_owner_id } = req.body;

      if (!new_owner_id) {
        return response.badRequest("New owner ID is required");
      }

      // Only admins can transfer ownership
      if (req.user.role !== "admin") {
        return response.forbidden("Only admins can transfer contact ownership");
      }

      // Get the contact to be updated
      const contactToUpdate = await this.contactRepository.findContactById(id);

      // For sales reps, check if they own the contact
      if (
        req.user.role === "sales_rep" &&
        contactToUpdate.owner_id.toString() !== req.user.userId.toString()
      ) {
        return response.forbidden(
          "You do not have permission to update this contact"
        );
      }

      const updatedContact = await this.contactRepository.updateContact(id, {
        owner_id: new_owner_id,
      });
      return response.success(
        updatedContact,
        "Contact ownership transferred successfully"
      );
    } catch (error) {
      next(error);
    }
  }
}

export default ContactController;
