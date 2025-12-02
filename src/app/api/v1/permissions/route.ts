import { NextRequest, NextResponse } from 'next/server';
import { auth } from '~/libs/auth';
import { initializeDatabase } from '~/libs/typeorm';
import { RoleDetails } from '~/entities/RoleDetails';
import { Menu } from '~/entities/Menu';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const menuCode = searchParams.get('menuCode');
    const roleId = searchParams.get('roleId');

    if (!menuCode || !roleId) {
      return NextResponse.json(
        { error: 'menuCode and roleId are required' },
        { status: 400 }
      );
    }

    const dataSource = await initializeDatabase();
    const roleDetailsRepo = dataSource.getRepository(RoleDetails);
    const menuRepo = dataSource.getRepository(Menu);

    // Find menu by code
    const menu = await menuRepo.findOne({
      where: { MenuCode: menuCode },
    });

    if (!menu) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      );
    }

    // Find role details
    const roleDetails = await roleDetailsRepo.findOne({
      where: {
        RoleId: parseInt(roleId),
        MenuId: menu.MenuId,
      },
    });

    if (!roleDetails) {
      // No permissions found, return all false
      return NextResponse.json({
        IsView: 0,
        IsAdd: 0,
        IsEdit: 0,
        IsDelete: 0,
        IsPrint: 0,
        IsExport: 0,
        IsImport: 0,
        IsApprove: 0,
        IsReject: 0,
        IsCancel: 0,
      });
    }

    return NextResponse.json({
      IsView: roleDetails.IsView,
      IsAdd: roleDetails.IsAdd,
      IsEdit: roleDetails.IsEdit,
      IsDelete: roleDetails.IsDelete,
      IsPrint: roleDetails.IsPrint,
      IsExport: roleDetails.IsExport,
      IsImport: roleDetails.IsImport,
      IsApprove: roleDetails.IsApprove,
      IsReject: roleDetails.IsReject,
      IsCancel: roleDetails.IsCancel,
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
