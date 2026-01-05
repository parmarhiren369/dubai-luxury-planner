import mongoose, { Schema, Document } from 'mongoose';

export interface ISightseeing extends Document {
  name: string;
  description: string;
  duration: string;
  adultPrice: number;
  childPrice: number;
  infantPrice: number;
  entryTicket: number;
  category: string;
  includes: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const SightseeingSchema = new Schema<ISightseeing>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: String, required: true },
  adultPrice: { type: Number, required: true, min: 0 },
  childPrice: { type: Number, required: true, min: 0 },
  infantPrice: { type: Number, default: 0, min: 0 },
  entryTicket: { type: Number, default: 0, min: 0 },
  category: { type: String, required: true },
  includes: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, {
  timestamps: true
});

SightseeingSchema.index({ name: 1 });
SightseeingSchema.index({ category: 1 });
SightseeingSchema.index({ status: 1 });

export default mongoose.model<ISightseeing>('Sightseeing', SightseeingSchema);
