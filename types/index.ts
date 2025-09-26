// types/index.ts
export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: 'renter' | 'owner';
  avatar?: string;
  averageRating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IItem {
  _id: string;
  title: string;
  description: string;
  pricePerDay: number;
  owner: IUser | string;
  available: boolean;
  imageUrl?: string;
  category: 'apartment' | 'equipment' | 'furniture' | 'vehicles' | 'space' | 'tools' | 'others';
  location: string;
  averageRating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IBooking {
  _id: string;
  item: IItem | string;
  renter: IUser | string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  cancellationReason?: string;
  cancelledBy?: IUser | string;
  createdAt: string;
  updatedAt: string;
}

export interface IReview {
  _id: string;
  reviewer: IUser | string;
  reviewee: IUser | string;
  item: IItem | string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

// Form data types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  role: 'renter' | 'owner';
}

export interface CreateItemFormData {
  title: string;
  description: string;
  pricePerDay: number;
  category: IItem['category'];
  location: string;
  imageUrl?: string;
}