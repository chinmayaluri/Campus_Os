export function calculateAttendance(record, threshold = 75) {
  const attended = Number(record.classesAttended);
  const conducted = Number(record.classesConducted);

  if (
    record.classesAttended === "" ||
    record.classesConducted === "" ||
    !Number.isInteger(attended) ||
    !Number.isInteger(conducted) ||
    attended < 0 ||
    conducted <= 0 ||
    attended > conducted
  ) {
    return {
      valid: false,
      attendancePercentage: null,
      eligible: false,
      message: "Invalid attendance counts",
    };
  }

  const percentage = (attended / conducted) * 100;
  const eligible = percentage >= threshold;

  return {
    valid: true,
    attendancePercentage: Number(percentage.toFixed(2)),
    eligible,
    message: eligible
      ? "Meets attendance threshold"
      : "Below attendance threshold",
  };
}
