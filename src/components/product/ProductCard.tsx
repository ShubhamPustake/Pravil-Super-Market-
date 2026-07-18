"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Heart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/store/useCart"

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    originalPrice?: number
    discount?: number
    image: string
    unit: string
    rating: number
    reviews: number
    inStock: boolean
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      unit: product.unit,
    })
  }

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300">
      <div className="relative aspect-square bg-slate-100 overflow-hidden">
        {/* Discount Badge */}
        {product.discount && product.discount > 0 && (
          <Badge className="absolute top-2 left-2 z-10 bg-red-500 hover:bg-red-600">
            {product.discount}% OFF
          </Badge>
        )}
        
        {/* Wishlist Button */}
        <button className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/80 text-slate-400 hover:text-red-500 hover:bg-white transition-colors opacity-0 group-hover:opacity-100">
          <Heart className="h-5 w-5" />
        </button>

        {/* Product Image */}
        <Link href={`/product/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      </div>

      <CardContent className="p-4">
        {/* Unit & Rating */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
            {product.unit}
          </span>
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-xs font-medium text-slate-600">{product.rating} <span className="text-slate-400">({product.reviews})</span></span>
          </div>
        </div>

        {/* Title */}
        <Link href={`/product/${product.id}`}>
          <h3 className="font-semibold text-slate-800 line-clamp-2 hover:text-green-600 transition-colors h-12">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-bold text-slate-900">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-sm text-slate-400 line-through">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
          disabled={!product.inStock}
          onClick={handleAddToCart}
        >
          {product.inStock ? (
            <>
              <ShoppingCart className="h-4 w-4" /> Add to Cart
            </>
          ) : (
            "Out of Stock"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
