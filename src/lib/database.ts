import { supabase } from "@/integrations/supabase/client";

// Transform database row to frontend format
const transformHotel = (row: any) => ({
  id: row.id,
  name: row.name,
  category: row.category,
  location: row.location,
  singleRoom: Number(row.single_room) || 0,
  doubleRoom: Number(row.double_room) || 0,
  tripleRoom: Number(row.triple_room) || 0,
  quadRoom: Number(row.quad_room) || 0,
  sixRoom: Number(row.six_room) || 0,
  extraBed: Number(row.extra_bed) || 0,
  childWithBed: Number(row.child_with_bed) || 0,
  childWithoutBed: Number(row.child_without_bed) || 0,
  childWithoutBed3to5: Number(row.child_without_bed_3to5) || 0,
  childWithoutBed5to11: Number(row.child_without_bed_5to11) || 0,
  infant: Number(row.infant) || 0,
  mealPlan: row.meal_plan || 'BB',
  status: row.status || 'active',
});

const transformCustomer = (row: any) => ({
  id: row.id,
  name: row.name,
  email: row.email || '',
  phone: row.phone || '',
  nationality: row.nationality || '',
  passportNo: row.passport_no || '',
  address: row.address || '',
  status: row.status || 'active',
  createdAt: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
});

const transformTransfer = (row: any) => ({
  id: row.id,
  name: row.name,
  vehicleType: row.vehicle_type || 'Sedan',
  capacity: row.capacity || 4,
  rate: Number(row.rate) || 0,
  description: row.description || '',
  status: row.status || 'active',
});

const transformMeal = (row: any) => ({
  id: row.id,
  name: row.name,
  mealType: row.meal_type || 'Lunch',
  cuisine: row.cuisine || 'International',
  rate: Number(row.rate) || 0,
  description: row.description || '',
  status: row.status || 'active',
});

const transformSightseeing = (row: any) => ({
  id: row.id,
  name: row.name,
  location: row.location || 'Dubai',
  duration: row.duration || '4 hours',
  adultRate: Number(row.adult_rate) || 0,
  childRate: Number(row.child_rate) || 0,
  description: row.description || '',
  status: row.status || 'active',
});

const transformEntryTicket = (row: any) => ({
  id: row.id,
  name: row.name,
  location: row.location || 'Dubai',
  adultRate: Number(row.adult_rate) || 0,
  childRate: Number(row.child_rate) || 0,
  description: row.description || '',
  status: row.status || 'active',
});

const transformVisa = (row: any) => ({
  id: row.id,
  name: row.name,
  visaType: row.visa_type || '30 Days Tourist',
  processingTime: row.processing_time || '3-5 days',
  rate: Number(row.rate) || 0,
  description: row.description || '',
  status: row.status || 'active',
});

const transformAgent = (row: any) => ({
  id: row.id,
  name: row.name,
  email: row.email || '',
  phone: row.phone || '',
  company: row.company || '',
  commissionRate: Number(row.commission_rate) || 0,
  status: row.status || 'active',
  createdAt: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
});

