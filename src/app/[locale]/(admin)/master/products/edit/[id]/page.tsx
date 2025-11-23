"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Switch } from '~/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { useToast } from '~/hooks/use-toast'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: string
  sku: string
  name: string
  category: string
  brand: string
  unit: string
  isStock: boolean
}

export default function EditProductPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState<Product>({
    id: '',
    sku: '',
    name: '',
    category: '',
    brand: '',
    unit: '',
    isStock: true,
  })

  useEffect(() => {
    fetchProduct()
  }, [])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`)
      const data = await response.json()
      setFormData(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch product",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Product updated successfully",
        })
        router.push('/dashboard/products')
      } else {
        throw new Error('Failed to update product')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product",
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

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/products">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Product</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  name="brand"
                  value={formData.brand}
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

              <div className="space-y-2">
                <Label htmlFor="isStock">Stock Item</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isStock"
                    checked={formData.isStock}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, isStock: checked }))
                    }
                  />
                  <Label htmlFor="isStock">Track inventory for this item</Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Link href="/dashboard/products">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit">Update Product</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}