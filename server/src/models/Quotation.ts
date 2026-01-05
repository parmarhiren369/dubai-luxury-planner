import mongoose, { Schema, Document } from 'mongoose';

export interface IQuotationItem {
  type: 'hotel' | 'sightseeing' | 'meal' | 'transfer' | 'entry-ticket' | 'visa';
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  details?: string;
  referenceId?: string; // ID of the hotel, sightseeing, etc.
}

export interface IQuotation extends Document {
  quotationId: string; // Auto-generated like QT-2024-001
  customerId: mongoose.Types.ObjectId;
  customerName: string;
  agentId?: mongoose.Types.ObjectId;
  type: 'FIT' | 'Group' | 'Corporate' | 'Honeymoon';
  nationality?: string;
  adults: number;
  childrenWithBed: number;
  childrenWithoutBed: number;
  infants: number;
  arrivalDate: Date;
  departureDate: Date;
  nights: number;
  items: IQuotationItem[];
  subtotal: number;
  discount?: number;
  tax?: number;
  grandTotal: number;
  perHeadCost: number;
  notes?: string;
  status: 'draft' | 'sent' | 'confirmed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const QuotationItemSchema = new Schema<IQuotationItem>({
  type: { type: String, required: true, enum: ['hotel', 'sightseeing', 'meal', 'transfer', 'entry-ticket', 'visa'] },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  total: { type: Number, required: true },
  details: String,
  referenceId: String
}, { _id: false });

const QuotationSchema = new Schema<IQuotation>({
  quotationId: { type: String, required: true, unique: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  customerName: { type: String, required: true },
  agentId: { type: Schema.Types.ObjectId, ref: 'Agent' },
  type: { type: String, enum: ['FIT', 'Group', 'Corporate', 'Honeymoon'], required: true },
  nationality: String,
  adults: { type: Number, default: 0 },
  childrenWithBed: { type: Number, default: 0 },
  childrenWithoutBed: { type: Number, default: 0 },
  infants: { type: Number, default: 0 },
  arrivalDate: { type: Date, required: true },
  departureDate: { type: Date, required: true },
  nights: { type: Number, required: true },
  items: [QuotationItemSchema],
  subtotal: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  perHeadCost: { type: Number, required: true },
  notes: String,
  status: { type: String, enum: ['draft', 'sent', 'confirmed', 'cancelled'], default: 'draft' }
}, {
  timestamps: true
});

QuotationSchema.index({ quotationId: 1 });
QuotationSchema.index({ customerId: 1 });
QuotationSchema.index({ status: 1 });
QuotationSchema.index({ createdAt: -1 });

// Generate quotation ID before saving
QuotationSchema.pre('save', async function(next) {
  if (!this.quotationId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Quotation').countDocuments({ 
      createdAt: { $gte: new Date(year, 0, 1) } 
    });
    this.quotationId = `QT-${year}-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

export default mongoose.model<IQuotation>('Quotation', QuotationSchema);
