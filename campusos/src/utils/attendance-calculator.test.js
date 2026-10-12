
import { describe, it, expect } from "vitest";
import { calculateAttendance } from "./attendance-calculator.js";

describe("calculateAttendance", () => {
  it("calculates 75% attendance correctly", () => {
    const result = calculateAttendance({
      classesAttended: 45,
      classesConducted: 60,
    });

    expect(result.valid).toBe(true);
    expect(result.attendancePercentage).toBe(75);
    expect(result.eligible).toBe(true);
  });

  it("marks attendance below 75% as ineligible", () => {
    const result = calculateAttendance({
      classesAttended: 30,
      classesConducted: 60,
    });

    expect(result.attendancePercentage).toBe(50);
    expect(result.eligible).toBe(false);
  });

  it("rejects attended classes greater than conducted classes", () => {
    const result = calculateAttendance({
      classesAttended: 70,
      classesConducted: 60,
    });

    expect(result.valid).toBe(false);
  });

  it("rejects zero conducted classes", () => {
    const result = calculateAttendance({
      classesAttended: 0,
      classesConducted: 0,
    });

    expect(result.valid).toBe(false);
  });

  it("supports a custom attendance threshold", () => {
    const result = calculateAttendance(
      { classesAttended: 40, classesConducted: 50 },
      85
    );

    expect(result.attendancePercentage).toBe(80);
    expect(result.eligible).toBe(false);
  });
});

