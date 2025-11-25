"use client"

import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
// import Button from '@mui/material/Button'
// import ActionIcon from '@mui/material/ActionIcon'
// import Menu from '@mui/material/Menu'
// import MenuItem from '@mui/material/MenuItem'
import {
  Button,
  ActionIcon,
  Menu,
  MenuItem
} from '@mantine/core'
import Link from 'next/link'
// import {
//   MoreVert,
//   Visibility,
//   Edit,
//   Delete,
// } from '@mui/icons-material'
import { FilterableColumn, FilterableTable } from '~/components/filterable-table'

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
  const { data: session } = useSession()
  const [products, setProducts] = useState<ProductRow[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [anchorEl, setAnchorEl] = useState<Record<string, HTMLElement | null>>({})
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const permissions = (session?.user as any)?.permissions || []

  // Check permissions - try multiple possible menu code formats
  const canView =
    permissions.some((p: string) =>
      /^(products?|item|master):view$/i.test(p)
    ) || permissions.includes('products:view') || permissions.includes('product:view')
  const canEdit =
    permissions.some((p: string) =>
      /^(products?|item|master):edit$/i.test(p)
    ) || permissions.includes('products:edit') || permissions.includes('product:edit')
  const canDelete =
    permissions.some((p: string) =>
      /^(products?|item|master):delete$/i.test(p)
    ) || permissions.includes('products:delete') || permissions.includes('product:delete')

  // Debug: Log permissions to console
  useEffect(() => {
    if (session?.user) {
      console.log('User permissions:', permissions)
      console.log('Session user:', session.user)
      console.log('Can View:', canView, 'Can Edit:', canEdit, 'Can Delete:', canDelete)
    }
  }, [session, permissions, canView, canEdit, canDelete])

  useEffect(() => {
    void fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/v1/products')

      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }

      const data = await response.json()

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
      setErrorMessage(null)
    } catch (error) {
      console.error(error)
      setErrorMessage('Failed to fetch products. Please try again.')
    }
  }

  const handleMenuOpen = (itemId: string, event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl((prev) => ({ ...prev, [itemId]: event.currentTarget }))
  }

  const handleMenuClose = (itemId: string) => {
    setAnchorEl((prev) => ({ ...prev, [itemId]: null }))
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      const response = await fetch(`/api/v1/products/${deleteId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        void fetchProducts()
        setDeleteId(null)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete product')
      }
    } catch (error: any) {
      console.error(error)
      setErrorMessage(error.message || 'Failed to delete product. Please try again.')
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
          const hasAnyPermission = canView || canEdit || canDelete
          if (!hasAnyPermission) {
            return <span className="text-muted-foreground text-sm">—</span>
          }

          const menuOpen = Boolean(anchorEl[row.itemId])

          return (
            <div>
              {/* <ActionIcon
                size="small"
                onClick={(e) => handleMenuOpen(row.itemId, e)}
                aria-label="more actions"
              >
                <MoreVert fontSize="small" />
              </ActionIcon>
              <Menu
                anchorEl={anchorEl[row.itemId] || undefined}
                open={menuOpen}
                onClose={() => handleMenuClose(row.itemId)}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                {canView && (
                  <MenuItem
                    component={Link}
                    href={`/dashboard/products/view/${row.itemId}`}
                    onClick={() => handleMenuClose(row.itemId)}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <Visibility fontSize="small" />
                    <span>View</span>
                  </MenuItem>
                )}
                {canEdit && (
                  <MenuItem
                    component={Link}
                    href={`/dashboard/products/edit/${row.itemId}`}
                    onClick={() => handleMenuClose(row.itemId)}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <Edit fontSize="small" />
                    <span>Edit</span>
                  </MenuItem>
                )}
                {canDelete && (
                  <MenuItem
                    onClick={() => {
                      setDeleteId(row.itemId)
                      handleMenuClose(row.itemId)
                    }}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}
                  >
                    <Delete fontSize="small" />
                    <span>Delete</span>
                  </MenuItem>
                )}
              </Menu> */}
            </div>
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
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              row.isActive
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
    [anchorEl, canView, canEdit, canDelete]
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">Inventory</p>
          <h1 className="text-3xl font-semibold text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground">
            Review catalog items and keep your active list up to date.
          </p>
        </div>
        <Link href="/dashboard/products/create" className="self-end md:self-auto">
          <Button
            variant="contained"
            color="primary"
            className="rounded-full px-6 py-2 text-sm font-semibold normal-case"
          >
            + New Product
          </Button>
        </Link>
      </div>

      {errorMessage ? (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

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
                variant="outlined"
                onClick={() => setDeleteId(null)}
                className="normal-case"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
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
