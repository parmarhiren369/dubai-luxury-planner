import mongoose, { Schema, Document } from 'mongoose';

export interface IAgent extends Document {
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  commission: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const AgentSchema = new Schema<IAgent>({
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  phone: { type: String, required: true },
  company: { type: String, required: true },
  role: { type: String, default: 'Agent' },
  commission: { type: Number, default: 10, min: 0, max: 100 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

AgentSchema.index({ email: 1 });
AgentSchema.index({ company: 1 });
AgentSchema.index({ status: 1 });

export default mongoose.models.Agent || mongoose.model<IAgent>('Agent', AgentSchema);
