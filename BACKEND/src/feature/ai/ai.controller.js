import Response from "../../utils/apiResponse.js";
import CustomError from "../../utils/CustomError.js";
import AiRepository from "./ai.repository.js";
import DealRepository from "../deal/deal.repository.js";
import ContactRepository from "../contact/contact.repository.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  generateEmbedding,
  processTextForEmbedding,
  createEntityEmbedding,
} from "../../utils/aiUtils.js";
import mongoose from "mongoose";
import "dotenv/config";

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy-key");

class AiController {
  constructor() {
    this.aiRepository = new AiRepository();
    this.dealRepository = new DealRepository();
    this.contactRepository = new ContactRepository();
  }

  // Generate embeddings for entities that don't have them
  async generateEmbeddings(req, res, next) {
    try {
      const { entity_type, limit } = req.body;
      const { company_id } = req.user;

      // Validate entity type
      const validTypes = ["deal", "contact", "activity"];
      if (!validTypes.includes(entity_type)) {
        throw new CustomError(
          `Invalid entity type. Must be one of: ${validTypes.join(", ")}`,
          400
        );
      }

      // Set a reasonable limit
      const batchLimit = limit && limit > 0 && limit <= 500 ? limit : 100;

      // Generate embeddings
      const result = await this.aiRepository.batchGenerateEmbeddings(
        company_id,
        entity_type,
        batchLimit
      );

      return Response.success(
        res,
        result,
        `Successfully processed ${result.success} out of ${result.total} ${entity_type}s`,
        200
      );
    } catch (error) {
      next(error);
    }
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

      // Handle both populated and unpopulated company_id fields
      const dealCompanyId = deal.company_id._id ? deal.company_id._id.toString() : deal.company_id.toString();
      if (dealCompanyId !== company_id.toString()) {
        throw new CustomError("You don't have access to this deal", 403);
      }

      // Get deal data for analysis
      const dealData = await this.aiRepository.getDealDataForAnalysis(
        deal_id,
        company_id
      );

      // Check if there's enough data for AI analysis
      if (!dealData || dealData.activities.length === 0) {
        return response.success(
          {
            cold_start: true,
            message:
              "Not enough data for AI analysis. Add more activities to get insights.",
            recommendations: [],
            health_score: null,
            risks: [],
          },
          "Not enough data for AI analysis"
        );
      }

      // Ensure the deal has an embedding
      if (!deal.ai_embedding || deal.ai_embedding.length === 0) {
        // Generate and store embedding for the deal
        await this.aiRepository.generateAndStoreEmbeddingForDeal(deal);
      }

      // Get relevant context using vector similarity search
      const relevantContext = await this.aiRepository.getRelevantContextForDeal(
        deal,
        company_id
      );
      dealData.relevantContext = relevantContext;

      // Generate AI analysis
      let dealCoachAnalysis;
      try {
        // Try to use the AI-powered analysis
        dealCoachAnalysis = await this.generateDealCoachAnalysisWithAI(
          dealData
        );
      } catch (aiError) {
        console.error(
          "AI analysis failed, falling back to rule-based analysis:",
          aiError
        );
        // Fallback to rule-based analysis if AI fails
        dealCoachAnalysis = this.generateDealCoachAnalysis(dealData);
        dealCoachAnalysis.ai_error =
          "AI service unavailable, showing rule-based analysis";
      }

      return response.success(
        dealCoachAnalysis,
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

      // Handle both populated and unpopulated company_id fields
      const contactCompanyId = contact.company_id._id ? contact.company_id._id.toString() : contact.company_id.toString();
      if (contactCompanyId !== company_id.toString()) {
        throw new CustomError("You don't have access to this contact", 403);
      }

      // Get contact data for analysis
      const contactData = await this.aiRepository.getContactDataForAnalysis(
        contact_id,
        company_id
      );

      // Check if there's enough data for AI analysis
      if (!contactData || contactData.activities.length === 0) {
        return response.success(
          {
            cold_start: true,
            message:
              "Not enough data for AI analysis. Add more activities to get insights.",
            persona: null,
            motivators: [],
            decision_pattern: null,
          },
          "Not enough data for AI analysis"
        );
      }

      // Ensure the contact has an embedding
      if (!contact.ai_embedding || contact.ai_embedding.length === 0) {
        // Generate and store embedding for the contact
        await this.aiRepository.generateAndStoreEmbeddingForContact(contact);
      }

      // Get relevant context using vector similarity search
      const relevantContext =
        await this.aiRepository.getRelevantContextForContact(
          contact,
          company_id
        );
      contactData.relevantContext = relevantContext;

      // Generate AI analysis
      let personaAnalysis;
      try {
        // Try to use the AI-powered analysis
        personaAnalysis = await this.generatePersonaAnalysisWithAI(contactData);
      } catch (aiError) {
        console.error(
          "AI analysis failed, falling back to rule-based analysis:",
          aiError
        );
        // Fallback to rule-based analysis if AI fails
        personaAnalysis = this.generatePersonaAnalysis(contactData);
        personaAnalysis.ai_error =
          "AI service unavailable, showing rule-based analysis";
      }

      return response.success(
        personaAnalysis,
        "Persona analysis generated successfully"
      );
    } catch (error) {
      console.error("Error in getPersonaBuilder:", error);
      next(error);
    }
  }

