
import * as XLSX from "xlsx";

const REQUIRED_COLUMNS = [
  "rollNumber",
  "classesAttended",
  "classesConducted",
  "dataAsOf",
];

function normalizeDate(rawDate) {
  if (rawDate instanceof Date && !Number.isNaN(rawDate.getTime())) {
    return rawDate.toISOString().slice(0, 10);
  }

  const dateText = String(rawDate ?? "").trim();

  // Accept a correctly formatted YYYY-MM-DD date.
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
    const parsed = new Date(`${dateText}T00:00:00Z`);

    if (
      !Number.isNaN(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === dateText
    ) {
      return dateText;
    }

    return "";
  }

  // Handle other date formats returned by spreadsheet parsers.
  const parsed = new Date(dateText);

  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return "";
}

export async function parseAttendanceFile(file) {
  if (!file) {
    throw new Error("Please select an attendance file.");
  }

  if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
    throw new Error("Upload an Excel or CSV file.");
  }

  const buffer = await file.arrayBuffer();

  const workbook = XLSX.read(buffer, {
    type: "array",
    cellDates: true,
  });

  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];

  if (!sheet) {
    throw new Error("No worksheet found.");
  }

  const rows = XLSX.utils.sheet_to_json(sheet, {
    defval: "",
    raw: false,
  });

  if (!rows.length) {
    throw new Error("The worksheet is empty.");
  }

  const headers = Object.keys(rows[0]).map((header) =>
    header.trim()
  );

  const missing = REQUIRED_COLUMNS.filter(
    (column) => !headers.includes(column)
  );

  if (missing.length) {
    throw new Error(
      `Missing columns: ${missing.join(", ")}`
    );
  }

  const seen = new Set();

  const results = rows.map((row, index) => {
    const rollNumber = String(row.rollNumber ?? "").trim();
    const attendedText = String(row.classesAttended ?? "").trim();
    const conductedText = String(row.classesConducted ?? "").trim();

    const attended = Number(attendedText);
    const conducted = Number(conductedText);
    const date = normalizeDate(row.dataAsOf);

    const errors = [];

    if (!rollNumber) {
      errors.push("Missing roll number");
    }

    if (
      attendedText === "" ||
      !Number.isInteger(attended) ||
      attended < 0
    ) {
      errors.push("Invalid classes attended");
    }

    if (
      conductedText === "" ||
      !Number.isInteger(conducted) ||
      conducted <= 0
    ) {
      errors.push("Invalid classes conducted");
    }

    if (
      Number.isInteger(attended) &&
      Number.isInteger(conducted) &&
      attended >= 0 &&
      conducted > 0 &&
      attended > conducted
    ) {
      errors.push("Attended cannot exceed conducted");
    }

    if (!date) {
      errors.push("Invalid date; use YYYY-MM-DD");
    }

    if (rollNumber && seen.has(rollNumber)) {
      errors.push("Duplicate roll number");
    }

    if (rollNumber) {
      seen.add(rollNumber);
    }

    return {
      rowNumber: index + 2,
      rollNumber,
      classesAttended: attended,
      classesConducted: conducted,
      dataAsOf: date,
      valid: errors.length === 0,
      errors,
    };
  });

  return {
    totalRows: results.length,
    validRows: results.filter((row) => row.valid),
    invalidRows: results.filter((row) => !row.valid),
  };
}
