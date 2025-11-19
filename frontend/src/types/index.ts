// Service Types
export interface Service {
  id: string
  name: string
  category: string
  description: string
  estimatedPrice: {
    min: number
    max: number
  }
  duration?: string
  imageUrl?: string
}

export interface ServiceCategory {
  id: string
  name: string
  description?: string
  icon?: string
}

// Company Types
export interface Company {
  id: string
  name: string
  description: string
  services: string[]
  areas: string[]
  rating: number
  reviewCount: number
  imageUrl?: string
  instagramHandle?: string
  instagramPosts?: InstagramPost[]
  contactEmail: string
  contactPhone: string
  website?: string
  verified: boolean
}

export interface InstagramPost {
  id: string
  imageUrl: string
  caption: string
  likes: number
  timestamp: string
}

// Cart Types
export interface CartService {
  serviceId: string
  serviceName: string
  category: string
  estimatedPrice: {
    min: number
    max: number
  }
}

export interface CartCompany {
  companyId: string
  companyName: string
  contactEmail: string
  rating: number
}

export interface CartState {
  services: CartService[]
  companies: CartCompany[]
  addService: (service: CartService) => void
  removeService: (serviceId: string) => void
  addCompany: (company: CartCompany) => void
  removeCompany: (companyId: string) => void
  clearCart: () => void
  getTotalEstimate: () => { min: number; max: number }
}

// Inquiry Types
export interface InquiryFormData {
  name: string
  email: string
  phone: string
  address: string
  preferredContactMethod: 'email' | 'phone'
  message: string
  services: string[]
  companies: string[]
  preferredDate?: string
}

export interface InquiryResponse {
  id: string
  status: 'pending' | 'sent' | 'failed'
  sentAt: string
  companiesSentTo: string[]
}

// Filter Types
export interface ServiceFilter {
  category?: string
  priceRange?: {
    min: number
    max: number
  }
  searchQuery?: string
}

export interface CompanyFilter {
  areas?: string[]
  services?: string[]
  minRating?: number
  searchQuery?: string
}
