import Response from "../../utils/apiResponse.js";
import CustomError from "../../utils/CustomError.js";
import AiRepository from "./ai.repository.js";
import DealRepository from "../deal/deal.repository.js";
import ContactRepository from "../contact/contact.repository.js";
import "dotenv/config";
import { textParser } from "../../utils/textParser.js";
import ActivityRepository from "../activity/activity.repository.js";
import MessageRepository from "../message/message.repository.js";

class AiController {
  constructor() {
    this.aiRepository = new AiRepository();
    this.dealRepository = new DealRepository();
    this.contactRepository = new ContactRepository();
    this.activityRepository = new ActivityRepository();
    this.messageRepository = new MessageRepository();
  }

  // Deal Coach endpoint
  async getDealCoach(req, res, next) {
    const response = new Response(res);
    try {
      const { deal_id } = req.params;
      const { company_id } = req.user;

      // Check if deal exists and belongs to the company
      const deal = await this.dealRepository.findDealById(deal_id);
      if (!deal) {
        throw new CustomError("Deal not found", 404);
      }

      const dealQuery = `Retrieve all notes, emails, calls, meetings, and summaries related to the ${deal.title} with value ${deal.value}. Prioritize documents that reveal goals, challenges, communication style, tone, and product usage behavior. Return only the most relevant and descriptive documents that provide insight into this deal’s personality, preferences, and decision-making style.`;

      const dealEmbedding = await this.aiRepository.generateEmbeddingForText(
        dealQuery
      );

      const similarEntities = await this.aiRepository.findSimilarEntities(
        dealEmbedding,
        company_id,
        [deal_id],
        deal.contact_ids.map((v) => v._id.toString()),
        5
      );

      const contextString = similarEntities
        .map((r, i) => `Example ${i + 1}: ${r.content_summary}`)
        .join("\n")
        .slice(0, 7000);

      const prompt = `You are an AI-powered Deal Coach for a CRM system. Analyze this deal and provide actionable insights.
      
     
      RELEVANT CONTEXT:
      ${contextString}
      
      Please provide a JSON response with the following structure:
      {
        "deal_coach": {
          "cold_start": (boolean, true if the deal is in the "Prospecting" stage and there is not enough data to generate insights),
          "message": (1-2 sentence message for the sales rep),
          "recommendations": [(array of 2-3 recommendations for the sales rep)],
          "health_score": (integer, 0-100, null if cold_start is true),
          "risks": [(array of 2-3 risks for the sales rep)],
           "stage_analysis": {
          "is_overdue": (boolean based on typical deal velocity),
          "next_steps": [(array of suggested next steps to advance the deal)]
        },
        "activity_analysis": {
          "engagement_quality": (string assessment of engagement),
          "suggested_activities": [(array of suggested activities to improve engagement)]
        }
        }
      }
      
      Ensure your response is in valid JSON format without any explanation text outside the JSON structure.
      `;

      const aiResponse = await this.aiRepository.generateAIContentUsingPrompt(
        prompt
      );

      let dealCoachAnalysis;
      try {
        dealCoachAnalysis = textParser(aiResponse);
      } catch (parseError) {
        throw new CustomError(parseError, 500);
      }

      return response.success(
        { data: dealCoachAnalysis, prompt },
        "Deal coach analysis generated successfully"
      );
    } catch (error) {
      console.error("Error in getDealCoach:", error);
      next(error);
    }
  }