  // Objection Handler endpoint
  async handleObjection(req, res, next) {
    const response = new Response(res);
    try {
      const { objection_text, deal_id } = req.body;
      const { company_id } = req.user;

      if (!objection_text) {
        throw new CustomError("Objection text is required", 400);
      }

      // Generate embedding for the objection text
      const objectionEmbedding =
        await this.aiRepository.generateEmbeddingForText(objection_text);

      // Store the objection embedding for future reference
      const objectionId = new mongoose.Types.ObjectId(); // Generate a new ID for this objection
      await this.aiRepository.storeEmbedding(
        "objection",
        objectionId,
        company_id,
        objectionEmbedding,
        objection_text.substring(0, 200) // Simple summary
      );

      let dealData = null;
      if (deal_id) {
        // Check if deal exists and belongs to the company
        const deal = await this.dealRepository.findDealById(deal_id);
        if (!deal) {
          throw new CustomError("Deal not found", 404);
        }

        // Handle both populated and unpopulated company_id fields
        const dealCompanyId = deal.company_id._id ? deal.company_id._id.toString() : deal.company_id.toString();
        if (dealCompanyId !== company_id.toString()) {
          throw new CustomError("You don't have access to this deal", 403);
        }

        dealData = await this.aiRepository.getDealDataForAnalysis(
          deal_id,
          company_id
        );
      }

      // Find similar objections using vector search for context
      const relevantContext =
        await this.aiRepository.getRelevantContextForObjection(
          objectionEmbedding,
          company_id
        );

      // Generate AI objection analysis
      let objectionAnalysis;
      try {
        // Try to use the AI-powered analysis
        objectionAnalysis = await this.generateObjectionAnalysisWithAI(
          objection_text,
          dealData,
          relevantContext
        );
      } catch (aiError) {
        console.error(
          "AI analysis failed, falling back to rule-based analysis:",
          aiError
        );
        // Fallback to rule-based analysis if AI fails
        objectionAnalysis = this.generateObjectionAnalysis(
          objection_text,
          dealData
        );
        objectionAnalysis.ai_error =
          "AI service unavailable, showing rule-based analysis";
      }

      return response.success(
        objectionAnalysis,
        "Objection analysis generated successfully"
      );
    } catch (error) {
      console.error("Error in handleObjection:", error);
      next(error);
    }
  }

