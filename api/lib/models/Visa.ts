import mongoose, { Schema, Document } from 'mongoose';

export interface IVisa extends Document {
  country: string;
  type: string;
  processingTime: string;
  validity: string;
  adultPrice: number;
  childPrice: number;
  infantPrice: number;
  requirements: string[];
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const VisaSchema = new Schema<IVisa>({
  country: { type: String, required: true },
  type: { type: String, required: true },
  processingTime: { type: String, required: true },
  validity: { type: String, required: true },
  adultPrice: { type: Number, required: true, min: 0 },
  childPrice: { type: Number, required: true, min: 0 },
  infantPrice: { type: Number, default: 0, min: 0 },
  requirements: [{ type: String }],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(_doc, ret) {
      const { _id, __v, ...rest } = ret;
      return { id: _id.toString(), ...rest };
    }
  },
  toObject: {
    virtuals: true,
    transform: function(_doc, ret) {
      const { _id, __v, ...rest } = ret;
      return { id: _id.toString(), ...rest };
    }
  }
});

VisaSchema.index({ country: 1 });
VisaSchema.index({ type: 1 });
VisaSchema.index({ status: 1 });

export default mongoose.models.Visa || mongoose.model<IVisa>('Visa', VisaSchema);
