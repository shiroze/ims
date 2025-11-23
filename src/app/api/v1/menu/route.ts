import { NextResponse } from 'next/server';
import { auth } from '~/libs/auth';
import { initializeDatabase } from '~/libs/typeorm';
import { Menu } from '~/entities/Menu';
import { RoleDetails } from '~/entities/RoleDetails';

type RawMenuRow = {
  MenuId: number;
  ParentId: string | number;
  MenuName: string;
  MenuUrl: string;
  MenuIcon: string;
  MenuOrder: number;
};

const buildTree = (rows: RawMenuRow[]): any[] => {
  const byParent: Record<string | number, RawMenuRow[]> = {};
  for (const row of rows) {
    const parentId = row.ParentId || '0';
    const parentKey = typeof parentId === 'string' ? parentId : String(parentId);
    if (!byParent[parentKey]) byParent[parentKey] = [];
    byParent[parentKey].push(row);
  }
  const sortByOrder = (a: RawMenuRow, b: RawMenuRow) => a.MenuOrder - b.MenuOrder;
  const makeNode = (r: RawMenuRow): any => ({
    key: String(r.MenuId),
    label: r.MenuName,
    href: r.MenuUrl || '#',
    icon: r.MenuIcon || undefined,
    children: (byParent[r.MenuId] || []).sort(sortByOrder).map(makeNode),
  });
  return (byParent['0'] || []).sort(sortByOrder).map(makeNode);
};

export async function GET() {
  try {
    const session = await auth();
    const roleIdParam = (session?.user as any)?.role_id || null;
    const roleId = roleIdParam ? Number(roleIdParam) : null;

    // Initialize database connection
    const dataSource = await initializeDatabase();
    const menuRepository = dataSource.getRepository(Menu);

    // Build query using TypeORM query builder
    let queryBuilder = menuRepository
      .createQueryBuilder('menu')
      .innerJoin(
        RoleDetails,
        'roleDetails',
        'roleDetails.MenuId = menu.MenuId'
      )
      .select([
        'menu.MenuId',
        'menu.ParentId',
        'menu.MenuName',
        'menu.MenuUrl',
        'menu.MenuIcon',
        'menu.MenuOrder'
      ])
      .where('menu.IsShow = :isShow', { isShow: true })
      .andWhere('menu.IsActive = :isActive', { isActive: true })
      .andWhere(
        '(roleDetails.IsView = :trueValue OR roleDetails.IsAdd = :trueValue OR roleDetails.IsEdit = :trueValue OR roleDetails.IsDelete = :trueValue OR roleDetails.IsPrint = :trueValue)',
        { trueValue: true }
      )
      .orderBy('menu.ParentId', 'ASC')
      .addOrderBy('menu.MenuOrder', 'ASC');

    // Add role filter if roleId is provided
    if (roleId) {
      queryBuilder = queryBuilder.andWhere('roleDetails.RoleId = :roleId', { roleId });
    }

    const rows = await queryBuilder.getRawMany();

    // Map the raw results to our expected format
    const mappedRows: RawMenuRow[] = rows.map((row: any) => ({
      MenuId: row.menu_MenuId,
      ParentId: row.menu_ParentId,
      MenuName: row.menu_MenuName,
      MenuUrl: row.menu_MenuUrl,
      MenuIcon: row.menu_MenuIcon,
      MenuOrder: row.menu_MenuOrder,
    }));

    const tree = buildTree(mappedRows);
    return NextResponse.json({ items: tree });
  } catch (err: any) {
    console.error('Menu route error:', err);
    return NextResponse.json({ error: err.message || 'Failed to load menu' }, { status: 500 });
  }
}