// Hotels Database API
export const hotelsDb = {
  async getAll() {
    const { data, error } = await supabase.from('hotels').select('*').order('name');
    if (error) throw error;
    return (data || []).map(transformHotel);
  },

  async create(hotel: any) {
    const { data, error } = await supabase.from('hotels').insert({
      name: hotel.name,
      category: hotel.category,
      location: hotel.location,
      single_room: hotel.singleRoom || 0,
      double_room: hotel.doubleRoom || 0,
      triple_room: hotel.tripleRoom || 0,
      quad_room: hotel.quadRoom || 0,
      six_room: hotel.sixRoom || 0,
      extra_bed: hotel.extraBed || 0,
      child_with_bed: hotel.childWithBed || 0,
      child_without_bed: hotel.childWithoutBed || 0,
      child_without_bed_3to5: hotel.childWithoutBed3to5 || 0,
      child_without_bed_5to11: hotel.childWithoutBed5to11 || 0,
      infant: hotel.infant || 0,
      meal_plan: hotel.mealPlan || 'BB',
      status: hotel.status || 'active',
    }).select().single();
    if (error) throw error;
    return transformHotel(data);
  },

  async update(id: string, hotel: any) {
    const { data, error } = await supabase.from('hotels').update({
      name: hotel.name,
      category: hotel.category,
      location: hotel.location,
      single_room: hotel.singleRoom || 0,
      double_room: hotel.doubleRoom || 0,
      triple_room: hotel.tripleRoom || 0,
      quad_room: hotel.quadRoom || 0,
      six_room: hotel.sixRoom || 0,
      extra_bed: hotel.extraBed || 0,
      child_with_bed: hotel.childWithBed || 0,
      child_without_bed: hotel.childWithoutBed || 0,
      child_without_bed_3to5: hotel.childWithoutBed3to5 || 0,
      child_without_bed_5to11: hotel.childWithoutBed5to11 || 0,
      infant: hotel.infant || 0,
      meal_plan: hotel.mealPlan || 'BB',
      status: hotel.status || 'active',
    }).eq('id', id).select().single();
    if (error) throw error;
    return transformHotel(data);
  },

  async delete(id: string) {
    const { error } = await supabase.from('hotels').delete().eq('id', id);
    if (error) throw error;
  },

  async importBulk(hotels: any[]) {
    const insertData = hotels.map(hotel => ({
      name: hotel.name,
      category: hotel.category || '3 Star',
      location: hotel.location || 'Dubai',
      single_room: hotel.singleRoom || 0,
      double_room: hotel.doubleRoom || 0,
      triple_room: hotel.tripleRoom || 0,
      quad_room: hotel.quadRoom || 0,
      six_room: hotel.sixRoom || 0,
      extra_bed: hotel.extraBed || 0,
      child_with_bed: hotel.childWithBed || 0,
      child_without_bed: hotel.childWithoutBed || 0,
      child_without_bed_3to5: hotel.childWithoutBed3to5 || 0,
      child_without_bed_5to11: hotel.childWithoutBed5to11 || 0,
      infant: hotel.infant || 0,
      meal_plan: hotel.mealPlan || 'BB',
      status: hotel.status || 'active',
    }));
    const { data, error } = await supabase.from('hotels').insert(insertData).select();
    if (error) throw error;
    return { count: data?.length || 0 };
  }
};

// Customers Database API
export const customersDb = {
  async getAll() {
    const { data, error } = await supabase.from('customers').select('*').order('name');
    if (error) throw error;
    return (data || []).map(transformCustomer);
  },

  async create(customer: any) {
    const { data, error } = await supabase.from('customers').insert({
      name: customer.name,
      email: customer.email || null,
      phone: customer.phone || null,
      nationality: customer.nationality || null,
      passport_no: customer.passportNo || null,
      address: customer.address || null,
      status: customer.status || 'active',
    }).select().single();
    if (error) throw error;
    return transformCustomer(data);
  },

  async update(id: string, customer: any) {
    const { data, error } = await supabase.from('customers').update({
      name: customer.name,
      email: customer.email || null,
      phone: customer.phone || null,
      nationality: customer.nationality || null,
      passport_no: customer.passportNo || null,
      address: customer.address || null,
      status: customer.status || 'active',
    }).eq('id', id).select().single();
    if (error) throw error;
    return transformCustomer(data);
  },

  async delete(id: string) {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) throw error;
  }
};

// Transfers Database API
export const transfersDb = {
  async getAll() {
    const { data, error } = await supabase.from('transfers').select('*').order('name');
    if (error) throw error;
    return (data || []).map(transformTransfer);
  },

  async create(transfer: any) {
    const { data, error } = await supabase.from('transfers').insert({
      name: transfer.name,
      vehicle_type: transfer.vehicleType || 'Sedan',
      capacity: transfer.capacity || 4,
      rate: transfer.rate || 0,
      description: transfer.description || null,
      status: transfer.status || 'active',
    }).select().single();
    if (error) throw error;
    return transformTransfer(data);
  },

  async update(id: string, transfer: any) {
    const { data, error } = await supabase.from('transfers').update({
      name: transfer.name,
      vehicle_type: transfer.vehicleType || 'Sedan',
      capacity: transfer.capacity || 4,
      rate: transfer.rate || 0,
      description: transfer.description || null,
      status: transfer.status || 'active',
    }).eq('id', id).select().single();
    if (error) throw error;
    return transformTransfer(data);
  },

  async delete(id: string) {
    const { error } = await supabase.from('transfers').delete().eq('id', id);
    if (error) throw error;
  },

  async importBulk(transfers: any[]) {
    const insertData = transfers.map(t => ({
      name: t.name,
      vehicle_type: t.vehicleType || 'Sedan',
      capacity: t.capacity || 4,
      rate: t.rate || 0,
      description: t.description || null,
      status: t.status || 'active',
    }));
    const { data, error } = await supabase.from('transfers').insert(insertData).select();
    if (error) throw error;
    return { count: data?.length || 0 };
  }
};