  // Win-Loss Explainer endpoint
  async getWinLossExplainer(req, res, next) {
    const response = new Response(res);
    try {
      const { deal_id } = req.params;
      const { company_id } = req.user;

      if (!deal_id || !mongoose.Types.ObjectId.isValid(deal_id)) {
        throw new CustomError("Invalid deal ID format", 400);
      }

      // Check if deal exists and belongs to the company
      const deal = await this.dealRepository.findDealById(deal_id);
      if (!deal) {
        throw new CustomError("Deal not found", 404);
      }

      // Handle both populated and unpopulated company_id fields safely
      let dealCompanyId;
      try {
        dealCompanyId = deal.company_id && deal.company_id._id 
          ? deal.company_id._id.toString() 
          : deal.company_id.toString();
      } catch (error) {
        console.error("Error extracting company ID from deal:", error);
        throw new CustomError("Invalid deal data structure", 500);
      }

      // Verify company access
      if (dealCompanyId !== company_id.toString()) {
        throw new CustomError("You don't have access to this deal", 403);
      }

      // Check if deal is closed (won or lost)
      if (deal.status !== "won" && deal.status !== "lost") {
        throw new CustomError(
          "Deal must be closed (won or lost) for win-loss analysis",
          400
        );
      }

      // Ensure the deal has an embedding
      if (!deal.ai_embedding || deal.ai_embedding.length === 0) {
        try {
          // Generate and store embedding for the deal
          await this.aiRepository.generateAndStoreEmbeddingForDeal(deal);
        } catch (embeddingError) {
          console.error("Error generating embedding for deal:", embeddingError);
          // Continue without embedding - we'll use non-vector methods
        }
      }

      // Get deal data for analysis with error handling
      let dealData;
      try {
        dealData = await this.aiRepository.getDealDataForAnalysis(
          deal_id,
          company_id
        );
        
        if (!dealData) {
          throw new Error("Failed to retrieve deal data for analysis");
        }
      } catch (dataError) {
        console.error("Error retrieving deal data for analysis:", dataError);
        throw new CustomError("Failed to retrieve necessary deal data", 500);
      }

      // Get relevant context using vector similarity search
      try {
        const relevantContext = await this.aiRepository.getRelevantContextForDeal(
          deal,
          company_id
        );
        dealData.relevantContext = relevantContext || [];
      } catch (contextError) {
        console.error("Error retrieving context for deal:", contextError);
        // Continue without context if it fails
        dealData.relevantContext = [];
        dealData.contextError = "Could not retrieve similar deals context";
      }

      // Generate AI analysis
      let winLossAnalysis;
      try {
        // Try to use the AI-powered analysis
        winLossAnalysis = await this.generateWinLossAnalysisWithAI(dealData);
      } catch (aiError) {
        console.error(
          "AI analysis failed, falling back to rule-based analysis:",
          aiError
        );
        // Fallback to rule-based analysis if AI fails
        winLossAnalysis = this.generateWinLossAnalysis(dealData);
        winLossAnalysis.ai_error =
          "AI service unavailable, showing rule-based analysis";
      }

      // Add metadata to help frontend display appropriate messages
      winLossAnalysis.deal_status = deal.status;
      winLossAnalysis.deal_title = deal.title;
      winLossAnalysis.deal_value = deal.value;
      winLossAnalysis.analysis_date = new Date().toISOString();

      return response.success(
        winLossAnalysis,
        "Win-loss analysis generated successfully"
      );
    } catch (error) {
      console.error("Error in getWinLossExplainer:", error);
      
      // Handle specific error types with appropriate status codes
      if (error instanceof CustomError) {
        return next(error);
      } else if (error.name === "CastError") {
        return next(new CustomError("Invalid ID format", 400));
      } else if (error.name === "ValidationError") {
        return next(new CustomError("Validation error: " + error.message, 400));
      }
      
      next(new CustomError("Failed to generate win-loss analysis", 500));
    }
  }

  // Helper method to generate Deal Coach analysis
  generateDealCoachAnalysis(dealData) {
    const { deal, activities } = dealData;

    // Calculate days in current stage
    const now = new Date();
    const stageStartDate = deal.stage_updated_at || deal.created_at;
    const daysInStage = Math.floor(
      (now - stageStartDate) / (1000 * 60 * 60 * 24)
    );

    // Calculate health score based on activities and stage time
    const activityCount = activities.length;
    const hasRecentActivity =
      activityCount > 0 &&
      (new Date() - new Date(activities[0].created_at)) /
        (1000 * 60 * 60 * 24) <
        7;

    let healthScore = 70; // Base score

    // Adjust based on activity count
    if (activityCount > 5) healthScore += 10;
    else if (activityCount < 2) healthScore -= 15;

    // Adjust based on recent activity
    if (hasRecentActivity) healthScore += 10;
    else healthScore -= 15;

    // Adjust based on stage time
    if (daysInStage > 30) healthScore -= 20;

    // Clamp health score between 0 and 100
    healthScore = Math.max(0, Math.min(100, healthScore));

    // Generate recommendations based on deal state
    const recommendations = [];

    if (!hasRecentActivity) {
      recommendations.push(
        "Schedule a follow-up call this week to re-engage the prospect"
      );
    }

    if (daysInStage > 20) {
      recommendations.push(
        "Deal has been in current stage for too long. Consider discussing timeline or addressing potential blockers"
      );
    }

    if (activityCount < 3) {
      recommendations.push(
        "Increase engagement with more touchpoints (emails, calls, meetings)"
      );
    }

    // Identify risks
    const risks = [];

    if (daysInStage > 30) {
      risks.push("Stalled deal - no movement in over 30 days");
    }

    if (!hasRecentActivity) {
      risks.push("Engagement risk - no recent contact with prospect");
    }

    return {
      cold_start: false,
      health_score: healthScore,
      recommendations,
      risks,
      stage_analysis: {
        current_stage: deal.stage,
        days_in_stage: daysInStage,
        average_days_in_stage: 15, // This would be calculated from historical data
        is_overdue: daysInStage > 20,
      },
      activity_analysis: {
        total_activities: activityCount,
        recent_activity: hasRecentActivity,
        activity_trend: activityCount > 3 ? "increasing" : "decreasing",
      },
    };
  }

