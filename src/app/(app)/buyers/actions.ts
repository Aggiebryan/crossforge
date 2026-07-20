"use server";

import { revalidatePath } from "next/cache";
import { createBuyer, type CreateBuyerInput } from "@/lib/data/buyers";

export interface ActionResult {
  ok: boolean;
  id?: string;
  error?: string;
}

export async function createBuyerAction(input: CreateBuyerInput): Promise<ActionResult> {
  try {
    const { id } = await createBuyer(input);
    revalidatePath("/buyers");
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to create buyer." };
  }
}
