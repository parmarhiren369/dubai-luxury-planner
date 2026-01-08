import mongoose, { Schema, Document } from 'mongoose';

export interface IMeal extends Document {
  name: string;
  type: string;
  description: string;
  pricePerPerson: number;
  restaurant: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const MealSchema = new Schema<IMeal>({
  name: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  pricePerPerson: { type: Number, required: true, min: 0 },
  restaurant: { type: String, required: true },
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

MealSchema.index({ name: 1 });
MealSchema.index({ type: 1 });
MealSchema.index({ status: 1 });

export default mongoose.models.Meal || mongoose.model<IMeal>('Meal', MealSchema);