  // AI-powered method to generate Deal Coach analysis using Gemini
  async generateDealCoachAnalysisWithAI(dealData) {
    try {
      const { deal, activities, relevantContext } = dealData;

      // Calculate days in current stage for context
      const now = new Date();
      const stageStartDate = deal.stage_updated_at || deal.created_at;
      const daysInStage = Math.floor(
        (now - stageStartDate) / (1000 * 60 * 60 * 24)
      );

      // Format activities for the prompt
      const activitySummaries = activities
        .map((activity) => {
          return `- ${new Date(activity.created_at).toLocaleDateString()}: ${
            activity.type
          } - ${activity.content || "No content"}`;
        })
        .join("\n");

      // Format relevant context
      const contextSummaries =
        relevantContext && relevantContext.length > 0
          ? relevantContext
              .map((ctx) => {
                return `- ${ctx.entity_type} (${ctx.entity_id}): ${ctx.content_summary}`;
              })
              .join("\n")
          : "No relevant context available";

      // Create a structured prompt for the AI
      const prompt = `
      You are an AI-powered Deal Coach for a CRM system. Analyze this deal and provide actionable insights.
      
      DEAL INFORMATION:
      - Title: ${deal.title}
      - Value: ${deal.value}
      - Current Stage: ${deal.stage}
      - Days in Current Stage: ${daysInStage}
      - Notes: ${deal.notes || "No notes available"}
      
      RECENT ACTIVITIES (${activities.length}):
      ${activitySummaries || "No activities recorded"}
      
      RELEVANT CONTEXT FROM SIMILAR DEALS:
      ${contextSummaries}
      
      Please provide a JSON response with the following structure:
      {
        "health_score": (number between 0-100),
        "recommendations": [(array of 3-5 specific, actionable recommendations)],
        "risks": [(array of key risks facing this deal)],
        "stage_analysis": {
          "days_in_stage": ${daysInStage},
          "is_overdue": (boolean based on typical deal velocity),
          "next_steps": [(array of suggested next steps to advance the deal)]
        },
        "activity_analysis": {
          "total_activities": ${activities.length},
          "engagement_quality": (string assessment of engagement),
          "suggested_activities": [(array of suggested activities to improve engagement)]
        }
      }
      
      Ensure your response is in valid JSON format without any explanation text outside the JSON structure.
      `;

      // Use the generative model
      const generativeModel = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { temperature: 0.2 },
      });

      // Generate analysis
      const result = await generativeModel.generateContent(prompt);
      const analysisText = result.response.text();

