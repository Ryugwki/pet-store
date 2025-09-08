// App-wide constants

export const APP_NAME = "PetStore";
// Central API base URL (ensure it ends with /api to match backend prefix)
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://pet-store-e5kn.onrender.com/api";

export const ROLES = {
  ADMIN: "admin",
  CUSTOMER: "customer",
};

export const GENDERS = ["male", "female"] as const;
