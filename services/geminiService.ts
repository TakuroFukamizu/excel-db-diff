import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DiffItem, ChangeType, ChangeAction, Language } from '../types';

// Environment variables type definition (shimmed by Vite)
declare const process: {
  env: {
    API_KEY?: string;
    LLM_PROVIDER?: string; // 'gemini' | 'openai' | 'anthropic' | 'local'
    API_BASE_URL?: string;
    MODEL_NAME?: string;
  }
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

// Helper to generate system prompt for non-Gemini models
const getSystemPrompt = (language: Language) => {
  return `You are a Senior Database Architect and an expert in analyzing Database Definition Documents (Excel/CSV format).
You are a precise and technical Database Doc Diff tool.
Output must be in pure JSON format.
Provide the 'description' field and the 'summary' field in ${LANGUAGE_NAMES[language]}.`;
};

// Helper to generate user prompt
const getUserPrompt = (sheetName: string, oldCsv: string, newCsv: string) => {
  return `Task: Compare the "Old Version" and "New Version" of the database definition sheet named "${sheetName}".

Instructions:
1. Identify semantic changes related to RDB structures: Tables, Columns, Data Types, Lengths, Nullability, Primary Keys, Foreign Keys, Indexes, Triggers, and Comments/Descriptions.
2. Ignore purely cosmetic changes like cell formatting, empty rows, or minor whitespace differences unless they change the meaning.
3. Pay special attention to:
   - Column Type changes (e.g., VARCHAR(50) -> VARCHAR(100), INT -> BIGINT).
   - Nullability changes (NULL -> NOT NULL).
   - New or removed columns.
   - Index definition changes.
4. Return the result as a structured JSON object.

Old Version (CSV):
\`\`\`csv
${oldCsv.substring(0, 20000)} 
\`\`\`

New Version (CSV):
\`\`\`csv
${newCsv.substring(0, 20000)}
\`\`\`

JSON Schema for output:
{
  "diffs": [
    {
      "type": "TABLE" | "COLUMN" | "INDEX" | "TRIGGER" | "CONSTRAINT" | "OTHER",
      "action": "ADDED" | "REMOVED" | "MODIFIED",
      "target": "string (name of object)",
      "description": "string (concise summary)",
      "oldValue": "string (optional)",
      "newValue": "string (optional)"
    }
  ],
  "summary": "string (executive summary)"
}`;
};

// Helper to parse JSON from potentially markdown-wrapped text
const parseJsonFromText = (text: string) => {
  try {
    // Try direct parse
    return JSON.parse(text);
  } catch (e) {
    // Try extracting from code blocks
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]);
    }
    // Try finding the first '{' and last '}'
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      return JSON.parse(text.substring(start, end + 1));
    }
    throw new Error("Could not parse JSON from response");
  }
};

// --- Gemini Implementation ---
const analyzeWithGemini = async (
  sheetName: string,
  oldCsv: string,
  newCsv: string,
  language: Language
) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing for Gemini.");

  const client = new GoogleGenAI({ apiKey });
  const modelName = process.env.MODEL_NAME || 'gemini-2.5-flash';

  const prompt = getUserPrompt(sheetName, oldCsv, newCsv);

  const response = await client.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: DIFF_RESPONSE_SCHEMA,
      systemInstruction: getSystemPrompt(language)
    }
  });

  const text = response.text;
  if (!text) return { diffs: [], summary: "No response generated." };
  
  return JSON.parse(text);
};

// --- OpenAI / Local (OpenAI Compatible) Implementation ---
const analyzeWithOpenAICompatible = async (
  sheetName: string,
  oldCsv: string,
  newCsv: string,
  language: Language,
  isLocal: boolean
) => {
  const apiKey = process.env.API_KEY || 'dummy'; // Local models might not need a key
  const baseUrl = process.env.API_BASE_URL || (isLocal ? 'http://localhost:1234/v1' : 'https://api.openai.com/v1');
  const modelName = process.env.MODEL_NAME || (isLocal ? 'local-model' : 'gpt-4o');

  const systemPrompt = getSystemPrompt(language);
  const userPrompt = getUserPrompt(sheetName, oldCsv, newCsv);

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1,
      // Some local models don't support response_format, so we rely on prompt engineering
      response_format: isLocal ? undefined : { type: "json_object" }
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI/Local API Error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) return { diffs: [], summary: "No content generated." };
  return parseJsonFromText(content);
};

// --- Anthropic Implementation ---
const analyzeWithAnthropic = async (
  sheetName: string,
  oldCsv: string,
  newCsv: string,
  language: Language
) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing for Anthropic.");
  
  const baseUrl = process.env.API_BASE_URL || 'https://api.anthropic.com/v1';
  const modelName = process.env.MODEL_NAME || 'claude-3-5-sonnet-latest';

  const systemPrompt = getSystemPrompt(language);
  const userPrompt = getUserPrompt(sheetName, oldCsv, newCsv);

  const response = await fetch(`${baseUrl}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true' // Only for client-side demo; usually proxy is better
    },
    body: JSON.stringify({
      model: modelName,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 4096,
      temperature: 0.1
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API Error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text;
  
  if (!content) return { diffs: [], summary: "No content generated." };
  return parseJsonFromText(content);
};

// --- Main Export ---
export const analyzeSheetDiff = async (
  sheetName: string,
  oldCsv: string,
  newCsv: string,
  language: Language = 'en'
): Promise<{ diffs: DiffItem[], summary: string }> => {
  const provider = process.env.LLM_PROVIDER?.toLowerCase() || 'gemini';

  try {
    switch (provider) {
      case 'gemini':
        return await analyzeWithGemini(sheetName, oldCsv, newCsv, language);
      case 'openai':
        return await analyzeWithOpenAICompatible(sheetName, oldCsv, newCsv, language, false);
      case 'local':
        return await analyzeWithOpenAICompatible(sheetName, oldCsv, newCsv, language, true);
      case 'anthropic':
        return await analyzeWithAnthropic(sheetName, oldCsv, newCsv, language);
      default:
        throw new Error(`Unknown LLM_PROVIDER: ${provider}`);
    }
  } catch (error) {
    console.error(`Analysis Error (${provider}):`, error);
    throw new Error(`Failed to analyze sheet ${sheetName}: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};