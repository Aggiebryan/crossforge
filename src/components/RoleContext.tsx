"use client";

import { createContext, useContext } from "react";
import {
  ROLES_CAN_DELETE,
  ROLES_WITH_FINANCIALS,
  ROLES_WITH_PRICING,
  type Role,
} from "@/domain/constants";

export type { Role };

export const RoleContext = createContext<{ role: Role; setRole: (r: Role) => void }>({
  role: "owner_operator",
  setRole: () => {},
});

export function useRole() {
  return useContext(RoleContext);
}

export function useCan() {
  const { role } = useRole();
  return {
    role,
    pricing: ROLES_WITH_PRICING.includes(role),
    financials: ROLES_WITH_FINANCIALS.includes(role),
    delete: ROLES_CAN_DELETE.includes(role),
    isVA: role === "virtual_assistant",
  };
}
