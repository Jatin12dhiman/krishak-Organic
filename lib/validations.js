import { z } from 'zod';

// Login validation schema
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Signup validation schema
export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number must be less than 15 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Checkout form validation schema
export const checkoutFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number must be less than 15 digits'),
  email: z
    .string()
    .optional()
    .nullable(),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(6, 'Pincode must be at least 6 digits').max(6, 'Pincode must be 6 digits'),
  gstNumber: z.string().optional(),
  date: z.string().min(1, 'Delivery date is required'),
  deliveryTime: z.string().optional(),
  message: z.string().optional(),
});

// New address validation schema
export const newAddressSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  street: z.string().min(5, 'Street address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(6, 'ZIP code must be at least 6 digits').max(6, 'ZIP code must be 6 digits'),
  country: z.string().min(2, 'Country is required'),
  isDefault: z.boolean().optional(),
  coordinates: z.object({
    latitude: z.number().optional().or(z.nan()),
    longitude: z.number().optional().or(z.nan()),
  }).optional(),
});

// Profile edit validation schema
export const profileEditSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number must be less than 15 digits'),
});

// Address form validation schema (for profile page)
export const addressFormSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number must be less than 15 digits'),
  street: z.string().min(5, 'Street address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(6, 'ZIP code must be at least 6 digits').max(6, 'ZIP code must be 6 digits'),
  country: z.string().min(2, 'Country is required'),
  isDefault: z.boolean().optional(),
});

// Contact form validation schema
export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number must be less than 15 digits').optional().or(z.literal('')),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200, 'Subject must be less than 200 characters'),
  message: z.string().min(1, 'Message is required').max(1000, 'Message must be less than 1000 characters'),
  queryType: z.enum(['General', 'Franchise', 'Party Order', 'Corporate Order'], {
    errorMap: () => ({ message: 'Please select a valid query type' })
  }),
});
