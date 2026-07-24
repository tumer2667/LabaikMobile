from enum import StrEnum


class UserRole(StrEnum):
    CUSTOMER = "customer"
    ADMIN = "admin"
    SUB_ADMIN = "sub_admin"


class UserStatus(StrEnum):
    ACTIVE = "active"
    DISABLED = "disabled"


class ProductStatus(StrEnum):
    DRAFT = "draft"
    ACTIVE = "active"
    ARCHIVED = "archived"
