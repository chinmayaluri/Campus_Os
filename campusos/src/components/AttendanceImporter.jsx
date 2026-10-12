import { useState } from "react";
import { parseAttendanceFile } from "../services/attendance-import.js";
import { calculateAttendance } from "../utils/attendance-calculator.js";

export default function AttendanceImporter() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePreview() {
    if (!file) {
      setError("Please select an attendance file.");
      return;
    }

    setError("");
    setPreview(null);
    setLoading(true);

    try {
      const result = await parseAttendanceFile(file);
      setPreview(result);
    } catch (err) {
      setError(err.message || "Unable to read file.");
    } finally {
      setLoading(false);
    }
  }

  function handleExport() {
    if (!preview || preview.validRows.length === 0) {
      setError("No valid attendance records available to export.");
      return;
    }

    const headers = [
      "Roll Number",
      "Classes Attended",
      "Classes Conducted",
      "Attendance Percentage",
      "Eligibility Status",
      "Data As Of",
    ];

    const rows = preview.validRows.map((record) => {
      const attendance = calculateAttendance(record, 75);

      return [
        record.rollNumber,
        record.classesAttended,
        record.classesConducted,
        attendance.attendancePercentage,
        attendance.eligible ? "Eligible" : "Below threshold",
        record.dataAsOf,
      ];
    });

    const escapeCsv = (value) => {
      const text = String(value ?? "");
      return `"${text.replace(/"/g, '""')}"`;
    };

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "campusos-attendance-report.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
    setError("");
  }

  return (
    <section className="attendance-importer">
      <h2>Attendance Import</h2>

      <p>
        Upload an Excel or CSV attendance sheet to validate
        records and calculate attendance percentages.
      </p>

      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={(event) => {
          setFile(event.target.files?.[0] ?? null);
          setPreview(null);
          setError("");
        }}
      />

      <button
        type="button"
        onClick={handlePreview}
        disabled={!file || loading}
      >
        {loading ? "Validating..." : "Preview and Validate"}
      </button>

      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}

      {preview && (
        <div className="validation-results">
          <h3>Validation Results</h3>

          <p>Total rows: {preview.totalRows}</p>
          <p>Valid rows: {preview.validRows.length}</p>
          <p>Invalid rows: {preview.invalidRows.length}</p>

          {preview.invalidRows.length > 0 && (
            <div>
              <h4>Records Requiring Correction</h4>

              <ul>
                {preview.invalidRows.map((row) => (
                  <li key={row.rowNumber}>
                    Row {row.rowNumber} —{" "}
                    {row.rollNumber || "Unknown"}:{" "}
                    {row.errors.join(", ")}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {preview.validRows.length > 0 && (
            <section className="attendance-summary">
              <h3>Attendance Summary</h3>

              <p>
                Attendance threshold: <strong>75%</strong>
              </p>

              <button
                type="button"
                onClick={handleExport}
                disabled={preview.validRows.length === 0}
              >
                Download Attendance Report (CSV)
              </button>

              <div className="attendance-table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Roll Number</th>
                      <th>Attended</th>
                      <th>Conducted</th>
                      <th>Attendance %</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {preview.validRows.map((record) => {
                      const attendance = calculateAttendance(
                        record,
                        75
                      );

                      return (
                        <tr key={record.rollNumber}>
                          <td>{record.rollNumber}</td>
                          <td>{record.classesAttended}</td>
                          <td>{record.classesConducted}</td>

                          <td>
                            {attendance.valid
                              ? `${attendance.attendancePercentage}%`
                              : "Invalid"}
                          </td>

                          <td>
                            <span
                              className={
                                attendance.eligible
                                  ? "attendance-eligible"
                                  : "attendance-below-threshold"
                              }
                            >
                              {attendance.valid
                                ? attendance.eligible
                                  ? "Eligible"
                                  : "Below threshold"
                                : "Invalid"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <p className="import-notice">
                Validation complete. No records saved yet.
              </p>
            </section>
          )}
        </div>
      )}
    </section>
  );
}
