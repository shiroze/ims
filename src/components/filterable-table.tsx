'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Group,
  ScrollArea,
  Select,
  Table,
  Text,
  TextInput,
  Pagination,
} from '@mantine/core'

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

const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100']

export function FilterableTable<T extends Record<string, unknown>>({
  columns,
  data,
  emptyMessage = 'No data available',
}: FilterableTableProps<T>) {
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<string>(PAGE_SIZE_OPTIONS[0])

  const filteredData = useMemo(() => {
    return data.filter((row) =>
      columns.every((column, index) => {
        const columnId = column.id ?? String(column.accessor ?? index)
        const filterValue = filters[columnId]?.trim().toLowerCase()
        if (!filterValue) return true

        const valueGetter =
          column.filterValue ??
          (column.accessor
            ? (r: T) => {
                const value = r[column.accessor!]
                return value === undefined || value === null ? '' : String(value)
              }
            : undefined)

        if (!valueGetter) return true

        const rowValue = valueGetter(row).toLowerCase()
        return rowValue.includes(filterValue)
      }),
    )
  }, [columns, data, filters])

  const pageSizeNumber = Number(pageSize)
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSizeNumber))

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSizeNumber
    return filteredData.slice(start, start + pageSizeNumber)
  }, [filteredData, page, pageSizeNumber])

  const handleFilterChange = (columnId: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [columnId]: value,
    }))
    setPage(1)
  }

  return (
    <Box className="rounded-2xl border bg-white shadow-sm">
      <ScrollArea>
        <Table highlightOnHover>
          <Table.Thead className="bg-slate-50">
            <Table.Tr>
              {columns.map((column, index) => {
                const columnId = column.id ?? String(column.accessor ?? index)
                const hasFilter = Boolean(column.filterValue || column.accessor)

                return (
                  <Table.Th
                    key={columnId}
                    className={`p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 ${column.className ?? ''}`}
                  >
                    <Group align="flex-start" gap="xs">
                      <Text size="xs">{column.header}</Text>
                    </Group>
                    {hasFilter && (
                      <TextInput
                        size="xs"
                        placeholder={column.placeholder ?? `Search ${column.header}`}
                        value={filters[columnId] ?? ''}
                        onChange={(event) => handleFilterChange(columnId, event.currentTarget.value)}
                        mt="xs"
                      />
                    )}
                  </Table.Th>
                )
              })}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {paginatedData.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={columns.length} className="p-12 text-center text-sm text-slate-500">
                  {emptyMessage}
                </Table.Td>
              </Table.Tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <Table.Tr key={`${rowIndex}-${page}`} className="hover:bg-slate-50">
                  {columns.map((column, colIndex) => {
                    const columnId = column.id ?? String(column.accessor ?? colIndex)
                    const cellClass = column.className ?? ''

                    if (column.render) {
                      return (
                        <Table.Td key={columnId} className={`p-4 ${cellClass}`}>
                          {column.render(row)}
                        </Table.Td>
                      )
                    }

                    if (column.accessor) {
                      const value = row[column.accessor]
                      return (
                        <Table.Td key={columnId} className={`p-4 ${cellClass}`}>
                          {value === undefined || value === null || value === '' ? '—' : String(value)}
                        </Table.Td>
                      )
                    }

                    return <Table.Td key={columnId} className={`p-4 ${cellClass}`} />
                  })}
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
      <Group justify="space-between" align="center" p="md" gap="md" wrap="wrap">
        <Group gap="xs" align="center">
          <Text size="sm" c="dimmed">
            Rows per page
          </Text>
          <Select
            size="xs"
            value={pageSize}
            data={PAGE_SIZE_OPTIONS}
            onChange={(value) => {
              if (!value) return
              setPageSize(value)
              setPage(1)
            }}
          />
        </Group>
        <Text size="sm" c="dimmed">
          {filteredData.length === 0
            ? 'No records'
            : `Showing ${(page - 1) * pageSizeNumber + 1}-${
                Math.min(page * pageSizeNumber, filteredData.length)
              } of ${filteredData.length}`}
        </Text>
        <Pagination value={page} onChange={setPage} total={totalPages} size="sm" />
      </Group>
    </Box>
  )
}
