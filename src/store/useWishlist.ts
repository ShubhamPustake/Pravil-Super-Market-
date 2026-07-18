import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistStore {
  items: string[] // Array of product IDs
  toggleItem: (id: string) => void
  hasItem: (id: string) => boolean
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggleItem: (id) => {
        set((state) => {
          if (state.items.includes(id)) {
            return { items: state.items.filter((i) => i !== id) }
          }
          return { items: [...state.items, id] }
        })
      },
      hasItem: (id) => get().items.includes(id),
    }),
    {
      name: 'pravil-wishlist-storage',
    }
  )
)
