-- Create hotels table
CREATE TABLE public.hotels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '3 Star',
  location TEXT NOT NULL DEFAULT 'Dubai',
  single_room NUMERIC DEFAULT 0,
  double_room NUMERIC DEFAULT 0,
  triple_room NUMERIC DEFAULT 0,
  quad_room NUMERIC DEFAULT 0,
  six_room NUMERIC DEFAULT 0,
  extra_bed NUMERIC DEFAULT 0,
  child_with_bed NUMERIC DEFAULT 0,
  child_without_bed NUMERIC DEFAULT 0,
  child_without_bed_3to5 NUMERIC DEFAULT 0,
  child_without_bed_5to11 NUMERIC DEFAULT 0,
  infant NUMERIC DEFAULT 0,
  meal_plan TEXT DEFAULT 'BB',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create hotel_rate_periods table for seasonal pricing
CREATE TABLE public.hotel_rate_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  room_type TEXT NOT NULL,
  meal_plan TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  rate NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  nationality TEXT,
  passport_no TEXT,
  address TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transfers table
CREATE TABLE public.transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  vehicle_type TEXT NOT NULL DEFAULT 'Sedan',
  capacity INTEGER DEFAULT 4,
  rate NUMERIC DEFAULT 0,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meals table
CREATE TABLE public.meals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  meal_type TEXT NOT NULL DEFAULT 'Lunch',
  cuisine TEXT DEFAULT 'International',
  rate NUMERIC DEFAULT 0,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sightseeing table
CREATE TABLE public.sightseeing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT 'Dubai',
  duration TEXT DEFAULT '4 hours',
  adult_rate NUMERIC DEFAULT 0,
  child_rate NUMERIC DEFAULT 0,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create entry_tickets table
CREATE TABLE public.entry_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT DEFAULT 'Dubai',
  adult_rate NUMERIC DEFAULT 0,
  child_rate NUMERIC DEFAULT 0,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create visa table
CREATE TABLE public.visas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  visa_type TEXT NOT NULL DEFAULT '30 Days Tourist',
  processing_time TEXT DEFAULT '3-5 days',
  rate NUMERIC DEFAULT 0,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agents table
CREATE TABLE public.agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  commission_rate NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quotations table
CREATE TABLE public.quotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id),
  agent_id UUID REFERENCES public.agents(id),
  arrival_date DATE NOT NULL,
  departure_date DATE NOT NULL,
  adults INTEGER DEFAULT 1,
  children INTEGER DEFAULT 0,
  infants INTEGER DEFAULT 0,
  hotel_id UUID REFERENCES public.hotels(id),
  room_type TEXT,
  meal_plan TEXT,
  hotel_total NUMERIC DEFAULT 0,
  sightseeing_total NUMERIC DEFAULT 0,
  transfer_total NUMERIC DEFAULT 0,
  meal_total NUMERIC DEFAULT 0,
  visa_total NUMERIC DEFAULT 0,
  grand_total NUMERIC DEFAULT 0,
  per_person_cost NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quotation_items table for line items
CREATE TABLE public.quotation_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  item_id UUID,
  item_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  rate NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (allowing public access for now - no auth required)
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_rate_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sightseeing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entry_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;

-- Create public access policies (since this is a B2B internal tool)
CREATE POLICY "Allow public read access" ON public.hotels FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.hotels FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.hotels FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.hotels FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.hotel_rate_periods FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.hotel_rate_periods FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.hotel_rate_periods FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.hotel_rate_periods FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.customers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.customers FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.transfers FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.transfers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.transfers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.transfers FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.meals FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.meals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.meals FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.meals FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.sightseeing FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.sightseeing FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.sightseeing FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.sightseeing FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.entry_tickets FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.entry_tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.entry_tickets FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.entry_tickets FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.visas FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.visas FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.visas FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.visas FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.agents FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.agents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.agents FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.agents FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.quotations FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.quotations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.quotations FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.quotations FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.quotation_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.quotation_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.quotation_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.quotation_items FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX idx_hotels_name ON public.hotels(name);
CREATE INDEX idx_hotels_location ON public.hotels(location);
CREATE INDEX idx_customers_name ON public.customers(name);
CREATE INDEX idx_quotations_customer ON public.quotations(customer_id);
CREATE INDEX idx_quotations_number ON public.quotations(quotation_number);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON public.hotels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_transfers_updated_at BEFORE UPDATE ON public.transfers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_meals_updated_at BEFORE UPDATE ON public.meals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sightseeing_updated_at BEFORE UPDATE ON public.sightseeing FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_entry_tickets_updated_at BEFORE UPDATE ON public.entry_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_visas_updated_at BEFORE UPDATE ON public.visas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON public.quotations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();