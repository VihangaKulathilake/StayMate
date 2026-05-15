import axios from "axios";

export async function getRecommendations(user, boardings) {
  try {
    const mlUrl = process.env.ML_API_URL || "http://127.0.0.1:8000/recommend";
    const response = await axios.post(mlUrl, {
      user,
      boardings
    });

    return response.data.recommendations;

  } catch (error) {
    console.error("ML API Error:", error.message);
    throw new Error("Failed to get recommendations");
  }
}