  // Persona Builder endpoint
  async getPersonaBuilder(req, res, next) {
    const response = new Response(res);
    try {
      const { contact_id } = req.params;
      const { company_id } = req.user;

      // Check if contact exists and belongs to the company
      const contact = await this.contactRepository.findContactById(contact_id);
      if (!contact) {
        throw new CustomError("Contact not found", 404);
      }

      const deals = await this.dealRepository.getDealsByContact(contact_id);

      const personaQuery = `Retrieve all notes Deals activity email call meeting summaries and other interactions related to the ${contact.name}. Prioritize documents that reveal goals, challenges, communication style, tone, and product usage behavior. Return only the most relevant and descriptive documents that provide insight into this contact’s personality, preferences, and decision-making style.`;

      const personaEmbedding = await this.aiRepository.generateEmbeddingForText(
        personaQuery
      );

      const similarEntities = await this.aiRepository.findSimilarEntities(
        personaEmbedding,
        company_id,
        deals.map((d) => d._id.toString()),
        [contact_id],
        5
      );

      const contextString = similarEntities
        .map((r, i) => `Example ${i + 1}: ${r.content_summary}`)
        .join("\n")
        .slice(0, 7000);

      const prompt = `You are an AI-powered Persona Builder for a CRM system. Analyze this contact's data and create a behavioral profile for the given context.

      context : ${contextString}

       Provide a JSON response with the following structure:
      {
        "persona": {
          "communication_style": (one of: "Direct", "Analytical", "Consensus-driven", "Expressive"),
          "description": (2-3 sentence description of communication style)
        },
        "motivators": [(array of 2-3 primary motivators for this contact)],
        "decision_pattern": {
          "type": (one of: "Data-driven", "Emotional", "Collaborative", "Authority-based"),
          "description": (1-2 sentence explanation of decision-making approach)
        },
        "engagement_tips": [(array of 3-5 specific tips for engaging with this contact)]
      }
      
      Ensure your response is in valid JSON format without any explanation text outside the JSON structure.
       `;

      const aiResponse = await this.aiRepository.generateAIContentUsingPrompt(
        prompt
      );

      let personaAnalysis;
      try {
        personaAnalysis = textParser(aiResponse);
      } catch (parseError) {
        throw new CustomError(parseError, 500);
      }

      return response.success(
        { data: personaAnalysis, prompt },
        "Persona analysis generated successfully"
      );
    } catch (error) {
      console.error("Error in getPersonaBuilder:", error);
      next(error);
    }
  }

