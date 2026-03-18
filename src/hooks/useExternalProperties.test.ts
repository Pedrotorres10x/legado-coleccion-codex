import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { submitLeadToCRM } from "@/hooks/useExternalProperties";

const validPropertyId = "123e4567-e89b-42d3-a456-426614174000";

describe("submitLeadToCRM", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    global.fetch = originalFetch;
  });

  it("syncs general leads when property_id is missing", async () => {
    vi.mocked(global.fetch).mockResolvedValue(
      new Response(JSON.stringify({ ok: true, lead_id: "crm-general-1" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const result = await submitLeadToCRM({
      full_name: "Pedro",
      email: "pedro@example.com",
      property_id: null,
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result.ok).toBe(true);
    expect(result.synced).toBe(true);
  });

  it("skips CRM sync when property_id is not a UUID", async () => {
    const result = await submitLeadToCRM({
      full_name: "Pedro",
      email: "pedro@example.com",
      property_id: "general",
    });

    expect(result).toEqual({
      ok: true,
      synced: false,
      skipped: true,
      reason: "invalid_property_id",
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("syncs valid property leads to the CRM", async () => {
    vi.mocked(global.fetch).mockResolvedValue(
      new Response(JSON.stringify({ ok: true, lead_id: "crm-1" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const result = await submitLeadToCRM({
      full_name: "Pedro",
      email: "pedro@example.com",
      property_id: validPropertyId,
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result.ok).toBe(true);
    expect(result.synced).toBe(true);
  });
});
