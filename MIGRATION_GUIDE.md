# Frontend-Backend Integration Guide

This guide explains how to update the frontend pages to use the backend API instead of local state.

## Overview

The backend API is ready and the frontend API service layer (`src/lib/api.ts`) is created. Now you need to update individual pages to fetch data from the API instead of using local state.

## Example: Updating Hotels Page

### Before (Local State)
```typescript
const [hotels, setHotels] = useState<Hotel[]>(initialHotels);

const handleSubmit = () => {
  const newHotel = { ...formData, id: `hotel-${Date.now()}` };
  setHotels([...hotels, newHotel]);
};
```

### After (API Integration)
```typescript
import { hotelsApi } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch hotels
const { data: hotels = [], isLoading } = useQuery({
  queryKey: ['hotels', searchTerm, statusFilter],
  queryFn: () => hotelsApi.getAll({ search: searchTerm, status: statusFilter })
});

// Create hotel mutation
const queryClient = useQueryClient();
const createMutation = useMutation({
  mutationFn: hotelsApi.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['hotels'] });
    toast.success('Hotel added successfully!');
  }
});

const handleSubmit = () => {
  createMutation.mutate(formData);
};
```

## Step-by-Step Migration

### 1. Hotels Page (`src/pages/Hotels.tsx`)

**Changes needed:**
- Replace `useState` with `useQuery` for fetching hotels
- Replace local state updates with `useMutation`
- Update `hotelStore` to fetch from API on mount
- Handle loading and error states

**Key updates:**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hotelsApi } from '@/lib/api';

// Replace useState with useQuery
const { data: hotels = [], isLoading, error } = useQuery({
  queryKey: ['hotels', searchTerm],
  queryFn: () => hotelsApi.getAll({ search: searchTerm })
});

// Replace local handlers with mutations
const queryClient = useQueryClient();
const createMutation = useMutation({
  mutationFn: hotelsApi.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['hotels'] });
    setIsDialogOpen(false);
  }
});
```

### 2. Customers Page (`src/pages/Customers.tsx`)

**Similar pattern:**
```typescript
import { customersApi } from '@/lib/api';

const { data: customers = [] } = useQuery({
  queryKey: ['customers', searchTerm, statusFilter],
  queryFn: () => customersApi.getAll({ search: searchTerm, status: statusFilter })
});

const createMutation = useMutation({
  mutationFn: customersApi.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['customers'] });
  }
});
```

### 3. Agents Page (`src/pages/Agents.tsx`)

**Same pattern:**
```typescript
import { agentsApi } from '@/lib/api';

const { data: agents = [] } = useQuery({
  queryKey: ['agents', searchTerm, statusFilter],
  queryFn: () => agentsApi.getAll({ search: searchTerm, status: statusFilter })
});
```

### 4. Quotations Page (`src/pages/Quotations.tsx`)

**For quotations:**
```typescript
import { quotationsApi } from '@/lib/api';

const { data: quotations = [] } = useQuery({
  queryKey: ['quotations', searchTerm, statusFilter],
  queryFn: () => quotationsApi.getAll({ search: searchTerm, status: statusFilter })
});
```

### 5. Create Quotation Page (`src/pages/CreateQuotation.tsx`)

**For creating quotations:**
```typescript
import { quotationsApi, customersApi, hotelsApi } from '@/lib/api';

// Fetch customers
const { data: customers = [] } = useQuery({
  queryKey: ['customers'],
  queryFn: () => customersApi.getAll()
});

// Fetch hotels
const { data: hotels = [] } = useQuery({
  queryKey: ['hotels'],
  queryFn: () => hotelsApi.getAll({ status: 'active' })
});

// Create quotation mutation
const createMutation = useMutation({
  mutationFn: quotationsApi.create,
  onSuccess: (data) => {
    toast.success(`Quotation ${data.quotationId} created successfully!`);
    // Navigate or reset form
  }
});
```

### 6. Dashboard Page (`src/pages/Dashboard.tsx`)

**For dashboard stats:**
```typescript
import { dashboardApi } from '@/lib/api';

const { data: stats } = useQuery({
  queryKey: ['dashboard', 'stats'],
  queryFn: () => dashboardApi.getStats()
});

const { data: recentQuotations = [] } = useQuery({
  queryKey: ['dashboard', 'recent-quotations'],
  queryFn: () => dashboardApi.getRecentQuotations()
});
```

## Common Patterns

### Loading States
```typescript
if (isLoading) {
  return <div>Loading...</div>;
}
```

### Error Handling
```typescript
if (error) {
  return <div>Error: {error.message}</div>;
}
```

### Optimistic Updates
```typescript
const updateMutation = useMutation({
  mutationFn: ({ id, data }) => hotelsApi.update(id, data),
  onMutate: async ({ id, data }) => {
    await queryClient.cancelQueries({ queryKey: ['hotels'] });
    const previousHotels = queryClient.getQueryData(['hotels']);
    queryClient.setQueryData(['hotels'], (old: any) => 
      old.map((h: any) => h._id === id ? { ...h, ...data } : h)
    );
    return { previousHotels };
  },
  onError: (err, variables, context) => {
    queryClient.setQueryData(['hotels'], context.previousHotels);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['hotels'] });
  }
});
```

## Hotel Store Integration

The `hotelStore` can be updated to fetch from API on initialization:

```typescript
// In hotelStore.ts
import { hotelsApi } from './api';

export const hotelStore = {
  // ... existing methods
  
  async loadHotels() {
    try {
      const hotels = await hotelsApi.getAll();
      this.setHotels(hotels);
    } catch (error) {
      console.error('Failed to load hotels:', error);
    }
  },
  
  // Update methods to call API
  async addHotel(hotel: Hotel) {
    try {
      const created = await hotelsApi.create(hotel);
      hotelsData = [...hotelsData, created];
      notifyListeners();
    } catch (error) {
      throw error;
    }
  }
};
```

## Testing the Integration

1. **Start backend**: `cd server && npm run dev`
2. **Start frontend**: `npm run dev`
3. **Test CRUD operations**:
   - Create a hotel → Check MongoDB
   - Update a hotel → Verify changes persist
   - Delete a hotel → Confirm removal
4. **Test search and filters**: Verify query parameters work
5. **Test error handling**: Disconnect backend, verify error messages

## Migration Checklist

- [ ] Update Hotels page to use API
- [ ] Update Customers page to use API
- [ ] Update Agents page to use API
- [ ] Update Quotations page to use API
- [ ] Update Create Quotation page to use API
- [ ] Update Dashboard to use API
- [ ] Update Sightseeing page to use API
- [ ] Update Meals page to use API
- [ ] Update Transfers page to use API
- [ ] Update Entry Tickets page to use API
- [ ] Update Visa page to use API
- [ ] Add loading states to all pages
- [ ] Add error handling to all pages
- [ ] Test all CRUD operations
- [ ] Test search and filtering
- [ ] Remove unused local state code

## Benefits of API Integration

1. **Data Persistence**: All data saved to MongoDB
2. **Multi-user Support**: Multiple users can access same data
3. **Real-time Updates**: Can add WebSocket support later
4. **Scalability**: Backend can handle more load
5. **Security**: Can add authentication and authorization
6. **Analytics**: Can track usage and generate reports

## Next Steps

After migrating all pages:
1. Add authentication (Firebase Auth)
2. Add authorization (role-based access)
3. Add data validation on backend
4. Add file upload for images
5. Add email notifications
6. Add PDF generation for quotations
7. Add reporting and analytics
