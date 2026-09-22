import { describe, it, expect } from "vitest";
import request from "supertest"

import app from "../src/app.js";

describe("Order API", () => {
  it("GET / should return API status", async () => {
    const response = await request(app)
      .get("/");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      message: "Order API is running",
    });
  });

  it("GET unknown route should return 404", async () => {
    const response = await request(app)
      .get("/api/does-not-exist");

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      message: "Route GET /api/does-not-exist not found",
    });
  });
});