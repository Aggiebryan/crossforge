"use server";

import { revalidatePath } from "next/cache";
import {
  createLead,
  createLeadSource,
  updateLeadStage,
  type CreateLeadInput,
} from "@/lib/data/leads";
import type { LeadStage } from "@/domain/constants";

export interface ActionResult {
  ok: boolean;
  id?: string;
  error?: string;
}

export async function createLeadAction(
  input: CreateLeadInput,
  quick: boolean,
): Promise<ActionResult> {
  try {
    const { id } = await createLead(input, quick);
    revalidatePath("/pipeline");
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to create lead." };
  }
}

export async function createLeadSourceAction(
  name: string,
  channel: string,
): Promise<ActionResult> {
  try {
    const { id } = await createLeadSource(name, channel);
    revalidatePath("/pipeline");
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to create source." };
  }
}

export async function updateStageAction(id: string, stage: LeadStage): Promise<ActionResult> {
  try {
    await updateLeadStage(id, stage);
    revalidatePath(`/pipeline/${id}`);
    revalidatePath("/pipeline");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to update stage." };
  }
}
