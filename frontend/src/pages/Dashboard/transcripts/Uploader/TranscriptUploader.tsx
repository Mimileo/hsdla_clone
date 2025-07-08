import { Upload, UploadIcon } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

interface CourseEdit {
  name: string;
  grade: string;
  credits: number;
  type: "normal" | "honors" | "ap";
  gradeLevel: number;
  startDate: string;
  endDate: string;
  termYear: string;
}

interface TranscriptRecord {
  gradeLevel: number;
  courses: CourseEdit[];
  gpa: number;
  totalCredits: number;
  startYear: number;
  endYear: number;
}

interface TranscriptDraft {
  student: { firstName: string; lastName: string; email: string };
  records: TranscriptRecord[];
  cumulativeGPA: number;
  cumulativeCredits: number;
}

function formatDate(raw: string | number): string {
  if (!raw) return "";
  if (typeof raw === "number") {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const parsedDate = new Date(excelEpoch.getTime() + raw * 86400000);
    return parsedDate.toISOString().slice(0, 10);
  }
  const parsed = new Date(raw);
  return isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
}

function percentageToLetterGrade(percent: number): string {
  if (percent >= 90) return "A";
  if (percent >= 80) return "B";
  if (percent >= 70) return "C";
  if (percent >= 60) return "D";
  return "F";
}

function inferAcademicYear(date: string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth();
  return month >= 6 ? `${year}–${year + 1}` : `${year - 1}–${year}`;
}

export default function TranscriptUploader() {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setLoading(true);
    setFile(selectedFile);

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = evt.target?.result as ArrayBuffer;
        const workbook = XLSX.read(data, { type: "array" });

        const firstSheetName = workbook.SheetNames[0];
        const firstSheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json(firstSheet, {
          defval: "",
        }) as Record<string, string>[];

        const cleaned = rows
          .map((row) => {
            if (!row["Name"] || !row["Start Date"] || !row["Actual Grade"]) return null;

            const actualGradeRaw = row["Actual Grade"].toString();
            const actualGradeClean = actualGradeRaw.replace(/[^\d.]/g, "");
            let numericGrade = parseFloat(actualGradeClean);
            if (numericGrade > 0 && numericGrade <= 1) numericGrade *= 100;

            let letterGrade = "F";
            if (!isNaN(numericGrade) && numericGrade <= 100) {
              letterGrade = percentageToLetterGrade(numericGrade);
            } else {
              const backupGrade =
                (row["Overall Grade"] ?? row["Relative Grade"])?.toString().trim().toUpperCase();
              if (["A", "B", "C", "D", "F"].includes(backupGrade)) {
                letterGrade = backupGrade;
              }
            }

            return {
              studentName: row["Name"],
              courseName: row["Course Name"],
              letterGrade,
              startDate: formatDate(row["Start Date"]),
              endDate: formatDate(row["End Date"]),
            };
          })
          .filter((row) => row?.studentName && row.courseName);

        const groupedByStudent: Record<string, CourseEdit[]> = {};

        cleaned.forEach((row) => {
          const course: CourseEdit = {
            name: row!.courseName,
            grade: row!.letterGrade,
            credits: 0.5,
            type: "normal",
            gradeLevel: 0,
            startDate: row!.startDate,
            endDate: row!.endDate,
            termYear: inferAcademicYear(row!.startDate),
          };
          const key = row!.studentName;
          if (!groupedByStudent[key]) groupedByStudent[key] = [];
          groupedByStudent[key].push(course);
        });

        const transcriptDrafts: TranscriptDraft[] = Object.entries(groupedByStudent).map(
          ([fullName, courses]) => {
            const parts = fullName.split(",").map((s) => s.trim());
            const lastName = parts[0] || "Unknown";
            const firstName = parts[1] || "Student";
            const email = parts[2] || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;

            // Group by termYear and sort
            const byYear: Record<string, CourseEdit[]> = {};
            courses.forEach((c) => {
              if (!byYear[c.termYear]) byYear[c.termYear] = [];
              byYear[c.termYear].push(c);
            });

            const sortedYears = Object.keys(byYear).sort((a, b) => {
              const aStart = parseInt(a.split("–")[0]);
              const bStart = parseInt(b.split("–")[0]);
              return aStart - bStart;
            });

            const records: TranscriptRecord[] = sortedYears.map((yearStr, index) => {
              const gradeLevel = 9 + index;
              const courseList = byYear[yearStr];
              courseList.forEach((c) => (c.gradeLevel = gradeLevel));

              const totalCredits = courseList.reduce((sum, c) => sum + c.credits, 0);
              const totalPoints = courseList.reduce((sum, c) => {
                const base = { A: 4, B: 3, C: 2, D: 1, F: 0 }[c.grade] ?? 0;
                const boost = c.type === "honors" ? 0.5 : c.type === "ap" ? 1.0 : 0;
                return sum + (base + boost) * c.credits;
              }, 0);
              const gpa = totalCredits ? +(totalPoints / totalCredits).toFixed(2) : 0;
              const [startYear, endYear] = yearStr.split("–").map(Number);

              return {
                gradeLevel,
                courses: courseList,
                gpa,
                totalCredits,
                startYear,
                endYear,
              };
            });

            const cumulativeCredits = records.reduce((sum, r) => sum + r.totalCredits, 0);
            const cumulativePoints = records.reduce((sum, r) => sum + r.gpa * r.totalCredits, 0);
            const cumulativeGPA = cumulativeCredits ? +(cumulativePoints / cumulativeCredits).toFixed(2) : 0;

            return {
              student: { firstName, lastName, email },
              records,
              cumulativeGPA,
              cumulativeCredits,
            };
          }
        );

        setLoading(false);
        navigate("/dashboard/transcripts/preview", { state: { transcriptDrafts } });
      } catch (error) {
        console.error("Error parsing uploaded file:", error);
        alert("There was an error reading the file. Please make sure it’s a valid Excel or CSV file.");
        setLoading(false);
      }
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full">
      <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">Upload Enrollment File</h2>


        {/* File Input  Box*/}
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition-all duration-300">
            <UploadIcon className="w-10 h-10 text-blue-500" />
             <input
                aria-label="Upload Enrollments"
                type="file"
                accept=".csv, .xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileUpload}
                className="mb-3 p-2 border rounded w-full"
            />

             <label aria-label="file-upload" className="text-gray-600 cursor-pointer text-center hover:text-blue-600 transition-all duration-300">
                <span className="block text-xl font-medium">Drag & Drop your file here</span>
                <span className="block text-sm text-gray-400">Or click to browse</span>
            </label>
            <div id="file-name" className="mt-3 text-gray-700 text-sm font-medium hidden">No file selected</div>

        </div>
     

      {file && (
        <p className="text-sm text-gray-600 mb-2">Selected file: {file.name}</p>
      )}

      {loading && (
        <div className="w-full bg-gray-200 h-2 rounded overflow-hidden mb-4">
          <div className="bg-blue-500 h-2 animate-pulse w-full"></div>
        </div>
      )}

      <p className="text-sm text-gray-500">
        Accepted: <code>.csv</code>, <code>.xlsx</code>. Must include columns:
        <br />
        <code>Name</code>, <code>Course Name</code>, <code>Actual Grade</code>,{" "}
        <code>Start Date</code>, <code>End Date</code>.
      </p>
    </div>
  );
}
