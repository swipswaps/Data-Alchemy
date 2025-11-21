import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DataRow, AIInsight, ChartType } from "../types";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeDataset = async (dataSample: DataRow[], columns: string[]): Promise<AIInsight> => {
  const ai = getAIClient();
  
  // Prepare a sample string
  const sampleStr = JSON.stringify(dataSample.slice(0, 15));
  
  const prompt = `
    Analyze this dataset sample (JSON format).
    1. Summarize what this data represents in one concise paragraph.
    2. Identify 3 key trends or interesting observations.
    3. Suggest the most appropriate chart type (bar, line, pie, area) to visualize the data, along with the X-axis key and Data keys (numerical values).
    
    Columns: ${columns.join(', ')}
    Data Sample: ${sampleStr}
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING, description: "A concise summary of the dataset." },
        keyTrends: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "3 key trends or observations."
        },
        suggestedChart: {
            type: Type.OBJECT,
            properties: {
                type: { type: Type.STRING, enum: [ChartType.BAR, ChartType.LINE, ChartType.PIE, ChartType.AREA, ChartType.NONE] },
                xAxisKey: { type: Type.STRING, description: "The column name to use for the X Axis" },
                dataKeys: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array of column names to use as data values" },
                title: { type: Type.STRING, description: "A creative title for the chart" }
            },
            required: ["type", "xAxisKey", "dataKeys", "title"]
        }
    },
    required: ["summary", "keyTrends", "suggestedChart"]
  };

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
            temperature: 0.2
        }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AIInsight;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback for safety
    return {
        summary: "Could not analyze data at this time.",
        keyTrends: [],
        suggestedChart: { type: ChartType.NONE, xAxisKey: "", dataKeys: [], title: "" }
    };
  }
};

export const cleanData = async (dataSample: DataRow[], instructions: string): Promise<any[]> => {
    const ai = getAIClient();
    const prompt = `
      You are a data cleaning assistant.
      User Instructions: "${instructions}"
      
      Process the provided JSON data sample strictly according to the instructions.
      Return ONLY the cleaned JSON array. Do not add markdown.
      
      Input Data:
      ${JSON.stringify(dataSample)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });
        
        const text = response.text;
        if (!text) return dataSample;
        return JSON.parse(text);
    } catch (e) {
        console.error(e);
        return dataSample;
    }
};
