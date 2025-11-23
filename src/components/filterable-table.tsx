'use client'

import { useMemo } from 'react'
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from 'mantine-react-table'

export type FilterableColumn<T extends Record<string, unknown>> = {
  id?: string
  header: string
  accessor?: keyof T
  render?: (row: T) => React.ReactNode
  className?: string
  filterValue?: (row: T) => string
  placeholder?: string
}

type FilterableTableProps<T extends Record<string, unknown>> = {
  columns: FilterableColumn<T>[]
  data: T[]
  emptyMessage?: string
}

export function FilterableTable<T extends Record<string, unknown>>({
  columns,
  data,
  emptyMessage = 'No data available',
}: FilterableTableProps<T>) {
  const columnDefs = useMemo<MRT_ColumnDef<T>[]>(() => {
    return columns.map((column, index) => {
      const columnId = column.id ?? String(column.accessor ?? index)
      const filterAccessor =
        column.filterValue ??
        (column.accessor ? (row: T) => String(row[column.accessor!] ?? '') : undefined)

      return {
        id: columnId,
        header: column.header,
        accessorFn: filterAccessor,
        Cell: column.render
          ? ({ row }) => column.render!(row.original)
          : column.accessor
          ? ({ row }) => {
              const value = row.original[column.accessor!]
              return value === undefined || value === null || value === ''
                ? '—'
                : String(value)
            }
          : undefined,
        enableColumnFilter: Boolean(filterAccessor),
        filterFn: 'includesString',
        mantineFilterTextInputProps: {
          placeholder: column.placeholder ?? `Search ${column.header}`,
        },
        mantineTableHeadCellProps: {
          className: column.className,
        },
        mantineTableBodyCellProps: {
          className: column.className,
        },
      } satisfies MRT_ColumnDef<T>
    })
  }, [columns])

  const table = useMantineReactTable({
    columns: columnDefs,
    data,
    enableColumnFilters: true,
    initialState: {
      showColumnFilters: true,
    },
    mantineTableProps: {
      className: 'rounded-2xl border bg-white shadow-sm',
    },
    mantineTableContainerProps: {
      className: 'overflow-x-auto',
    },
    mantineTableHeadProps: {
      className: 'bg-slate-50',
    },
    mantineTableHeadCellProps: {
      className: 'p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500',
    },
    mantineTableBodyProps: {
      className: 'divide-y divide-slate-100',
    },
    mantineTableBodyCellProps: {
      className: 'p-4',
    },
    mantineTableBodyRowProps: ({ row }) => ({
      className: 'hover:bg-slate-50',
    }),
    renderEmptyRowsFallback: ({ table }) => (
      <tr>
        <td
          colSpan={table.getVisibleLeafColumns().length}
          className="p-12 text-center text-sm text-slate-500"
        >
          {emptyMessage}
        </td>
      </tr>
    ),
  })

  return <MantineReactTable table={table} />
}
