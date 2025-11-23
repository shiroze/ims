"use client"

import { useState, useEffect } from 'react'
import { Button } from '~/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import { useToast } from '~/hooks/use-toast'

interface ProductVariant {
  id: string
  productId: string
  skuVariant: string
  name: string
  unit: string
  product: {
    name: string
    sku: string
  }
}

export default function ProductVariantsPage() {
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchVariants()
  }, [])

  const fetchVariants = async () => {
    try {
      const response = await fetch('/api/product-variants')
      const data = await response.json()
      setVariants(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch product variants",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      const response = await fetch(`/api/product-variants/${deleteId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Product variant deleted successfully",
        })
        fetchVariants()
      } else {
        throw new Error('Failed to delete product variant')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product variant",
        variant: "destructive",
      })
    }

    setDeleteId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Product Variants</h1>
        <Link href="/dashboard/product-variants/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Variant
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Variant SKU</TableHead>
              <TableHead>Variant Name</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((variant) => (
              <TableRow key={variant.id}>
                <TableCell>{variant.product.name}</TableCell>
                <TableCell>{variant.product.sku}</TableCell>
                <TableCell>{variant.skuVariant}</TableCell>
                <TableCell>{variant.name}</TableCell>
                <TableCell>{variant.unit}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Link href={`/dashboard/product-variants/edit/${variant.id}`}>
                      <Button variant="outline" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setDeleteId(variant.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product variant and may affect related transactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}