      // Parse the JSON response
      let analysis;
      try {
        analysis = JSON.parse(analysisText);
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        // Extract JSON if surrounded by markdown or other text
        const jsonMatch = analysisText.match(/```json\n([\s\S]*)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          // Extract the content between the markdown code fences
          try {
            analysis = JSON.parse(jsonMatch[1]);
          } catch (innerParseError) {
            console.error("Error parsing extracted JSON:", innerParseError);
            // Try to find any JSON object in the response
            const fallbackMatch = analysisText.match(/\{[\s\S]*\}/);
            if (fallbackMatch) {
              try {
                analysis = JSON.parse(fallbackMatch[0]);
              } catch (fallbackError) {
                console.error("Fallback JSON parsing failed:", fallbackError);
                throw new Error("AI service returned unparseable response");
              }
            } else {
              throw new Error("AI service returned invalid response format");
            }
          }
        } else {
          // Try to find any JSON object in the response
          const fallbackMatch = analysisText.match(/\{[\s\S]*\}/);
          if (fallbackMatch) {
            try {
              analysis = JSON.parse(fallbackMatch[0]);
            } catch (fallbackError) {
              console.error("Fallback JSON parsing failed:", fallbackError);
              throw new Error("AI service returned unparseable response");
            }
          } else {
            throw new Error("AI service returned invalid response format");
          }
        }
      }

      // Add additional metadata
      return {
        cold_start: false,
        ai_generated: true,
        ...analysis,
      };
    } catch (error) {
      console.error("Error generating AI analysis:", error);
      throw new Error(`AI service error: ${error.message}`);
    }
  }

  // Helper method to generate Persona analysis
  generatePersonaAnalysis(contactData) {
    const { contact, activities } = contactData;

    // In a real implementation, this would analyze communication patterns
    // For this implementation, we'll generate a simulated response

    const communicationStyles = [
      "Direct",
      "Analytical",
      "Consensus-driven",
      "Expressive",
    ];
    const motivators = [
      "Cost savings",
      "Efficiency",
      "Innovation",
      "Reliability",
      "Status",
    ];
    const decisionPatterns = [
      "Data-driven",
      "Emotional",
      "Collaborative",
      "Authority-based",
    ];

    // Select random elements for demonstration
    const style =
      communicationStyles[
        Math.floor(Math.random() * communicationStyles.length)
      ];
    const selectedMotivators = [
      motivators[Math.floor(Math.random() * motivators.length)],
      motivators[Math.floor(Math.random() * motivators.length)],
    ];
    const decisionPattern =
      decisionPatterns[Math.floor(Math.random() * decisionPatterns.length)];

    return {
      cold_start: false,
      persona: {
        communication_style: style,
        description: `${
          contact.name
        } tends to communicate in a ${style.toLowerCase()} manner, focusing on ${selectedMotivators[0].toLowerCase()} and ${selectedMotivators[1].toLowerCase()}.`,
      },
      motivators: selectedMotivators,
      decision_pattern: {
        type: decisionPattern,
        description: `Makes decisions primarily through a ${decisionPattern.toLowerCase()} approach.`,
      },
      engagement_tips: [
        `When communicating with ${contact.name}, focus on ${selectedMotivators[0]}`,
        `Provide ${
          decisionPattern === "Data-driven"
            ? "detailed analytics"
            : "clear outcomes"
        }`,
        `Follow up with ${
          style === "Direct" ? "concise summaries" : "comprehensive details"
        }`,
      ],
    };
  }

  // AI-powered method to generate Persona analysis using Gemini
  async generatePersonaAnalysisWithAI(contactData) {
    try {
      const { contact, activities, deals, relevantContext } = contactData;

      // Format activities for the prompt
      const activitySummaries = activities
        .map((activity) => {
          return `- ${new Date(activity.created_at).toLocaleDateString()}: ${
            activity.type
          } - ${activity.content || "No content"}`;
        })
        .join("\n");

      // Format deals for the prompt
      const dealSummaries =
        deals && deals.length > 0
          ? deals
              .map((deal) => {
                return `- ${deal.title}: ${deal.value} (${deal.status})`;
              })
              .join("\n")
          : "No deals associated";

      // Format relevant context
      const contextSummaries = relevantContext
        ? relevantContext
            .map((ctx) => {
              return `- ${ctx.entity_type} (${ctx.entity_id}): ${ctx.content_summary}`;
            })
            .join("\n")
        : "No relevant context available";

      // Create a structured prompt for the AI
      const prompt = `
      You are an AI-powered Persona Builder for a CRM system. Analyze this contact's data and create a behavioral profile.
      
      CONTACT INFORMATION:
      - Name: ${contact.name}
      - Email: ${contact.email}
      - Phone: ${contact.phone || "Not provided"}
      - Notes: ${contact.notes || "No notes available"}
      
      RECENT ACTIVITIES (${activities.length}):
      ${activitySummaries || "No activities recorded"}
      
      ASSOCIATED DEALS:
      ${dealSummaries}
      
      RELEVANT CONTEXT FROM SIMILAR CONTACTS:
      ${contextSummaries}
      
      Please provide a JSON response with the following structure:
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

      // Use the generative model
      const generativeModel = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { temperature: 0.3 },
      });

      // Generate analysis
      const result = await generativeModel.generateContent(prompt);
      const analysisText = result.response.text();