// Meals Database API
export const mealsDb = {
  async getAll() {
    const { data, error } = await supabase.from('meals').select('*').order('name');
    if (error) throw error;
    return (data || []).map(transformMeal);
  },

  async create(meal: any) {
    const { data, error } = await supabase.from('meals').insert({
      name: meal.name,
      meal_type: meal.mealType || 'Lunch',
      cuisine: meal.cuisine || 'International',
      rate: meal.rate || 0,
      description: meal.description || null,
      status: meal.status || 'active',
    }).select().single();
    if (error) throw error;
    return transformMeal(data);
  },

  async update(id: string, meal: any) {
    const { data, error } = await supabase.from('meals').update({
      name: meal.name,
      meal_type: meal.mealType || 'Lunch',
      cuisine: meal.cuisine || 'International',
      rate: meal.rate || 0,
      description: meal.description || null,
      status: meal.status || 'active',
    }).eq('id', id).select().single();
    if (error) throw error;
    return transformMeal(data);
  },

  async delete(id: string) {
    const { error } = await supabase.from('meals').delete().eq('id', id);
    if (error) throw error;
  },

  async importBulk(meals: any[]) {
    const insertData = meals.map(m => ({
      name: m.name,
      meal_type: m.mealType || 'Lunch',
      cuisine: m.cuisine || 'International',
      rate: m.rate || 0,
      description: m.description || null,
      status: m.status || 'active',
    }));
    const { data, error } = await supabase.from('meals').insert(insertData).select();
    if (error) throw error;
    return { count: data?.length || 0 };
  }
};

// Sightseeing Database API
export const sightseeingDb = {
  async getAll() {
    const { data, error } = await supabase.from('sightseeing').select('*').order('name');
    if (error) throw error;
    return (data || []).map(transformSightseeing);
  },

  async create(item: any) {
    const { data, error } = await supabase.from('sightseeing').insert({
      name: item.name,
      location: item.location || 'Dubai',
      duration: item.duration || '4 hours',
      adult_rate: item.adultRate || 0,
      child_rate: item.childRate || 0,
      description: item.description || null,
      status: item.status || 'active',
    }).select().single();
    if (error) throw error;
    return transformSightseeing(data);
  },

  async update(id: string, item: any) {
    const { data, error } = await supabase.from('sightseeing').update({
      name: item.name,
      location: item.location || 'Dubai',
      duration: item.duration || '4 hours',
      adult_rate: item.adultRate || 0,
      child_rate: item.childRate || 0,
      description: item.description || null,
      status: item.status || 'active',
    }).eq('id', id).select().single();
    if (error) throw error;
    return transformSightseeing(data);
  },

  async delete(id: string) {
    const { error } = await supabase.from('sightseeing').delete().eq('id', id);
    if (error) throw error;
  },

  async importBulk(items: any[]) {
    const insertData = items.map(i => ({
      name: i.name,
      location: i.location || 'Dubai',
      duration: i.duration || '4 hours',
      adult_rate: i.adultRate || 0,
      child_rate: i.childRate || 0,
      description: i.description || null,
      status: i.status || 'active',
    }));
    const { data, error } = await supabase.from('sightseeing').insert(insertData).select();
    if (error) throw error;
    return { count: data?.length || 0 };
  }
};

