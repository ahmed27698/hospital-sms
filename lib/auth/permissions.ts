type RoleType = 'SUPER_ADMIN' | 'QUALITY_MANAGER' | 'DEPARTMENT_MANAGER' | 'SECTION_HEAD' | 'RESPONSIBLE_USER' | 'INTERNAL_AUDITOR' | 'READ_ONLY'

export type Resource = 'standards' | 'requirements' | 'documents' | 'users' | 'departments' | 'reports' | 'audit_logs' | 'notifications' | 'settings'
export type Action = 'create' | 'read' | 'update' | 'delete' | 'approve' | 'export'

const ROLE_PERMISSIONS: Record<RoleType, Record<Resource, Action[]>> = {
  SUPER_ADMIN: {
    standards: ['create', 'read', 'update', 'delete', 'approve', 'export'],
    requirements: ['create', 'read', 'update', 'delete', 'approve', 'export'],
    documents: ['create', 'read', 'update', 'delete', 'approve', 'export'],
    users: ['create', 'read', 'update', 'delete', 'approve', 'export'],
    departments: ['create', 'read', 'update', 'delete', 'approve', 'export'],
    reports: ['create', 'read', 'update', 'delete', 'approve', 'export'],
    audit_logs: ['create', 'read', 'update', 'delete', 'approve', 'export'],
    notifications: ['create', 'read', 'update', 'delete', 'approve', 'export'],
    settings: ['create', 'read', 'update', 'delete', 'approve', 'export'],
  },
  QUALITY_MANAGER: {
    standards: ['create', 'read', 'update', 'approve', 'export'],
    requirements: ['create', 'read', 'update', 'approve', 'export'],
    documents: ['create', 'read', 'update', 'approve', 'export'],
    users: ['read'],
    departments: ['read'],
    reports: ['create', 'read', 'export'],
    audit_logs: ['read', 'export'],
    notifications: ['read', 'update'],
    settings: ['read'],
  },
  DEPARTMENT_MANAGER: {
    standards: ['read', 'update', 'export'],
    requirements: ['create', 'read', 'update', 'export'],
    documents: ['create', 'read', 'update', 'export'],
    users: ['read'],
    departments: ['read'],
    reports: ['read', 'export'],
    audit_logs: ['read'],
    notifications: ['read', 'update'],
    settings: ['read'],
  },
  SECTION_HEAD: {
    standards: ['read', 'export'],
    requirements: ['read', 'update', 'export'],
    documents: ['create', 'read', 'update'],
    users: ['read'],
    departments: ['read'],
    reports: ['read'],
    audit_logs: ['read'],
    notifications: ['read', 'update'],
    settings: ['read'],
  },
  RESPONSIBLE_USER: {
    standards: ['read'],
    requirements: ['read', 'update'],
    documents: ['create', 'read'],
    users: ['read'],
    departments: ['read'],
    reports: ['read'],
    audit_logs: ['read'],
    notifications: ['read', 'update'],
    settings: ['read'],
  },
  INTERNAL_AUDITOR: {
    standards: ['read', 'export'],
    requirements: ['read', 'export'],
    documents: ['read', 'export'],
    users: ['read'],
    departments: ['read'],
    reports: ['create', 'read', 'export'],
    audit_logs: ['read', 'export'],
    notifications: ['read'],
    settings: ['read'],
  },
  READ_ONLY: {
    standards: ['read'],
    requirements: ['read'],
    documents: ['read'],
    users: ['read'],
    departments: ['read'],
    reports: ['read'],
    audit_logs: ['read'],
    notifications: ['read'],
    settings: ['read'],
  },
}

export function hasPermission(roleType: RoleType, resource: Resource, action: Action): boolean {
  const permissions = ROLE_PERMISSIONS[roleType]
  if (!permissions) return false
  return permissions[resource]?.includes(action) ?? false
}

export function getUserPermissions(roleType: RoleType): Record<Resource, Action[]> {
  return ROLE_PERMISSIONS[roleType] ?? {}
}
