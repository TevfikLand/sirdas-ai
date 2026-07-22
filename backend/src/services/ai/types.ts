import { z } from "zod";

export const analysisSchema = z.object({
  analysis: z.string().min(80).max(5000),
  suggestions: z.array(z.string().min(10).max(500)).min(3).max(6),
  riskLevel: z.enum(["yok", "düşük", "yüksek"]),
  moodScore: z.number().min(0).max(100)
});
export type AnalysisResult = z.infer<typeof analysisSchema>;

export interface AiProvider {
  readonly name: string;
  analyzeEntry(text: string): Promise<AnalysisResult>;
}
