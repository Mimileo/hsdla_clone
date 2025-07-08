/* eslint-disable @typescript-eslint/no-explicit-any */
import * as XLSX from "xlsx";
import { ICourse, IYearRecord } from "../../../types/transcript";

export interface EditableTranscript {
  student: {
    firstName: string;
    lastName: string;
    email?: string;
    _id?: string;
    roles?: string[];
    address?: string;
    dob?: string;
    parentGuardian?: string;
  };
  records: IYearRecord[];
  cumulativeGPA: number;
  cumulativeCredits: number;
  startDate?: string;
  graduationDate?: string;
  [key: string]: any;
}

interface IStudentCourse  extends ICourse {
  startDate: string;
  endDate: string;
  termYear: string;
}

function inferAcademicYear(date: string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth();
  return month >= 6 ? `${year}–${year + 1}` : `${year - 1}–${year}`;
}

function convertGrade(gradePercent: number): string {
  if (gradePercent >= 90) return "A";
  if (gradePercent >= 80) return "B";
  if (gradePercent >= 70) return "C";
  if (gradePercent >= 60) return "D";
  return "F";
}

function recalcRecord(record: IYearRecord): IYearRecord {
  const totalCredits = record.courses.reduce((sum, c) => sum + c.credits, 0);
  const totalPoints = record.courses.reduce((sum, c) => {
    const base = { A: 4, B: 3, C: 2, D: 1, F: 0 }[c.grade.toUpperCase()] ?? 0;
    const boost = c.type === "honors" ? 0.5 : c.type === "ap" ? 1.0 : 0;
    return sum + (base + boost) * c.credits;
  }, 0);
  return {
    ...record,
    totalCredits,
    gpa: totalCredits ? +(totalPoints / totalCredits).toFixed(2) : 0,
  };
}

export function parseTranscriptCSV(file: File): Promise<EditableTranscript[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);

        if (!Array.isArray(rows)) return reject("Invalid CSV format");

        const grouped: Record<string, IStudentCourse | Partial<IStudentCourse>[]> = {};

        for (const row of rows as any[]) {
          const courseName = row["Course Name"];
          const startDateStr = row["Start Date"];
          const endDateStr = row["Target Date"];
          const gradePercentStr = row["Actual Grade"] ?? "0";
          const studentName = row["Name"] ?? "";

          console.log({ courseName, startDateStr, endDateStr, gradePercentStr, studentName });

          if (!courseName || !startDateStr || !gradePercentStr) continue;

          const gradePercent = parseFloat(gradePercentStr.toString().replace("%", ""));
          const grade = convertGrade(gradePercent);

          const academicYear = inferAcademicYear(startDateStr);

          const course: Partial<IStudentCourse> = {
            name: courseName,
            startDate: new Date(startDateStr).toISOString(),
            endDate: new Date(endDateStr).toISOString(),
            credits: 0.5, // default
            grade,
            type: "normal",
          };

         if (!grouped[academicYear]) {
  grouped[academicYear] = [];
}

            if (Array.isArray(grouped[academicYear])) {
            grouped[academicYear].push(course);
            } else {
            // Handle the case where grouped[academicYear] is not an array
            // For example, you could throw an error or log a warning
            console.error('grouped[academicYear] is not an array');
            }
                    }

        const sortedYears = Object.keys(grouped).sort();

        const records: any[] = sortedYears.map((yearKey, idx) => {
          const [startYearStr, endYearStr] = yearKey.split("–").map(Number);
          const courses = grouped[yearKey];
          const record: any = {
            gradeLevel: 9 + idx,
            courses,
            startYear: startYearStr,
            endYear: endYearStr,
            totalCredits: 0,
            gpa: 0,
          };
          return recalcRecord(record);
        });

        const totalCredits = records.reduce((sum, r) => sum + r.totalCredits, 0);
        const totalPoints = records.reduce(
          (sum, r) => sum + r.totalCredits * r.gpa,
          0
        );
        const cumulativeGPA = totalCredits ? +(totalPoints / totalCredits).toFixed(2) : 0;

        const studentName = (rows[0] as any)["Name"] || "Student, Name";
        const [lastName, firstName] = studentName.split(",").map((s: string) => s.trim());

        const transcript: EditableTranscript = {
          student: {
            firstName: firstName || "First",
            lastName: lastName || "Last",
            roles: ["user"],
          },
          records,
          cumulativeCredits: totalCredits,
          cumulativeGPA,
        };

        resolve([transcript]);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => {
      reject("Failed to read file");
    };

    reader.readAsBinaryString(file);
  });
}
