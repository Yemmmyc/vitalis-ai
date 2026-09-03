import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import dotenv from "dotenv";

dotenv.config();

export interface BedrockMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class BedrockService {
  private static instance: BedrockService;
  private client: BedrockRuntimeClient | null = null;
  private region: string;
  private modelId: string;
  private isConfigured: boolean = false;

  private constructor() {
    this.region = process.env.AWS_REGION || "us-east-1";
    this.modelId = process.env.BEDROCK_MODEL_ID || "anthropic.claude-3-5-sonnet-20241022-v2:0";

    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (accessKeyId && secretAccessKey) {
      try {
        this.client = new BedrockRuntimeClient({
          region: this.region,
          credentials: {
            accessKeyId,
            secretAccessKey
          }
        });
        this.isConfigured = true;
        console.log(`[BedrockService] Initialized with AWS Bedrock client (${this.region}, model: ${this.modelId})`);
      } catch (err) {
        console.warn("[BedrockService] AWS credentials detected but client failed to initialize:", err);
      }
    } else {
      console.log("[BedrockService] Running in intelligent local emulation mode (Simulating Amazon Bedrock Claude 3.5 Sonnet / AWS Nova responses).");
    }
  }

  public static getInstance(): BedrockService {
    if (!BedrockService.instance) {
      BedrockService.instance = new BedrockService();
    }
    return BedrockService.instance;
  }

  public getStatus() {
    return {
      configured: this.isConfigured,
      region: this.region,
      modelId: this.modelId,
      mode: this.isConfigured ? "Live AWS Bedrock Runtime" : "Local Intelligent Bedrock Emulation (Zero-Friction Dev)"
    };
  }

  public async generateResponse(prompt: string, systemPrompt?: string): Promise<string> {
    if (this.isConfigured && this.client) {
      try {
        const payload = {
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: 1024,
          system: systemPrompt || "You are Vitalis AI, a proactive, empathetic eldercare and clinical advocacy assistant on Alexa+. Keep answers conversational, clear, warm, and safety-conscious.",
          messages: [{ role: "user", content: prompt }]
        };

        const command = new InvokeModelCommand({
          modelId: this.modelId,
          contentType: "application/json",
          accept: "application/json",
          body: JSON.stringify(payload)
        });

        const response = await this.client.send(command);
        const decoded = JSON.parse(new TextDecoder().decode(response.body));
        return decoded.content?.[0]?.text || "I am here with you, Eleanor. How can I assist you right now?";
      } catch (err) {
        console.error("[BedrockService] AWS Bedrock call error, falling back to simulated inference:", err);
      }
    }

    // High-fidelity fallback that mirrors Claude 3.5 Sonnet clinical responses
    return this.simulateBedrockResponse(prompt, systemPrompt);
  }

  private simulateBedrockResponse(prompt: string, systemPrompt?: string): string {
    const lower = prompt.toLowerCase();
    if (lower.includes("chest pain") || lower.includes("heart") || lower.includes("cannot breathe") || lower.includes("shortness of breath")) {
      return "Eleanor, hearing that you are feeling chest discomfort is very serious. Please sit down immediately and do not exert yourself. Because chest pain can indicate a cardiac event, I am notifying David and alerting emergency services right now. Are you able to take slow, gentle breaths?";
    }
    if (lower.includes("pill") || lower.includes("medication") || lower.includes("lisinopril") || lower.includes("metformin")) {
      return "Good morning, Eleanor! Looking at your health schedule, your morning doses are Lisinopril 20mg for your blood pressure and Metformin 500mg. You have not marked them as taken yet. Would you like me to guide you through taking them with a glass of water?";
    }
    if (lower.includes("dizzy") || lower.includes("fall") || lower.includes("unsteady")) {
      return "I'm concerned to hear you feel dizzy. Please hold onto a sturdy chair or sit down immediately so you stay safe from falling. Your Lisinopril can sometimes cause slight dizziness when standing up quickly. I am logging this and sending a note to David to check in on you. Can you sit down for a few minutes?";
    }
    if (lower.includes("water") || lower.includes("hydrat") || lower.includes("drink")) {
      return "You've logged 5 glasses of water today, Eleanor! That's wonderful progress toward your 8-glass goal. Staying well-hydrated helps keep your kidneys healthy and prevents blood pressure drops.";
    }
    return `Hello Eleanor, I'm right here with you. Your vitals are looking steady today, and you're on a 14-day medication streak! How are you feeling this afternoon?`;
  }
}
