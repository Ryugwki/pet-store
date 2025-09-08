// App-wide constants

export const APP_NAME = "PetStore";
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const ROLES = {
  ADMIN: "admin",
  CUSTOMER: "customer",
};

export const GENDERS = ["male", "female"] as const;
