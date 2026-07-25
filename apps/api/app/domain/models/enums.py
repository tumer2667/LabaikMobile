from enum import StrEnum


class UserRole(StrEnum):
    CUSTOMER = "customer"
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"  # sub-admin: same access as super_admin except user management


STAFF_ROLES = frozenset({UserRole.SUPER_ADMIN.value, UserRole.ADMIN.value})


class UserStatus(StrEnum):
    ACTIVE = "active"
    DISABLED = "disabled"


class ProductStatus(StrEnum):
    DRAFT = "draft"
    ACTIVE = "active"
    ARCHIVED = "archived"
