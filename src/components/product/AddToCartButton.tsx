"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/store/useCart"

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    price: number
    image: string
    unit: string
    inStock: boolean
  }
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      unit: product.unit,
      quantity: 1
    })
  }

  return (
    <Button 
      size="lg" 
      className="flex-1 bg-green-600 hover:bg-green-700 h-14 text-lg gap-2" 
      disabled={!product.inStock}
      onClick={handleAddToCart}
    >
      <ShoppingCart className="h-5 w-5" />
      {product.inStock ? "Add to Cart" : "Out of Stock"}
    </Button>
  )
}
