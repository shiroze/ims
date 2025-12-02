## 🗄️ Database Structure

Your existing tables work perfectly:

### t_roles
- `RoleId` (INT) - Primary key (1 = Admin)
- `RoleName` (VARCHAR) - Role name
- `IsActive` (BOOLEAN) - Active status

### t_menu
- `MenuId` (INT) - Primary key
- `MenuCode` (VARCHAR) - Unique code (e.g., "products")
- `MenuName` (VARCHAR) - Display name
- `MenuUrl` (VARCHAR) - Route path

### t_roledetails
- `RoleDetailsId` (INT) - Primary key
- `RoleId` (INT) - Foreign key to t_roles
- `MenuId` (INT) - Foreign key to t_menu
- `IsView`, `IsAdd`, `IsEdit`, `IsDelete` (TINYINT) - 1 = allowed, 0 = not allowed
- `IsPrint`, `IsExport`, `IsImport` (TINYINT) - 1 = allowed, 0 = not allowed
- `IsApprove`, `IsReject`, `IsCancel` (TINYINT) - 1 = allowed, 0 = not allowed

### t_users
- `UserId` (INT) - Primary key
- `RoleId` (INT) - Foreign key to t_roles
- Other user fields...