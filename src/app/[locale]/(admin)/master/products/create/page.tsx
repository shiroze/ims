"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, Group, Stack, TextInput, Title, Switch, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconArrowLeft } from '@tabler/icons-react'
import Link from 'next/link'
import { post } from '~/utils/api'
import type { Product } from '~/types/product'

export default function CreateProductPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Product>({
    ItemId: '',
    SKU: '',
    ItemName: '',
    CategoryName: '',
    BrandName: '',
    UoM: '',
    IsActive: true,
  })

  const handleChange =
    (field: keyof Product) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }))
    }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    try {
      await post('/api/v1/products', formData)
      notifications.show({
        title: 'Success',
        message: 'Product created successfully',
        color: 'green',
      })
      router.push('/master/products')
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Failed to create product',
        color: 'red',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Group>
        <Link href="/master/products">
          <Button variant="outline" leftSection={<IconArrowLeft size={16} />}>
            Back
          </Button>
        </Link>
        <Title order={2}>Create Product</Title>
      </Group>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <div>
              <Title order={4}>Product Information</Title>
              <Text size="sm" c="dimmed">
                Provide basic details about the product you want to add.
              </Text>
            </div>

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
                setFormData((prev) => ({
                  ...prev,
                  IsActive: event.currentTarget.checked,
                }))
              }
            />

            <Group justify="flex-end" mt="md">
              <Link href="/master/products">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" loading={saving}>
                Create Product
              </Button>
            </Group>
          </Stack>
        </form>
      </Card>
    </div>
  )
}