  async handleChatbot(req, res, next) {
    const response = new Response(res);
    try {
      const { objection_text, deal_id = null, contact_id = null } = req.body;
      const { company_id } = req.user;

      const contactIds = [];
      const dealIds = [];

      let textToEmbed = "";

      if (contact_id) {
        contactIds.push(contact_id);
        const similarDeals = await this.dealRepository.getDealsByContact(
          contact_id
        );
        dealIds.push(...similarDeals.map((d) => d._id.toString()));
        const contact = await this.contactRepository.findContactById(
          contact_id
        );
        textToEmbed = `Current Contact( Contact Name: ${contact.name}. Email: ${
          contact.email || ""
        }. Phone: ${contact.phone || ""}. Notes: ${contact.notes || ""}.`;
      }

      if (deal_id) {
        dealIds.push(deal_id);
        const similarContacts = await this.dealRepository.findDealById(deal_id);
        contactIds.push(
          ...similarContacts.contact_ids.map((c) => c._id.toString())
        );
        const deal = await this.dealRepository.findDealById(deal_id);
        textToEmbed = `Current Deal(Deal Title: ${deal.title}. Value: ${
          deal.value
        }.Deal Amount: ${deal.value} Stage: ${deal.stage}. Status: ${
          deal.status || "open"
        }. Close Date: ${deal.close_date || ""}. Notes: ${
          deal.notes || ""
        } Stage Duration : ${deal.stage_duration_days} Total Deal Duration : ${
          deal.total_deal_duration_days
        } )`;
      }

      // Generate embedding for the objection text
      const objectionEmbedding =
        await this.aiRepository.generateEmbeddingForText(
          objection_text + textToEmbed
        );

      const similarEntities = await this.aiRepository.findSimilarEntities(
        objectionEmbedding,
        company_id,
        dealIds,
        contactIds,
        5
      );

      const contextString = similarEntities
        .map((r, i) => `Example ${i + 1}: ${r.content_summary}`)
        .join("\n")
        .slice(0, 7000);

      const prompt = `You are an AI-powered CHATBOT for a CRM system. Analyze the CONTEXT and provide effective responses to the QUESTION which user asked.
      
      CONTEXT:
      ${contextString}

      QUESTION:
      ${objection_text}
`;

      const aiResponse = await this.aiRepository.generateAIContentUsingPrompt(
        prompt
      );

      return response.success(
        {
          data: aiResponse,
          prompt,
          objection_text: objection_text,
          textToEmbed,
          // contextString,
        },
        "Response generated successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Objection Handler endpoint
  async handleObjection(req, res, next) {
    const response = new Response(res);
    try {
      const { objection_text, deal_id = null, contact_id = null } = req.body;
      const { company_id } = req.user;

      const contactIds = [];
      const dealIds = [];

      if (contact_id) {
        contactIds.push(contact_id);
        const similarDeals = await this.dealRepository.getDealsByContact(
          contact_id
        );
        dealIds.push(...similarDeals.map((d) => d._id.toString()));
      }

      if (deal_id) {
        dealIds.push(deal_id);
        const similarContacts = await this.dealRepository.findDealById(deal_id);
        contactIds.push(
          ...similarContacts.contact_ids.map((c) => c._id.toString())
        );
      }

      console.log(contactIds, dealIds, "wwwwwwwwwwwwwwwww");
      // Generate embedding for the objection text
      const objectionEmbedding =
        await this.aiRepository.generateEmbeddingForText(objection_text);

      const similarEntities = await this.aiRepository.findSimilarEntities(
        objectionEmbedding,
        company_id,
        dealIds,
        contactIds,
        5
      );

      const contextString = similarEntities
        .map((r, i) => `Example ${i + 1}: ${r.content_summary}`)
        .join("\n")
        .slice(0, 7000);

      const prompt = `
      You are an AI-powered Objection Handler for a CRM system. Analyze this sales objection and provide effective responses.
     
      RELEVANT CONTEXT FROM SIMILAR OBJECTIONS AND DEALS:
      ${contextString}

      OBJECTION TEXT:
      ${objection_text}

      provide a JSON response with the following structure:
      {
        "category": (one of: "Price", "Timing", "Need", "Authority", "Competition", "Trust", "Technical", "Uncategorized"),
        "responses": [(array of 3-5 effective responses to this objection)],
        "follow_up_questions": [(array of 3 questions to better understand the objection)],
        "tone_advice": (string advice on tone to use when responding),
        "underlying_concerns": [(array of likely underlying concerns behind this objection)]
      }
      
      Ensure your response is in valid JSON format without any explanation text outside the JSON structure.
  `;

      const aiResponse = await this.aiRepository.generateAIContentUsingPrompt(
        prompt
      );

      let objectionHandlerAnalysis;
      try {
        objectionHandlerAnalysis = textParser(aiResponse);
      } catch (parseError) {
        throw new CustomError(parseError, 500);
      }

      return response.success(
        {
          data: { ...objectionHandlerAnalysis, objection_text },
          prompt,
          objection_text,
        },
        "Response generated successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Win-Loss Explainer endpoint
  async getWinLossExplainer(req, res, next) {
    const response = new Response(res);
    try {
      const { deal_id } = req.params;
      const { company_id } = req.user;

      // Check if deal exists and belongs to the company
      const deal = await this.dealRepository.findDealById(deal_id);
      if (!deal) {
        throw new CustomError("Deal not found", 404);
      }

      const winLossQuery = `Retrieve all notes, emails, calls, meetings, and summaries related to the ${deal.title} with value ${deal.value}. Prioritize documents that reveal goals, challenges, communication style, tone, and product usage behavior. Return only the most relevant and descriptive documents that provide insight into this deal’s personality, preferences, and decision-making style.`;

      const winLossEmbedding = await this.aiRepository.generateEmbeddingForText(
        winLossQuery
      );

      const similarEntities = await this.aiRepository.findSimilarEntities(
        winLossEmbedding,
        company_id,
        [deal_id],
        deal.contact_ids.map((v) => v._id.toString()),
        5
      );

      const contextString = similarEntities
        .map((r, i) => `Example ${i + 1}: ${r.content_summary}`)
        .join("\n")
        .slice(0, 7000);

      const prompt = `You are an AI-powered Win-Loss Analyzer for a CRM system. Analyze this ${
        deal.status === "won" ? "won" : "lost"
      } deal and explain the key factors.
      
      RELEVANT CONTEXT:
      ${contextString}

      DEAL INFORMATION:
      - Title: ${deal.title}
      - Value: ${deal.value}
      - Final Stage: ${deal.stage}
      - Status: ${deal.status} (${deal.status === "won" ? "WON" : "LOST"})
      - Close Date: ${deal.close_date}
      
     provide a JSON response with the following structure:
      {
        "outcome": "${deal.status}",
        "deal_value": ${deal.value},
        "key_factors": [
          {
            "name": (factor name, e.g., "Price", "Timing", "Product Fit", etc.),
            "impact": (number 1-5, with 5 being highest impact),
            "description": (detailed explanation of how this factor influenced the outcome)
          },
          ... (include 4-6 factors)
        ],
        "recommendations": [(array of 3-5 specific recommendations based on this analysis)],
        "lessons_learned": [(array of 2-3 key lessons to apply to future deals)]
      }
      
      Ensure your response is in valid JSON format without any explanation text outside the JSON structure.
     `;

      const aiResponse = await this.aiRepository.generateAIContentUsingPrompt(
        prompt
      );
      let winLossAnalysis;
      try {
        winLossAnalysis = textParser(aiResponse);
      } catch (parseError) {
        throw new CustomError(parseError, 500);
      }

      return response.success(
        { data: winLossAnalysis, prompt },
        "Win-Loss analysis generated successfully"
      );
    } catch (error) {
      next(error);
    }
  }
}

export default AiController;
