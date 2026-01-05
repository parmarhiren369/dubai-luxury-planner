import mongoose, { Schema, Document } from 'mongoose';

export interface ITransfer extends Document {
  name: string;
  type: string;
  description: string;
  price: number;
  vehicleType: string;
  capacity: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const TransferSchema = new Schema<ITransfer>({
  name: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  vehicleType: { type: String, required: true },
  capacity: { type: Number, required: true, min: 1 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, {
  timestamps: true
});

TransferSchema.index({ name: 1 });
TransferSchema.index({ type: 1 });
TransferSchema.index({ status: 1 });

export default mongoose.model<ITransfer>('Transfer', TransferSchema);
