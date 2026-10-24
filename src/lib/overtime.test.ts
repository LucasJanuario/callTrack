import { describe, it, expect } from "vitest";
import { calcOvertime, monthDays } from "./overtime";

describe("calcOvertime (holerite 08/2026)", () => {
  const r = calcOvertime(2663.34, 12.12, 4.67, "2026-08");
  it("agosto/2026 tem 26 dias úteis e 5 domingos", () => {
    expect(monthDays("2026-08")).toEqual({ workDays: 26, restDays: 5 });
  });
  it("horas 100% = 293,45", () => expect(r.v100).toBe(293.45));
  it("horas 70% = 96,11", () => expect(r.v70).toBe(96.11));
  it("repouso s/ horas extras = 74,92 (6,19h)", () => {
    expect(r.dsr).toBe(74.92);
    expect(r.dsrHours).toBe(6.19);
  });
  it("total = 464,48", () => expect(r.total).toBe(464.48));
});
