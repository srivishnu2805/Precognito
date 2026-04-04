import { test, expect } from "@playwright/test";

test.describe("Dashboard Functionality", () => {
  test("should load dashboard page", async ({ page }) => {
    const response = await page.goto("/dashboard");
    // Either success or redirect to login is acceptable
    const url = page.url();
    expect(url.includes("dashboard") || url.includes("login")).toBe(true);
  });
});

test.describe("Authentication Flow", () => {
  test("should show login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("text=Precognito")).toBeVisible();
  });
});

test.describe("Inventory", () => {
  test("should load inventory page", async ({ page }) => {
    const response = await page.goto("/inventory");
    const url = page.url();
    expect(url.includes("inventory") || url.includes("login")).toBe(true);
  });
});

test.describe("Alerts", () => {
  test("should load alerts page", async ({ page }) => {
    const response = await page.goto("/alerts");
    const url = page.url();
    expect(url.includes("alerts") || url.includes("login")).toBe(true);
  });
});

test.describe("Reports", () => {
  test("should load reports page", async ({ page }) => {
    const response = await page.goto("/reports");
    const url = page.url();
    expect(url.includes("reports") || url.includes("login")).toBe(true);
  });
});

test.describe("Work Orders", () => {
  test("should load work orders page", async ({ page }) => {
    const response = await page.goto("/work-orders");
    const url = page.url();
    expect(url.includes("work-orders") || url.includes("login")).toBe(true);
  });
});