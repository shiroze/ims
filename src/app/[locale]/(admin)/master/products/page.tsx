"use client"

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, ActionIcon, Menu } from '@mantine/core'
import { IconDots, IconEye, IconEdit, IconTrash } from '@tabler/icons-react'
import Link from 'next/link'
import { FilterableColumn, FilterableTable } from '~/components/filterable-table'
import { usePermissions } from '~/hooks/usePermissions'
import { get, del } from '~/utils/api'

type ProductRow = {
  itemId: string
  sku: string
  itemName: string
  uom: string
  isActive: boolean
  accessBy: string | null
  accessTime: Date | string | null
}

export default function ProductsPage() {
  const router = useRouter()
  const { IsView, IsAdd, IsEdit, IsDelete, loading } = usePermissions('ItemGoods')
  const [products, setProducts] = useState<ProductRow[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Note: No auto-redirect - just show access denied if no permission

  useEffect(() => {
    if (IsView) {
      void fetchProducts()
    }
  }, [IsView])

  const fetchProducts = async () => {
    try {
      const data = await get<any[]>('/api/v1/products')

      const normalizedProducts: ProductRow[] = (Array.isArray(data) ? data : []).map(
        (product: Record<string, unknown>) => ({
          itemId: String(
            product.ItemId ??
            product.itemId ??
            product.id ??
            product.sku ??
            ''
          ),
          sku: String(product.SKU ?? product.sku ?? product.ItemId ?? product.itemId ?? ''),
          itemName: String(product.ItemName ?? product.itemName ?? product.name ?? ''),
          uom: String(product.UoM ?? product.uom ?? product.UomId ?? product.uomId ?? ''),
          isActive: Boolean(
            product.IsActive ??
            product.isActive ??
            product.Status ??
            product.status ??
            true
          ),
          accessBy: String(product.AccessBy ?? product.UpdatedBy ?? product.CreatedBy ?? '') || null,
          accessTime: product.AccessTime
            ? new Date(product.AccessTime as string)
            : product.UpdatedDate
              ? new Date(product.UpdatedDate as string)
              : product.CreatedDate
                ? new Date(product.CreatedDate as string)
                : null,
        })
      )

      setProducts(normalizedProducts)
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      await del(`/api/v1/products/${deleteId}`)
      void fetchProducts()
      setDeleteId(null)
    } catch (error: any) {
      console.error(error)
      setDeleteId(null)
    }
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return '—'
    try {
      const d = typeof date === 'string' ? new Date(date) : date
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d)
    } catch {
      return '—'
    }
  }

  const columns: FilterableColumn<ProductRow>[] = useMemo(
    () => [
      {
        id: 'actions',
        header: 'Actions',
        className: 'w-24',
        render: (row) => {
          const hasAnyPermission = IsEdit || IsDelete
          if (!hasAnyPermission) {
            return <span className="text-muted-foreground text-sm">—</span>
          }

          return (
            <Menu shadow="md" width={160}>
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray">
                  <IconDots size={16} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                {IsEdit && (
                  <Menu.Item
                    component={Link}
                    href={`/master/products/edit/${row.itemId}`}
                    leftSection={<IconEdit size={16} />}
                  >
                    Edit
                  </Menu.Item>
                )}
                {IsDelete && (
                  <Menu.Item
                    leftSection={<IconTrash size={16} />}
                    color="red"
                    onClick={() => setDeleteId(row.itemId)}
                  >
                    Delete
                  </Menu.Item>
                )}
              </Menu.Dropdown>
            </Menu>
          )
        },
      },
      {
        id: 'sku',
        header: 'SKU',
        filterValue: (row) => `${row.itemId} ${row.sku}`,
        render: (row) => (
          <div className="flex flex-col">
            <span className="font-semibold">{row.itemId || '—'}</span>
            {row.sku && row.sku !== row.itemId && (
              <span className="text-xs text-muted-foreground">{row.sku}</span>
            )}
          </div>
        ),
      },
      {
        header: 'Name',
        accessor: 'itemName',
      },
      {
        header: 'UoM',
        accessor: 'uom',
        render: (row) => <span>{row.uom || '—'}</span>,
      },
      {
        id: 'status',
        header: 'Status',
        filterValue: (row) => (row.isActive ? 'active' : 'inactive'),
        render: (row) => (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${row.isActive
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-slate-100 text-slate-500'
              }`}
          >
            {row.isActive ? 'Active' : 'Inactive'}
          </span>
        ),
      },
      {
        id: 'accessBy',
        header: 'Access By',
        accessor: 'accessBy',
        render: (row) => <span>{row.accessBy || '—'}</span>,
      },
      {
        id: 'accessTime',
        header: 'Access Time',
        render: (row) => <span className="text-sm">{formatDate(row.accessTime)}</span>,
      },
    ],
    [IsEdit, IsDelete]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading permissions...</p>
      </div>
    )
  }

  if (!IsView) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Access Denied</p>
          <p className="text-muted-foreground">You do not have permission to view this page.</p>
          <p className="text-sm text-muted-foreground mt-2">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">Inventory</p>
          <h1 className="text-3xl font-semibold text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground">
            Review catalog items and keep your active list up to date.
          </p>
        </div>
        {IsAdd && (
          <Link href="/dashboard/products/create" className="self-end md:self-auto">
            <Button
              variant="filled"
              color="blue"
              className="rounded-full px-6 py-2 text-sm font-semibold normal-case"
            >
              + New Product
            </Button>
          </Link>
        )}
      </div>

      <FilterableTable columns={columns} data={products} emptyMessage="No products found" />

      {/* Delete Confirmation Dialog */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-white p-6 shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteId(null)}
                className="normal-case"
              >
                Cancel
              </Button>
              <Button
                variant="filled"
                color="red"
                onClick={handleDelete}
                className="normal-case"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
