import axios from "axios";

export async function getRecommendations(user, boardings) {
  try {
    const response = await axios.post("http://127.0.0.1:8000/recommend", {
      user,
      boardings
    });

    return response.data.recommendations;

  } catch (error) {
    console.error("ML API Error:", error.message);
    throw new Error("Failed to get recommendations");
  }
}