      // Parse the JSON response
      let analysis;
      try {
        analysis = JSON.parse(analysisText);
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        // Extract JSON if surrounded by markdown or other text
        const jsonMatch = analysisText.match(/```json\n([\s\S]*)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          // Extract the content between the markdown code fences
          try {
            analysis = JSON.parse(jsonMatch[1]);
          } catch (innerParseError) {
            console.error("Error parsing extracted JSON:", innerParseError);
            // Try to find any JSON object in the response
            const fallbackMatch = analysisText.match(/\{[\s\S]*\}/);
            if (fallbackMatch) {
              try {
                analysis = JSON.parse(fallbackMatch[0]);
              } catch (fallbackError) {
                console.error("Fallback JSON parsing failed:", fallbackError);
                throw new Error("AI service returned unparseable response");
              }
            } else {
              throw new Error("AI service returned invalid response format");
            }
          }
        } else {
          // Try to find any JSON object in the response
          const fallbackMatch = analysisText.match(/\{[\s\S]*\}/);
          if (fallbackMatch) {
            try {
              analysis = JSON.parse(fallbackMatch[0]);
            } catch (fallbackError) {
              console.error("Fallback JSON parsing failed:", fallbackError);
              throw new Error("AI service returned unparseable response");
            }
          } else {
            throw new Error("AI service returned invalid response format");
          }
        }
      }

      // Add additional metadata
      return {
        cold_start: false,
        ai_generated: true,
        ...analysis,
      };
    } catch (error) {
      console.error("Error generating AI persona analysis:", error);
      throw new Error(`AI service error: ${error.message}`);
    }
  }

  // Helper method to generate Objection analysis
  generateObjectionAnalysis(objectionText, dealData) {
    // Categorize the objection
    const objectionCategories = [
      "Price",
      "Timing",
      "Need",
      "Authority",
      "Competition",
      "Trust",
      "Technical",
    ];

    // Simple keyword matching for demonstration
    let category = "Uncategorized";

    if (
      objectionText.toLowerCase().includes("expensive") ||
      objectionText.toLowerCase().includes("cost") ||
      objectionText.toLowerCase().includes("price")
    ) {
      category = "Price";
    } else if (
      objectionText.toLowerCase().includes("time") ||
      objectionText.toLowerCase().includes("soon") ||
      objectionText.toLowerCase().includes("wait")
    ) {
      category = "Timing";
    } else if (
      objectionText.toLowerCase().includes("need") ||
      objectionText.toLowerCase().includes("require") ||
      objectionText.toLowerCase().includes("necessary")
    ) {
      category = "Need";
    } else if (
      objectionText.toLowerCase().includes("manager") ||
      objectionText.toLowerCase().includes("approve") ||
      objectionText.toLowerCase().includes("decision")
    ) {
      category = "Authority";
    } else if (
      objectionText.toLowerCase().includes("competitor") ||
      objectionText.toLowerCase().includes("alternative") ||
      objectionText.toLowerCase().includes("other vendor")
    ) {
      category = "Competition";
    }

    // Generate responses based on category
    let responses = [];
    let followUpQuestions = [];

    switch (category) {
      case "Price":
        responses = [
          "I understand budget is a concern. Let's look at the ROI our solution provides...",
          "Rather than focusing solely on price, let's discuss the value and outcomes you'll achieve...",
          "We can explore different package options that might better fit your budget while still meeting your core needs...",
        ];
        followUpQuestions = [
          "What specific budget constraints are you working within?",
          "Which aspects of our solution are most valuable to you?",
          "Would a phased implementation approach help with budget allocation?",
        ];
        break;
      case "Timing":
        responses = [
          "I understand timing is important. Let's discuss what timeline would work better for you...",
          "While waiting might seem prudent, here are the costs of delaying implementation...",
          "We could start with a smaller pilot project to align with your current timing needs...",
        ];
        followUpQuestions = [
          "What specific timing concerns do you have?",
          "Is there a particular milestone or event you're waiting for?",
          "Would a phased rollout address your timing concerns?",
        ];
        break;
      case "Need":
        responses = [
          "Based on our discussions about [specific pain point], our solution directly addresses that need by...",
          "Other clients in your industry have seen [specific results] after implementing our solution...",
          "Let me clarify how our solution specifically addresses the challenges you mentioned earlier...",
        ];
        followUpQuestions = [
          "Which specific needs don't you feel are being addressed?",
          "How are you currently handling this challenge?",
          "What would an ideal solution look like to you?",
        ];
        break;
      default:
        responses = [
          "I appreciate you sharing that concern. Could you tell me more about your specific hesitation?",
          "That's a valid point. Let's discuss how we might address this concern specifically for your situation.",
          "I've heard similar concerns from other clients who ultimately found that our solution actually helped them with that very issue.",
        ];
        followUpQuestions = [
          "Could you elaborate more on your concern?",
          "What would need to change for this to be a good fit?",
          "How important is this particular aspect in your overall decision?",
        ];
    }

    return {
      objection_text: objectionText,
      category,
      responses,
      follow_up_questions: followUpQuestions,
      tone_advice:
        category === "Price"
          ? "Empathetic but value-focused"
          : category === "Timing"
          ? "Patient but highlighting opportunity cost"
          : "Confident and consultative",
    };
  }

  // AI-powered method to generate Objection analysis using Gemini
  async generateObjectionAnalysisWithAI(
    objectionText,
    dealData,
    relevantContext
  ) {
    try {
      // Format deal data for the prompt if available
      let dealContext = "No deal context provided";
      if (dealData && dealData.deal) {
        const deal = dealData.deal;
        dealContext = `
        DEAL INFORMATION:
        - Title: ${deal.title}
        - Value: ${deal.value}
        - Current Stage: ${deal.stage}
        - Status: ${deal.status}
        - Notes: ${deal.notes || "No notes available"}
        `;
      }

      // Format relevant context
      const contextSummaries =
        relevantContext && relevantContext.length > 0
          ? relevantContext
              .map((ctx) => {
                return `- ${ctx.entity_type} (${ctx.entity_id}): ${ctx.content_summary}`;
              })
              .join("\n")
          : "No relevant context available";

      // Create a structured prompt for the AI
      const prompt = `
      You are an AI-powered Objection Handler for a CRM system. Analyze this sales objection and provide effective responses.
      
      OBJECTION TEXT:
      "${objectionText}"
      
      ${dealContext}
      
      RELEVANT CONTEXT FROM SIMILAR OBJECTIONS AND DEALS:
      ${contextSummaries}
      
      Please provide a JSON response with the following structure:
      {
        "category": (one of: "Price", "Timing", "Need", "Authority", "Competition", "Trust", "Technical", "Uncategorized"),
        "responses": [(array of 3-5 effective responses to this objection)],
        "follow_up_questions": [(array of 3 questions to better understand the objection)],
        "tone_advice": (string advice on tone to use when responding),
        "underlying_concerns": [(array of likely underlying concerns behind this objection)]
      }
      
      Ensure your response is in valid JSON format without any explanation text outside the JSON structure.
      `;

      // Use the generative model
      const generativeModel = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { temperature: 0.3 },
      });

      // Generate analysis
      const result = await generativeModel.generateContent(prompt);
      const analysisText = result.response.text();

      // Parse the JSON response
      let analysis;
      try {
        analysis = JSON.parse(analysisText);
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        // Extract JSON if surrounded by markdown or other text
        const jsonMatch = analysisText.match(/```json\n([\s\S]*)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          // Extract the content between the markdown code fences
          try {
            analysis = JSON.parse(jsonMatch[1]);
          } catch (innerParseError) {
            console.error("Error parsing extracted JSON:", innerParseError);
            // Try to find any JSON object in the response
            const fallbackMatch = analysisText.match(/\{[\s\S]*\}/);
            if (fallbackMatch) {
              try {
                analysis = JSON.parse(fallbackMatch[0]);
              } catch (fallbackError) {
                console.error("Fallback JSON parsing failed:", fallbackError);
                throw new Error("AI service returned unparseable response");
              }
            } else {
              throw new Error("AI service returned invalid response format");
            }
          }
        } else {
          // Try to find any JSON object in the response
          const fallbackMatch = analysisText.match(/\{[\s\S]*\}/);
          if (fallbackMatch) {
            try {
              analysis = JSON.parse(fallbackMatch[0]);
            } catch (fallbackError) {
              console.error("Fallback JSON parsing failed:", fallbackError);
              throw new Error("AI service returned unparseable response");
            }
          } else {
            throw new Error("AI service returned invalid response format");
          }
        }
      }

