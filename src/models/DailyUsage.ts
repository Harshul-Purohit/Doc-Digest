import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDailyUsage extends Document {
  identifier: string; // userId string or IP address
  date: string; // YYYY-MM-DD format (UTC)
  count: number;
  lastUsedAt: Date;
}

const DailyUsageSchema = new Schema<IDailyUsage>({
  identifier: { type: String, required: true, index: true },
  date: { type: String, required: true, index: true },
  count: { type: Number, default: 0 },
  lastUsedAt: { type: Date, default: Date.now },
});

DailyUsageSchema.index({ identifier: 1, date: 1 }, { unique: true });

export const DailyUsage: Model<IDailyUsage> =
  mongoose.models.DailyUsage ||
  mongoose.model<IDailyUsage>('DailyUsage', DailyUsageSchema);
