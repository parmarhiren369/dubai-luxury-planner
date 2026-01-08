import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  email: string;
  phone: string;
  nationality: string;
  passportNo: string;
  address: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>({
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  phone: { type: String, required: true },
  nationality: { type: String, required: false },
  passportNo: { type: String, required: false },
  address: { type: String, required: false },
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

CustomerSchema.index({ email: 1 });
CustomerSchema.index({ phone: 1 });
CustomerSchema.index({ passportNo: 1 });
CustomerSchema.index({ status: 1 });

export default mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);
