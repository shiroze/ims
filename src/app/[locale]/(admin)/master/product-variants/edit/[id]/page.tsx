"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { useToast } from '~/hooks/use-toast'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  sku: string
  unit: string
}

interface ProductVariant {
  id: string
  productId: string
  skuVariant: string
  name: string
  unit: string
  product: Product
}

export default function EditProductVariantPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [formData, setFormData] = useState<ProductVariant>({
    id: '',
    productId: '',
    skuVariant: '',
    name: '',
    unit: '',
    product: {
      id: '',
      name: '',
      sku: '',
      unit: '',
    }
  })

  useEffect(() => {
    fetchProducts()
    fetchVariant()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      })
    }
  }

  const fetchVariant = async () => {
    try {
      const response = await fetch(`/api/product-variants/${params.id}`)
      const data = await response.json()
      setFormData(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch product variant",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch(`/api/product-variants/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Product variant updated successfully",
        })
        router.push('/dashboard/product-variants')
      } else {
        throw new Error('Failed to update product variant')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product variant",
        variant: "destructive",
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleProductSelect = (value: string) => {
    const product = products.find(p => p.id === value)
    setFormData(prev => ({
      ...prev,
      productId: value,
      unit: product?.unit || '',
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/product-variants">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Product Variant</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Variant Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productId">Product</Label>
                <Select
                  value={formData.productId}
                  onValueChange={handleProductSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="skuVariant">Variant SKU</Label>
                <Input
                  id="skuVariant"
                  name="skuVariant"
                  value={formData.skuVariant}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Variant Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Link href="/dashboard/product-variants">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit">Update Variant</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}