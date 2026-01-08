import mongoose, { Schema, Document } from 'mongoose';

export interface IRatePeriod {
  roomType: string;
  mealPlan: string;
  startDate: Date;
  endDate: Date;
  rate: number;
}

export interface IHotel extends Document {
  name: string;
  category: string;
  location: string;
  singleRoom: number;
  doubleRoom: number;
  tripleRoom: number;
  quadRoom: number;
  sixRoom: number;
  extraBed: number;
  childWithBed: number;
  childWithoutBed: number;
  childWithoutBed3to5: number;
  childWithoutBed5to11: number;
  infant: number;
  mealPlan: string;
  status: 'active' | 'inactive';
  ratePeriods: IRatePeriod[];
  createdAt: Date;
  updatedAt: Date;
}

const RatePeriodSchema = new Schema<IRatePeriod>({
  roomType: { type: String, required: true },
  mealPlan: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  rate: { type: Number, required: true }
}, { _id: false });

const HotelSchema = new Schema<IHotel>({
  name: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  singleRoom: { type: Number, default: 0 },
  doubleRoom: { type: Number, default: 0 },
  tripleRoom: { type: Number, default: 0 },
  quadRoom: { type: Number, default: 0 },
  sixRoom: { type: Number, default: 0 },
  extraBed: { type: Number, default: 0 },
  childWithBed: { type: Number, default: 0 },
  childWithoutBed: { type: Number, default: 0 },
  childWithoutBed3to5: { type: Number, default: 0 },
  childWithoutBed5to11: { type: Number, default: 0 },
  infant: { type: Number, default: 0 },
  mealPlan: { type: String, default: 'BB' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  ratePeriods: [RatePeriodSchema]
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

HotelSchema.index({ name: 1 });
HotelSchema.index({ location: 1 });
HotelSchema.index({ status: 1 });

export default mongoose.models.Hotel || mongoose.model<IHotel>('Hotel', HotelSchema);
