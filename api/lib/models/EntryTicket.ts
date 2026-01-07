import mongoose, { Schema, Document } from 'mongoose';

export interface IEntryTicket extends Document {
  name: string;
  description: string;
  location: string;
  adultPrice: number;
  childPrice: number;
  infantPrice: number;
  category: string;
  validity: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const EntryTicketSchema = new Schema<IEntryTicket>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  adultPrice: { type: Number, required: true, min: 0 },
  childPrice: { type: Number, required: true, min: 0 },
  infantPrice: { type: Number, default: 0, min: 0 },
  category: { type: String, required: true },
  validity: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, {
  timestamps: true
});

EntryTicketSchema.index({ name: 1 });
EntryTicketSchema.index({ category: 1 });
EntryTicketSchema.index({ status: 1 });

export default mongoose.models.EntryTicket || mongoose.model<IEntryTicket>('EntryTicket', EntryTicketSchema);
