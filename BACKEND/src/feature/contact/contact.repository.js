import { ContactModel } from "./contact.schema.js";
import CustomError from "../../utils/CustomError.js";

class ContactRepository {
  async createContact(contactData) {
    try {
      const contact = await ContactModel.create(contactData);
      return contact;
    } catch (error) {
      if (error.code === 11000) {
        throw new CustomError(
          "A contact with this email already exists in your company",
          400
        );
      }
      throw new CustomError(error);
    }
  }
  async getContactsByDeal(dealId) {
    try {
      const contacts = await ContactModel.find({ deal_id: dealId });
      return contacts;
    } catch (error) {
      throw new CustomError(error);
    }
  }

  async findContactById(contactId) {
    try {
      const contact = await ContactModel.findById(contactId)
        .populate("owner_id", "name email")
        .populate("company_id", "name");

      if (!contact) {
        throw new CustomError("Contact not found", 404);
      }

      return contact;
    } catch (error) {
      throw new CustomError(error);
    }
  }

  async getContactsByCompany(companyId, options = {}) {
    try {
      const { search, limit = 10, page = 1, ownerId } = options;
      const skip = (page - 1) * limit;

      // Base query
      const query = { company_id: companyId };

      // Add owner filter if provided (for sales reps)
      if (ownerId) {
        query.owner_id = ownerId;
      }

      // Add search filter if provided
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { notes: { $regex: search, $options: "i" } },
        ];
      }

      // Execute query with pagination
      const contacts = await ContactModel.find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit);

      // Get total count for pagination
      const total = await ContactModel.countDocuments(query);

      return {
        contacts,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new CustomError(error);
    }
  }

  async updateContact(contactId, updateData) {
    try {
      const updatedContact = await ContactModel.findByIdAndUpdate(
        contactId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedContact) {
        throw new CustomError("Contact not found", 404);
      }

      return updatedContact;
    } catch (error) {
      if (error.code === 11000) {
        throw new CustomError(
          "A contact with this email already exists in your company",
          400
        );
      }
      throw new CustomError(error);
    }
  }

  async deleteContact(contactId) {
    try {
      const deletedContact = await ContactModel.findByIdAndDelete(contactId);

      if (!deletedContact) {
        throw new CustomError("Contact not found", 404);
      }

      return { message: "Contact deleted successfully" };
    } catch (error) {
      throw new CustomError(error);
    }
  }

  async getContactsByIds(contactIds) {
    try {
      const contacts = await ContactModel.find({ _id: { $in: contactIds } });
      return contacts;
    } catch (error) {
      throw new CustomError(error);
    }
  }
}

export default ContactRepository;
