import { beforeEach, describe, expect, it, vi } from "vitest";

const createClientMock = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock,
}));

function createCountQuery(result: { count: number | null; error: { message: string } | null }) {
  const query = {
    eq: vi.fn(() => query),
    neq: vi.fn(() => query),
    then: vi.fn((resolve) => Promise.resolve(result).then(resolve)),
  };

  return query;
}

async function loadServerModule(query: ReturnType<typeof createCountQuery>) {
  vi.resetModules();
  createClientMock.mockReturnValue({
    from: vi.fn(() => ({
      select: vi.fn(() => query),
    })),
  });

  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-key";

  return import("@/lib/supabase/server");
}

describe("collection capacity helpers", () => {
  beforeEach(() => {
    createClientMock.mockReset();
  });

  it("counts available prints in a collection", async () => {
    const query = createCountQuery({ count: 3, error: null });
    const { getCollectionPrintCount } = await loadServerModule(query);

    await expect(getCollectionPrintCount("kollektion-01")).resolves.toBe(3);
    expect(query.eq).toHaveBeenNthCalledWith(1, "collection", "kollektion-01");
    expect(query.eq).toHaveBeenNthCalledWith(2, "available", true);
    expect(query.neq).not.toHaveBeenCalled();
  });

  it("excludes the current print when counting capacity", async () => {
    const query = createCountQuery({ count: 3, error: null });
    const { getCollectionPrintCount } = await loadServerModule(query);

    await expect(
      getCollectionPrintCount("kollektion-01", {
        excludePrintId: "a1000001-0000-0000-0000-000000000001",
      })
    ).resolves.toBe(3);

    expect(query.neq).toHaveBeenCalledWith(
      "id",
      "a1000001-0000-0000-0000-000000000001"
    );
  });

  it("throws a German error when the collection is already full", async () => {
    const query = createCountQuery({ count: 4, error: null });
    const { assertCollectionCapacity } = await loadServerModule(query);

    await expect(assertCollectionCapacity("kollektion-01")).rejects.toThrow(
      "Diese Kollektion ist bereits voll. Maximal vier verfuegbare Drucke sind erlaubt."
    );
  });

  it("passes when fewer than four prints are available", async () => {
    const query = createCountQuery({ count: 2, error: null });
    const { assertCollectionCapacity } = await loadServerModule(query);

    await expect(assertCollectionCapacity("kollektion-01")).resolves.toBeUndefined();
  });

  it("surfaces Supabase count errors", async () => {
    const query = createCountQuery({
      count: null,
      error: { message: "boom" },
    });
    const { getCollectionPrintCount } = await loadServerModule(query);

    await expect(getCollectionPrintCount("kollektion-01")).rejects.toThrow(
      'Failed to count prints for collection "kollektion-01": boom'
    );
  });
});