// Entry Tickets Database API
export const entryTicketsDb = {
  async getAll() {
    const { data, error } = await supabase.from('entry_tickets').select('*').order('name');
    if (error) throw error;
    return (data || []).map(transformEntryTicket);
  },

  async create(item: any) {
    const { data, error } = await supabase.from('entry_tickets').insert({
      name: item.name,
      location: item.location || 'Dubai',
      adult_rate: item.adultRate || 0,
      child_rate: item.childRate || 0,
      description: item.description || null,
      status: item.status || 'active',
    }).select().single();
    if (error) throw error;
    return transformEntryTicket(data);
  },

  async update(id: string, item: any) {
    const { data, error } = await supabase.from('entry_tickets').update({
      name: item.name,
      location: item.location || 'Dubai',
      adult_rate: item.adultRate || 0,
      child_rate: item.childRate || 0,
      description: item.description || null,
      status: item.status || 'active',
    }).eq('id', id).select().single();
    if (error) throw error;
    return transformEntryTicket(data);
  },

  async delete(id: string) {
    const { error } = await supabase.from('entry_tickets').delete().eq('id', id);
    if (error) throw error;
  },

  async importBulk(items: any[]) {
    const insertData = items.map(i => ({
      name: i.name,
      location: i.location || 'Dubai',
      adult_rate: i.adultRate || 0,
      child_rate: i.childRate || 0,
      description: i.description || null,
      status: i.status || 'active',
    }));
    const { data, error } = await supabase.from('entry_tickets').insert(insertData).select();
    if (error) throw error;
    return { count: data?.length || 0 };
  }
};

// Visa Database API
export const visasDb = {
  async getAll() {
    const { data, error } = await supabase.from('visas').select('*').order('name');
    if (error) throw error;
    return (data || []).map(transformVisa);
  },

  async create(visa: any) {
    const { data, error } = await supabase.from('visas').insert({
      name: visa.name,
      visa_type: visa.visaType || '30 Days Tourist',
      processing_time: visa.processingTime || '3-5 days',
      rate: visa.rate || 0,
      description: visa.description || null,
      status: visa.status || 'active',
    }).select().single();
    if (error) throw error;
    return transformVisa(data);
  },

  async update(id: string, visa: any) {
    const { data, error } = await supabase.from('visas').update({
      name: visa.name,
      visa_type: visa.visaType || '30 Days Tourist',
      processing_time: visa.processingTime || '3-5 days',
      rate: visa.rate || 0,
      description: visa.description || null,
      status: visa.status || 'active',
    }).eq('id', id).select().single();
    if (error) throw error;
    return transformVisa(data);
  },

  async delete(id: string) {
    const { error } = await supabase.from('visas').delete().eq('id', id);
    if (error) throw error;
  },

  async importBulk(visas: any[]) {
    const insertData = visas.map(v => ({
      name: v.name,
      visa_type: v.visaType || '30 Days Tourist',
      processing_time: v.processingTime || '3-5 days',
      rate: v.rate || 0,
      description: v.description || null,
      status: v.status || 'active',
    }));
    const { data, error } = await supabase.from('visas').insert(insertData).select();
    if (error) throw error;
    return { count: data?.length || 0 };
  }
};

// Agents Database API
export const agentsDb = {
  async getAll() {
    const { data, error } = await supabase.from('agents').select('*').order('name');
    if (error) throw error;
    return (data || []).map(transformAgent);
  },

  async create(agent: any) {
    const { data, error } = await supabase.from('agents').insert({
      name: agent.name,
      email: agent.email || null,
      phone: agent.phone || null,
      company: agent.company || null,
      commission_rate: agent.commissionRate || 0,
      status: agent.status || 'active',
    }).select().single();
    if (error) throw error;
    return transformAgent(data);
  },

  async update(id: string, agent: any) {
    const { data, error } = await supabase.from('agents').update({
      name: agent.name,
      email: agent.email || null,
      phone: agent.phone || null,
      company: agent.company || null,
      commission_rate: agent.commissionRate || 0,
      status: agent.status || 'active',
    }).eq('id', id).select().single();
    if (error) throw error;
    return transformAgent(data);
  },

  async delete(id: string) {
    const { error } = await supabase.from('agents').delete().eq('id', id);
    if (error) throw error;
  }
};
