import CustomError from "./CustomError.js";

export const textParser = (analysisText) => {
  let analysis;
  try {
    analysis = JSON.parse(analysisText);
  } catch (parseError) {
    // Extract JSON if surrounded by markdown or other text
    const jsonMatch = analysisText.match(/```json\n([\s\S]*)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      // Extract the content between the markdown code fences
      try {
        analysis = JSON.parse(jsonMatch[1]);
      } catch (innerParseError) {
        // Try to find any JSON object in the response
        const fallbackMatch = analysisText.match(/\{[\s\S]*\}/);
        if (fallbackMatch) {
          try {
            analysis = JSON.parse(fallbackMatch[0]);
          } catch (fallbackError) {
            throw new CustomError(
              "AI service returned unparseable response",
              500
            );
          }
        } else {
          throw new CustomError(
            "AI service returned invalid response format",
            500
          );
        }
      }
    } else {
      // Try to find any JSON object in the response
      const fallbackMatch = analysisText.match(/\{[\s\S]*\}/);
      if (fallbackMatch) {
        try {
          analysis = JSON.parse(fallbackMatch[0]);
        } catch (fallbackError) {
          throw new CustomError(
            "AI service returned unparseable response",
            500
          );
        }
      } else {
        throw new CustomError(
          "AI service returned invalid response format",
          500
        );
      }
    }
  }

  return analysis;
};
