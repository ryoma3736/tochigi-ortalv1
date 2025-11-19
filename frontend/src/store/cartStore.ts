import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartState, CartService, CartCompany } from '@/types'

const MAX_COMPANIES = 10

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      services: [],
      companies: [],

      addService: (service: CartService) => {
        set((state) => {
          // Check if service already exists
          const exists = state.services.some(s => s.serviceId === service.serviceId)
          if (exists) return state

          return {
            services: [...state.services, service]
          }
        })
      },

      removeService: (serviceId: string) => {
        set((state) => ({
          services: state.services.filter(s => s.serviceId !== serviceId)
        }))
      },

      addCompany: (company: CartCompany) => {
        set((state) => {
          // Check if company already exists
          const exists = state.companies.some(c => c.companyId === company.companyId)
          if (exists) return state

          // Check if max companies reached
          if (state.companies.length >= MAX_COMPANIES) {
            alert(`最大${MAX_COMPANIES}社まで選択できます`)
            return state
          }

          return {
            companies: [...state.companies, company]
          }
        })
      },

      removeCompany: (companyId: string) => {
        set((state) => ({
          companies: state.companies.filter(c => c.companyId !== companyId)
        }))
      },

      clearCart: () => {
        set({
          services: [],
          companies: []
        })
      },

      getTotalEstimate: () => {
        const state = get()
        const total = state.services.reduce(
          (acc, service) => ({
            min: acc.min + service.estimatedPrice.min,
            max: acc.max + service.estimatedPrice.max
          }),
          { min: 0, max: 0 }
        )
        return total
      }
    }),
    {
      name: 'cart-storage',
    }
  )
)
