import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISummary extends Document {
  userId?: mongoose.Types.ObjectId;
  url: string;
  title: string;
  summary: string;
  createdAt: Date;
}

const SummarySchema = new Schema<ISummary>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    index: true,
  },
  url: { type: String, required: true, index: true },
  title: { type: String, required: true },
  summary: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Summary: Model<ISummary> =
  mongoose.models.Summary || mongoose.model<ISummary>('Summary', SummarySchema);
