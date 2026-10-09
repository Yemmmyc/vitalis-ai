/**
 * Zero-dependency local Bedrock Claude 3.5 Sonnet clinical response simulator.
 * Provides empathetic, safety-conscious eldercare responses without AWS credentials or SDKs.
 */
export class BedrockEmulator {
  private static instance: BedrockEmulator;

  public static getInstance(): BedrockEmulator {
    if (!BedrockEmulator.instance) {
      BedrockEmulator.instance = new BedrockEmulator();
    }
    return BedrockEmulator.instance;
  }

  public getStatus() {
    return {
      configured: false,
      region: "offline",
      modelId: "anthropic.claude-3-5-sonnet-20241022-v2:0 (Simulated)",
      mode: "Local Intelligent Bedrock Emulation (Standalone APK / Zero AWS)"
    };
  }

  public async generateResponse(prompt: string, _systemPrompt?: string): Promise<string> {
    const lower = prompt.toLowerCase();

    if (
      lower.includes("chest pain") ||
      lower.includes("heart") ||
      lower.includes("cannot breathe") ||
      lower.includes("shortness of breath")
    ) {
      return "Eleanor, hearing that you are feeling chest discomfort is very serious. Please sit down immediately and do not exert yourself. Because chest pain can indicate a cardiac event, I have recorded a high-priority caregiver alert in the Vitalis AI Caregiver Portal for David to review. Are you able to take slow, gentle breaths?";
    }

    if (
      lower.includes("pill") ||
      lower.includes("medication") ||
      lower.includes("lisinopril") ||
      lower.includes("metformin")
    ) {
      return "Good morning, Eleanor! Looking at your health schedule, your morning doses are Lisinopril 20mg for your blood pressure and Metformin 500mg. You have not marked them as taken yet. Would you like me to guide you through taking them with a glass of water?";
    }

    if (
      lower.includes("dizzy") ||
      lower.includes("fall") ||
      lower.includes("unsteady")
    ) {
      return "I'm concerned to hear you feel dizzy. Please hold onto a sturdy chair or sit down immediately so you stay safe from falling. Your Lisinopril can sometimes cause slight dizziness when standing up quickly. I have recorded a caregiver alert in the Vitalis AI Caregiver Portal for David to review. Can you sit down for a few minutes?";
    }

    if (
      lower.includes("water") ||
      lower.includes("hydrat") ||
      lower.includes("drink")
    ) {
      return "You've logged 5 glasses of water today, Eleanor! That's wonderful progress toward your 8-glass goal. Staying well-hydrated helps keep your kidneys healthy and prevents blood pressure drops.";
    }

    return `Hello Eleanor, I'm right here with you. Your vitals are looking steady today, and you're on a 14-day medication streak! How are you feeling this afternoon?`;
  }
}
