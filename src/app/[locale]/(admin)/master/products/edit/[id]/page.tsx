"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, TextInput, Switch, Card, Group, Stack, Title, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconArrowLeft } from '@tabler/icons-react'
import Link from 'next/link'
import { get, put } from '~/utils/api'
import type { Product } from '~/types/product'

export default function EditProductPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<Product>({
    ItemId: '',
    SKU: '',
    ItemName: '',
    CategoryName: '',
    BrandName: '',
    UoM: '',
    IsActive: true,
  })

  useEffect(() => {
    fetchProduct()
  }, [])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const data = await get<any>(`/api/v1/products/${params.id}`)
      setFormData({
        ItemId: data.ItemId || data.itemId || '',
        SKU: data.SKU || data.sku || '',
        ItemName: data.ItemName || data.itemName || data.name || '',
        CategoryName: data.CategoryName || data.categoryName || data.category || '',
        BrandName: data.BrandName || data.brandName || data.brand || '',
        UoM: data.UoM || data.uom || data.unit || '',
        IsActive: data.IsActive ?? data.isActive ?? true,
      })
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to fetch product",
        color: "red",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await put(`/api/v1/products/${params.id}`, formData)

      notifications.show({
        title: "Success",
        message: "Product updated successfully",
        color: "green",
      })
      router.push('/master/products')
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.error || "Failed to update product",
        color: "red",
      })
    }
  }

  const handleChange = (field: keyof Product) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Text c="dimmed">Loading product...</Text>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Group>
        <Link href="/master/products">
          <Button variant="outline" leftSection={<IconArrowLeft size={16} />}>
            Back
          </Button>
        </Link>
        <Title order={2}>Edit Product</Title>
      </Group>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <Title order={4}>Product Information</Title>

            <Group grow>
              <TextInput
                label="SKU"
                placeholder="Enter SKU"
                value={formData.SKU}
                onChange={handleChange('SKU')}
                required
              />

              <TextInput
                label="Product Name"
                placeholder="Enter product name"
                value={formData.ItemName}
                onChange={handleChange('ItemName')}
                required
              />
            </Group>

            <Group grow>
              <TextInput
                label="Category"
                placeholder="Enter category"
                value={formData.CategoryName}
                onChange={handleChange('CategoryName')}
                required
              />

              <TextInput
                label="Brand"
                placeholder="Enter brand"
                value={formData.BrandName}
                onChange={handleChange('BrandName')}
                required
              />
            </Group>

            <TextInput
              label="Unit of Measure"
              placeholder="Enter unit (e.g., PCS, KG)"
              value={formData.UoM}
              onChange={handleChange('UoM')}
              required
              style={{ maxWidth: '50%' }}
            />

            <Switch
              label="Active Status"
              description="Enable this product for use"
              checked={formData.IsActive}
              onChange={(event) =>
                setFormData(prev => ({ ...prev, IsActive: event.currentTarget.checked }))
              }
            />

            <Group justify="flex-end" mt="md">
              <Link href="/master/products">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" color="blue">
                Update Product
              </Button>
            </Group>
          </Stack>
        </form>
      </Card>
    </div>
  )
}