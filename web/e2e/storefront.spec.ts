import { expect, test, type Page } from "@playwright/test";

const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ??
  process.env.E2E_BASE_URL ??
  "http://localhost:3000";
const vercelAutomationBypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

async function primeVercelProtectionBypass(page: Page) {
  if (!vercelAutomationBypassSecret || !baseURL.includes(".vercel.app")) {
    return;
  }

  const bypassUrl = new URL("/", baseURL);
  bypassUrl.searchParams.set("x-vercel-set-bypass-cookie", "true");

  await page.goto(bypassUrl.toString());
  await page.waitForURL((url) => url.origin === bypassUrl.origin && url.pathname === "/");
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
  });

  await primeVercelProtectionBypass(page);
});

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function openFirstProduct(page: Page) {
  await page.goto("/");
  await page.getByRole("link", { name: "Kollektion entdecken" }).click();
  await expect(page).toHaveURL(/\/kollektion$/);
  await expect(page.getByRole("heading", { level: 1, name: "Alle Prints" })).toBeVisible();

  const firstProductLink = page.locator('section[aria-label="Printkollektion"] a').first();
  await expect(firstProductLink).toBeVisible();

  const href = await firstProductLink.getAttribute("href");
  if (!href) {
    throw new Error("Expected a product link with an href.");
  }

  await firstProductLink.click();
  await expect(page).toHaveURL(new RegExp(`${escapeRegex(href)}$`));
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  return { href };
}

async function addCurrentProductToCart(page: Page) {
  const firstFormatOptions = page.getByRole("group").first().getByRole("button");
  const optionCount = await firstFormatOptions.count();
  const selectedButton = optionCount > 1 ? firstFormatOptions.nth(1) : firstFormatOptions.first();

  if (optionCount > 1) {
    await selectedButton.click();
    await expect(selectedButton).toHaveAttribute("aria-pressed", "true");
  } else {
    await expect(selectedButton).toHaveAttribute("aria-pressed", "true");
  }

  const selectedLabel = (await selectedButton.getAttribute("aria-label"))?.trim();
  const productTitle = (await page.getByRole("heading", { level: 1 }).textContent())?.trim();
  const [selectedVariant] = selectedLabel?.split(",") ?? [];

  if (!productTitle || !selectedVariant) {
    throw new Error("Expected the product detail page to expose a title and selected option.");
  }

  await page.getByRole("button", { name: /In den Warenkorb/i }).click();

  const cart = page.getByRole("dialog", { name: "Warenkorb" });
  const cartItem = cart.locator("li").first();
  await expect(cart).toBeVisible();
  await expect(cartItem.locator("p").first()).toHaveText(productTitle);
  await expect(cartItem.locator("p").nth(1)).toContainText(selectedVariant.split(" ")[0]);
  await expect(cartItem.locator("p").nth(1)).toContainText("Print");
  await expect(cartItem.locator("p").nth(2)).toContainText("€");

  return { cart, productTitle };
}

test("lets shoppers browse from the homepage into a product detail page", async ({ page }) => {
  await openFirstProduct(page);
  await expect(page.getByText("Kollektion 01", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /In den Warenkorb/i })).toBeEnabled();
});

test("adds a product to the cart and updates quantity deterministically", async ({ page }) => {
  await openFirstProduct(page);
  const { cart, productTitle } = await addCurrentProductToCart(page);

  await page
    .getByRole("button", { name: new RegExp(`${escapeRegex(productTitle)} Menge erhöhen`) })
    .click();
  await expect(page.getByLabel("Menge: 2")).toBeVisible();
  await expect(page.getByRole("button", { name: /Warenkorb öffnen/i })).toHaveAttribute(
    "aria-label",
    /2 Artikel/
  );
  await expect(cart.getByText("Gesamt", { exact: true })).toBeVisible();
});

test("starts checkout or keeps the shopper in-cart when Stripe is not configured", async ({
  page,
}) => {
  await page.route(/https:\/\/checkout\.stripe\.com\/.*/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<html><body><h1>Mock Stripe Checkout</h1></body></html>",
    });
  });

  await openFirstProduct(page);
  const { cart } = await addCurrentProductToCart(page);

  const checkoutResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/checkout") && response.request().method() === "POST"
  );

  await cart.getByRole("button", { name: "Zur Kasse" }).click();

  const checkoutResponse = await checkoutResponsePromise;

  if (checkoutResponse.ok()) {
    const body = (await checkoutResponse.json()) as { url?: string };
    expect(body.url).toMatch(/^https:\/\/checkout\.stripe\.com\//);
    await expect(page).toHaveURL(body.url!);
    await expect(page.getByRole("heading", { name: "Mock Stripe Checkout" })).toBeVisible();
    return;
  }

  const body = (await checkoutResponse.json()) as { error?: string };
  expect(body.error).toMatch(
    /Missing STRIPE_SECRET_KEY|Missing Stripe Price ID|Stripe session creation failed/i
  );
  await expect(cart).toBeVisible();
  await expect(page).toHaveURL(/\/prints\//);
});
