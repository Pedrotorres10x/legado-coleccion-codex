import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";
import { submitLeadToCRM, type CrmLeadSyncInput, type CrmLeadSyncResult } from "@/hooks/useExternalProperties";
import { getIntentSummaryPayload } from "@/lib/personalization";

export async function createLocalLead(lead: TablesInsert<"leads">) {
  const { data, error } = await supabase
    .from("leads")
    .insert({
      ...lead,
      metadata: lead.metadata ?? getIntentSummaryPayload(),
      synced_to_crm: lead.synced_to_crm ?? false,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data;
}

export async function syncLeadStatusToCRM(
  localLeadId: string | undefined,
  lead: CrmLeadSyncInput,
): Promise<CrmLeadSyncResult> {
  const crmResult = await submitLeadToCRM({
    ...lead,
    metadata: lead.metadata ?? getIntentSummaryPayload(),
  });

  if (crmResult.synced && localLeadId) {
    await supabase.from("leads").update({ synced_to_crm: true }).eq("id", localLeadId);
  }

  return crmResult;
}
