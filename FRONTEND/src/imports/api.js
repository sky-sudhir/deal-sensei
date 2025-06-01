// Auth endpoints
export const USERS_REGISTER_REQUEST_OTP = "api/auth/register/request-otp";
export const USERS_REGISTER = "api/auth/register";
export const AUTH_VERIFY = "api/auth/verify";
export const USERS_LOGIN = "api/v1/auth/login";
export const USERS_SIGNUP = "api/v1/companies/signup";
export const USERS_VERIFY_EMAIL = "api/v1/auth/verify-email";
export const USER_FORGOT_PASSWORD_REQUEST_OTP =
  "api/users/forgot-password/request-otp";
export const USER_FORGOT_PASSWORD_RESET = "api/auth/forgot-password/reset";
export const API_USER_ME = "api/users/me";
export const USERS_PROFILE = "api/users/profile";

// User management endpoints
export const API_USERS_LIST = "api/v1/users";
export const API_USER_CREATE = "api/v1/users";
export const API_USER_DETAILS = "api/v1/users/";
export const API_USER_UPDATE = "api/v1/users/";
export const API_USER_DELETE = "api/v1/users/";
export const API_USER_STATUS = "api/v1/users/{id}/status";
export const API_USER_DEACTIVATE = "api/v1/users/{id}/deactivate";
export const API_USER_ACTIVATE = "api/v1/users/{id}/activate";

// Pipeline management endpoints
export const API_PIPELINES_LIST = "api/v1/pipelines";
export const API_PIPELINE_CREATE = "api/v1/pipelines";
export const API_PIPELINE_DETAILS = "api/v1/pipelines/";
export const API_PIPELINE_UPDATE = "api/v1/pipelines/";
export const API_PIPELINE_DELETE = "api/v1/pipelines/";
export const API_PIPELINE_SET_DEFAULT = "api/v1/pipelines/{id}/set-default";

// Store management endpoints
export const STORES_LIST = "api/stores";
export const STORE_CREATE = "api/stores";
export const STORE_DETAILS = "api/stores/";
export const STORE_UPDATE = "api/stores/";
export const STORE_DELETE = "api/stores/";
export const STORE_ASSIGN_ADMIN = "api/stores/{id}/admin";

// Product management endpoints
export const PRODUCTS_LIST = "api/products";
export const PRODUCT_CREATE = "api/products";
export const PRODUCT_DETAILS = "api/products/";
export const PRODUCT_UPDATE = "api/products/";
export const PRODUCT_DELETE = "api/products/";
export const PRODUCTS_BY_STORE = "api/products/store/";

// Product variant endpoints
export const PRODUCT_VARIANTS = "api/products/{productId}/variants";
export const VARIANT_DETAILS = "api/products/variants/";
export const VARIANT_UPDATE = "api/products/variants/";
export const VARIANT_DELETE = "api/products/variants/";
export const VARIANT_STOCK_UPDATE = "api/products/variants/{variantId}/stock";
export const LOW_STOCK_ITEMS = "api/products/store/low-stock";
export const STORE_VARIANTS = "api/products/store/variants";

// Order management endpoints
export const ORDERS_LIST = "api/orders";
export const ORDER_CREATE = "api/orders";
export const ORDER_DETAILS = "api/orders/";
export const ORDERS_BY_STORE = "api/orders/store";
export const ORDER_STATUS_UPDATE = "api/orders/{id}/status";
export const ORDER_CANCEL = "api/orders/{id}/cancel";
export const SALES_REPORT = "api/orders/reports/sales";

// Contact management endpoints
export const API_CONTACTS_LIST = "api/v1/contacts";
export const API_CONTACT_CREATE = "api/v1/contacts";
export const API_CONTACT_DETAILS = "api/v1/contacts/";
export const API_CONTACT_UPDATE = "api/v1/contacts/";
export const API_CONTACT_DELETE = "api/v1/contacts/";

// Deal management endpoints
export const API_DEALS_LIST = "api/v1/deals";
export const API_DEAL_CREATE = "api/v1/deals";
export const API_DEAL_DETAILS = "api/v1/deals/";
export const API_DEAL_UPDATE = "api/v1/deals/";
export const API_DEAL_DELETE = "api/v1/deals/";
export const API_DEAL_TRANSFER = "api/v1/deals/{id}/transfer";

// Activity management endpoints
export const API_ACTIVITIES_LIST = "api/v1/activities";
export const API_ACTIVITY_CREATE = "api/v1/activities";
export const API_ACTIVITY_DETAILS = "api/v1/activities/";
export const API_ACTIVITY_UPDATE = "api/v1/activities/";
export const API_ACTIVITY_DELETE = "api/v1/activities/";
export const API_ACTIVITIES_BY_DEAL = "api/v1/activities/deal/";
export const API_ACTIVITIES_BY_CONTACT = "api/v1/activities/contact/";

// File management endpoints
export const API_FILES_LIST = "api/v1/files";
export const API_FILES_UPLOAD = "api/v1/files/upload";
export const API_FILE_DETAILS = "api/v1/files/";
export const API_FILE_DELETE = "api/v1/files/";
export const API_FILES_BY_ENTITY = "api/v1/files/entity/";

// Legacy endpoints (can be removed if not needed)
export const CASE_STUDY = "case-studies";
export const CASE_STUDIES_ME = "case-studies";
export const PUBLIC_PORTFOLIO = "public";
export const OAUTH_GOOGLE_AUTHORIZE = "oauth2/google/authorize";
