import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUsage extends Document {
  identifier: string;
  count: number;
  lastUsedAt: Date;
}

const UsageSchema = new Schema<IUsage>({
  identifier: { type: String, required: true, unique: true, index: true },
  count: { type: Number, default: 0 },
  lastUsedAt: { type: Date, default: Date.now },
});

export const Usage: Model<IUsage> =
  mongoose.models.Usage || mongoose.model<IUsage>('Usage', UsageSchema);
