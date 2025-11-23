"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { useToast } from '~/hooks/use-toast'
import { ArrowLeft, FileText, Printer } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '~/components/ui/badge'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'

interface PurchaseOrder {
  id: string
  poNumber: string
  date: string
  partner: {
    name: string
    code: string
  }
  status: 'draft' | 'confirmed' | 'received' | 'cancelled'
  total: number
  notes?: string
  items: Array<{
    id: string
    productVariant: {
      name: string
      skuVariant: string
      product: {
        name: string
      }
    }
    quantity: number
    price: number
    total: number
  }>
}

export default function PurchaseOrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [order, setOrder] = useState<PurchaseOrder | null>(null)

  useEffect(() => {
    fetchOrder()
  }, [])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/purchase-orders/${params.id}`)
      const data = await response.json()
      setOrder(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch purchase order",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: string } = {
      draft: 'secondary',
      confirmed: 'default',
      received: 'success',
      cancelled: 'destructive',
    }

    return (
      <Badge variant={variants[status] as any}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  if (!order) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/purchases/orders">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Purchase Order Details</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          {order.status === 'draft' && (
            <Link href={`/dashboard/purchases/orders/edit/${order.id}`}>
              <Button>
                <FileText className="mr-2 h-4 w-4" />
                Edit Order
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Order Number</div>
                <div className="font-medium">{order.poNumber}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Date</div>
                <div className="font-medium">
                  {format(new Date(order.date), 'dd/MM/yyyy')}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Status</div>
                <div>{getStatusBadge(order.status)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Amount</div>
                <div className="font-medium">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(order.total)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supplier Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Name</div>
              <div className="font-medium">{order.partner.name}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Code</div>
              <div className="font-medium">{order.partner.code}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.productVariant.product.name} - {item.productVariant.name}
                  </TableCell>
                  <TableCell>{item.productVariant.skuVariant}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(item.price)}
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(item.total)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4} className="text-right font-medium">
                  Total
                </TableCell>
                <TableCell className="text-right font-medium">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(order.total)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {order.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{order.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}