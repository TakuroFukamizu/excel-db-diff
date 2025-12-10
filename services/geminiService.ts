import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DiffItem, ChangeType, ChangeAction, Language } from '../types';

const getGeminiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY");
  }
  return new GoogleGenAI({ apiKey });
};

const DIFF_RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    diffs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: {
            type: Type.STRING,
            enum: [
              ChangeType.TABLE,
              ChangeType.COLUMN,
              ChangeType.INDEX,
              ChangeType.TRIGGER,
              ChangeType.CONSTRAINT,
              ChangeType.OTHER
            ],
            description: "The type of database object that changed."
          },
          action: {
            type: Type.STRING,
            enum: [
              ChangeAction.ADDED,
              ChangeAction.REMOVED,
              ChangeAction.MODIFIED
            ],
            description: "The nature of the change."
          },
          target: {
            type: Type.STRING,
            description: "The name of the object (e.g., 'Users table', 'email column')."
          },
          description: {
            type: Type.STRING,
            description: "A concise summary of what changed (e.g., 'Length increased from 50 to 100')."
          },
          oldValue: {
            type: Type.STRING,
            description: "The value in the old version (if applicable)."
          },
          newValue: {
            type: Type.STRING,
            description: "The value in the new version (if applicable)."
          }
        },
        required: ["type", "action", "target", "description"]
      }
    },
    summary: {
      type: Type.STRING,
      description: "A very brief executive summary of changes in this sheet."
    }
  },
  required: ["diffs", "summary"]
};

const LANGUAGE_NAMES: Record<Language, string> = {
  en: "English",
  ja: "Japanese",
  fr: "French"
};

export const analyzeSheetDiff = async (
  sheetName: string,
  oldCsv: string,
  newCsv: string,
  language: Language = 'en'
): Promise<{ diffs: DiffItem[], summary: string }> => {
  const client = getGeminiClient();

  const prompt = `
    You are a Senior Database Architect and an expert in analyzing Database Definition Documents (Excel/CSV format).
    
    Task: Compare the "Old Version" and "New Version" of the database definition sheet named "${sheetName}".
    
    Instructions:
    1. Identify semantic changes related to RDB structures: Tables, Columns, Data Types, Lengths, Nullability, Primary Keys, Foreign Keys, Indexes, Triggers, and Comments/Descriptions.
    2. Ignore purely cosmetic changes like cell formatting, empty rows, or minor whitespace differences unless they change the meaning.
    3. Pay special attention to:
       - Column Type changes (e.g., VARCHAR(50) -> VARCHAR(100), INT -> BIGINT).
       - Nullability changes (NULL -> NOT NULL).
       - New or removed columns.
       - Index definition changes.
    4. Return the result as a structured JSON object matching the provided schema.
    
    IMPORTANT LANGUAGE INSTRUCTION:
    Provide the 'description' field and the 'summary' field in ${LANGUAGE_NAMES[language]}.
    
    Old Version (CSV):
    \`\`\`csv
    ${oldCsv.substring(0, 20000)} 
    \`\`\`
    (Note: Input truncated to 20k chars if longer)

    New Version (CSV):
    \`\`\`csv
    ${newCsv.substring(0, 20000)}
    \`\`\`
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: DIFF_RESPONSE_SCHEMA,
        systemInstruction: "You are a precise and technical Database Doc Diff tool."
      }
    });

    const text = response.text;
    if (!text) return { diffs: [], summary: "No response generated." };

    const result = JSON.parse(text);
    return {
      diffs: result.diffs || [],
      summary: result.summary || "Analysis complete."
    };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error(`Failed to analyze sheet ${sheetName}: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};