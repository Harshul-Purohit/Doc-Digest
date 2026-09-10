import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISummary extends Document {
  url: string;
  title: string;
  summary: string;
  createdAt: Date;
}

const SummarySchema = new Schema<ISummary>({
  url: { type: String, required: true, index: true },
  title: { type: String, required: true },
  summary: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Summary: Model<ISummary> =
  mongoose.models.Summary || mongoose.model<ISummary>('Summary', SummarySchema);
