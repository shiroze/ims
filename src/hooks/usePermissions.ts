import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { get } from '~/utils/api';

export type MenuPermissions = {
  IsView: boolean;
  IsAdd: boolean;
  IsEdit: boolean;
  IsDelete: boolean;
  IsPrint: boolean;
  IsExport: boolean;
  IsImport: boolean;
  IsApprove: boolean;
  IsReject: boolean;
  IsCancel: boolean;
};

/**
 * Hook to get permissions for a specific menu/page
 * @param menuCode - The menu code from t_menu table (e.g., "products")
 * @returns Permissions object with boolean flags
 */
export function usePermissions(menuCode: string): MenuPermissions & { loading: boolean } {
  const { data: session } = useSession();
  const [permissions, setPermissions] = useState<MenuPermissions>({
    IsView: false,
    IsAdd: false,
    IsEdit: false,
    IsDelete: false,
    IsPrint: false,
    IsExport: false,
    IsImport: false,
    IsApprove: false,
    IsReject: false,
    IsCancel: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!session?.user) {
        console.log('No session user found');
        setLoading(false);
        return;
      }

      try {
        const user = session.user as any;
        const roleId = user.role_id || null;

        if (!roleId) {
          console.log('No roleId found in session');
          setLoading(false);
          return;
        }

        console.log("Fetching permissions for:", { menuCode, roleId });

        // Fetch permissions from API using axios
        const data = await get<any>(`/api/v1/permissions?menuCode=${menuCode}&roleId=${roleId}`);

        console.log("Permissions response:", data);

        setPermissions({
          IsView: Boolean(data.IsView),
          IsAdd: Boolean(data.IsAdd),
          IsEdit: Boolean(data.IsEdit),
          IsDelete: Boolean(data.IsDelete),
          IsPrint: Boolean(data.IsPrint),
          IsExport: Boolean(data.IsExport),
          IsImport: Boolean(data.IsImport),
          IsApprove: Boolean(data.IsApprove),
          IsReject: Boolean(data.IsReject),
          IsCancel: Boolean(data.IsCancel),
        });
      } catch (error) {
        console.error('Failed to fetch permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [session, menuCode]);

  return { ...permissions, loading };
}