      // Add additional metadata
      return {
        objection_text: objectionText,
        ai_generated: true,
        ...analysis,
      };
    } catch (error) {
      console.error("Error generating AI objection analysis:", error);
      throw new Error(`AI service error: ${error.message}`);
    }
  }
  // Helper method to generate Win-Loss analysis
  generateWinLossAnalysis(dealData) {
    const { deal, activities } = dealData;

    // Determine if the deal was won or lost
    const isWon = deal.status === "won";

    // In a real implementation, this would analyze various factors
    // For this implementation, we'll generate a simulated response

    const factors = [
      {
        name: "Price",
        impact: Math.floor(Math.random() * 5) + 1, // 1-5 scale
        description: isWon
          ? "Our pricing was competitive and aligned with the customer's budget expectations."
          : "Our pricing was perceived as too high compared to alternatives.",
      },
      {
        name: "Timing",
        impact: Math.floor(Math.random() * 5) + 1,
        description: isWon
          ? "Our solution timeline aligned perfectly with the customer's implementation schedule."
          : "The customer needed a solution sooner than our implementation timeline allowed.",
      },
      {
        name: "Product Fit",
        impact: Math.floor(Math.random() * 5) + 1,
        description: isWon
          ? "Our product features closely matched the customer's requirements."
          : "Several key features requested by the customer were missing from our offering.",
      },
      {
        name: "Relationship",
        impact: Math.floor(Math.random() * 5) + 1,
        description: isWon
          ? "Strong relationship built through consistent communication and trust."
          : "Insufficient relationship building throughout the sales process.",
      },
    ];

    // Sort factors by impact
    factors.sort((a, b) => b.impact - a.impact);

    // Generate recommendations
    const recommendations = isWon
      ? [
          "Maintain the competitive pricing that helped win this deal",
          "Continue emphasizing the product features that resonated with this customer",
          "Use the same relationship-building approach with similar prospects",
        ]
      : [
          "Review pricing strategy for this customer segment",
          "Accelerate product roadmap to address missing features",
          "Improve relationship building earlier in the sales process",
        ];

    return {
      outcome: isWon ? "won" : "lost",
      deal_value: deal.value,
      key_factors: factors,
      recommendations,
      similar_deals: [], // Would contain similar deals in a real implementation
      cold_start: false,
    };
  }

  // AI-powered method to generate Win-Loss analysis using Gemini
  async generateWinLossAnalysisWithAI(dealData) {
    try {
      const { deal, activities, relevantContext } = dealData;

      // Determine if the deal was won or lost
      const isWon = deal.status === "won";

      // Format activities for the prompt
      const activitySummaries = activities
        .map((activity) => {
          return `- ${new Date(activity.created_at).toLocaleDateString()}: ${
            activity.type
          } - ${activity.content || "No content"}`;
        })
        .join("\n");

      // Format relevant context
      const contextSummaries = relevantContext
        ? relevantContext
            .map((ctx) => {
              return `- ${ctx.entity_type} (${ctx.entity_id}): ${ctx.content_summary}`;
            })
            .join("\n")
        : "No relevant context available";

      // Create a structured prompt for the AI
      const prompt = `
      You are an AI-powered Win-Loss Analyzer for a CRM system. Analyze this ${
        isWon ? "won" : "lost"
      } deal and explain the key factors.
      
      DEAL INFORMATION:
      - Title: ${deal.title}
      - Value: ${deal.value}
      - Final Stage: ${deal.stage}
      - Status: ${deal.status} (${isWon ? "WON" : "LOST"})
      - Notes: ${deal.notes || "No notes available"}
      - Deal Duration: ${deal.total_deal_duration_days || "Unknown"} days
      
      ACTIVITIES DURING DEAL (${activities.length}):
      ${activitySummaries || "No activities recorded"}
      
      RELEVANT CONTEXT FROM SIMILAR DEALS:
      ${contextSummaries}
      
      Please provide a JSON response with the following structure:
      {
        "outcome": "${isWon ? "won" : "lost"}",
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

      // Use the generative model
      const generativeModel = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { temperature: 0.2 },
      });

      // Generate analysis
      const result = await generativeModel.generateContent(prompt);
      const analysisText = result.response.text();

      // Parse the JSON response
      let analysis;
      try {
        analysis = JSON.parse(analysisText);
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        // Extract JSON if surrounded by markdown or other text
        const jsonMatch = analysisText.match(/```json\n([\s\S]*)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          // Extract the content between the markdown code fences
          try {
            analysis = JSON.parse(jsonMatch[1]);
          } catch (innerParseError) {
            console.error("Error parsing extracted JSON:", innerParseError);
            // Try to find any JSON object in the response
            const fallbackMatch = analysisText.match(/\{[\s\S]*\}/);
            if (fallbackMatch) {
              try {
                analysis = JSON.parse(fallbackMatch[0]);
              } catch (fallbackError) {
                console.error("Fallback JSON parsing failed:", fallbackError);
                throw new Error("AI service returned unparseable response");
              }
            } else {
              throw new Error("AI service returned invalid response format");
            }
          }
        } else {
          // Try to find any JSON object in the response
          const fallbackMatch = analysisText.match(/\{[\s\S]*\}/);
          if (fallbackMatch) {
            try {
              analysis = JSON.parse(fallbackMatch[0]);
            } catch (fallbackError) {
              console.error("Fallback JSON parsing failed:", fallbackError);
              throw new Error("AI service returned unparseable response");
            }
          } else {
            throw new Error("AI service returned invalid response format");
          }
        }
      }

      // Add additional metadata
      return {
        cold_start: false,
        ai_generated: true,
        similar_deals: [], // Would be populated from relevantContext in a full implementation
        ...analysis,
      };
    } catch (error) {
      console.error("Error generating AI win-loss analysis:", error);
      throw new Error(`AI service error: ${error.message}`);
    }
  }
}

export default AiController;
