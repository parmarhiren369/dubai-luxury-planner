import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, DollarSign } from 'lucide-react';
import { Hotel } from '../types';
import { supabase } from '../lib/supabase';

interface DailyRate {
  date: string;
  rate: number;
}

export default function Hotels() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [formData, setFormData] = useState({ name: '', location: '', baseRate: '' });
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [selectedHotelForRate, setSelectedHotelForRate] = useState<Hotel | null>(null);
  const [dailyRates, setDailyRates] = useState<DailyRate[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotels();
  }, []);

  async function fetchHotels() {
    try {
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHotels(data || []);
    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name || !formData.location || !formData.baseRate) return;

    try {
      if (editingHotel) {
        const { error } = await supabase
          .from('hotels')
          .update({
            name: formData.name,
            location: formData.location,
            base_rate: parseFloat(formData.baseRate),
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingHotel.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('hotels')
          .insert([
            {
              name: formData.name,
              location: formData.location,
              base_rate: parseFloat(formData.baseRate),
            },
          ]);

        if (error) throw error;
      }

      setFormData({ name: '', location: '', baseRate: '' });
      setEditingHotel(null);
      setSelectedHotelForRate(null);
      setDailyRates([]);
      setStartDate('');
      setEndDate('');
      fetchHotels();
    } catch (error) {
      console.error('Error saving hotel:', error);
    }
  }

  function handleEdit(hotel: Hotel) {
    setEditingHotel(hotel);
    setFormData({
      name: hotel.name,
      location: hotel.location,
      baseRate: hotel.base_rate.toString(),
    });
  }

  async function handleDelete(id: string) {
    try {
      const { error } = await supabase
        .from('hotels')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchHotels();
    } catch (error) {
      console.error('Error deleting hotel:', error);
    }
  }

  function handleAddRate() {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const newRates: DailyRate[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      newRates.push({
        date: d.toISOString().split('T')[0],
        rate: selectedHotelForRate?.base_rate || 0,
      });
    }

    setDailyRates([...dailyRates, ...newRates]);
    setStartDate('');
    setEndDate('');
  }

  function handleUpdateRate(index: number, newRate: number) {
    const updated = [...dailyRates];
    updated[index].rate = newRate;
    setDailyRates(updated);
  }

  function handleRemoveRate(index: number) {
    setDailyRates(dailyRates.filter((_, i) => i !== index));
  }

  async function handleSaveRates() {
    if (!selectedHotelForRate || dailyRates.length === 0) return;

    try {
      const { error } = await supabase
        .from('daily_rates')
        .insert(
          dailyRates.map((rate) => ({
            hotel_id: selectedHotelForRate.id,
            date: rate.date,
            rate: rate.rate,
          }))
        );

      if (error) throw error;
      setSelectedHotelForRate(null);
      setDailyRates([]);
      setStartDate('');
      setEndDate('');
      fetchHotels();
    } catch (error) {
      console.error('Error saving rates:', error);
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Hotel Management</h1>

        {/* Add/Edit Hotel Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            {editingHotel ? 'Edit Hotel' : 'Add New Hotel'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Hotel Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Base Rate (AED)"
              value={formData.baseRate}
              onChange={(e) => setFormData({ ...formData, baseRate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
            >
              <Plus size={20} />
              {editingHotel ? 'Update Hotel' : 'Add Hotel'}
            </button>
            {editingHotel && (
              <button
                type="button"
                onClick={() => {
                  setEditingHotel(null);
                  setFormData({ name: '', location: '', baseRate: '' });
                }}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
            )}
          </form>
        </div>

        {/* Hotels List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel) => (
            <div key={hotel.id} className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800">{hotel.name}</h3>
              <p className="text-gray-600 mb-2">{hotel.location}</p>
              <p className="text-lg font-bold text-blue-600 mb-4">
                Base Rate: {hotel.base_rate} AED
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(hotel)}
                  className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition"
                >
                  <Edit2 size={18} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(hotel.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
                <button
                  onClick={() => setSelectedHotelForRate(hotel)}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
                >
                  <DollarSign size={18} />
                  Rates
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Rate Management */}
        {selectedHotelForRate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Manage Rates for {selectedHotelForRate.name}
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex gap-4">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddRate}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition whitespace-nowrap"
                  >
                    <Calendar size={18} />
                    Add Rate
                  </button>
                </div>
              </div>

              {dailyRates.length > 0 && (
                <div className="space-y-2 mb-6">
                  <h3 className="font-semibold text-gray-700">Daily Rates</h3>
                  {dailyRates.map((rate, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <span className="flex-1 text-gray-600">{rate.date}</span>
                      <input
                        type="number"
                        value={rate.rate}
                        onChange={(e) => handleUpdateRate(index, parseFloat(e.target.value))}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleRemoveRate(index)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleSaveRates}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
                >
                  Save Rates
                </button>
                <button
                  onClick={() => {
                    setSelectedHotelForRate(null);
                    setDailyRates([]);
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
