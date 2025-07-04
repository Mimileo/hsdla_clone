import React, { useState } from "react";
import Papa from "papaparse";
import { detectGradeLevel } from "../../../../utils/detectGradeLevel";
import { useNavigate } from "react-router-dom";

interface CourseEdit {
  name: string;
  grade: string;
  credits: number;
  type: "normal" | "honors" | "ap";
  gradeLevel: number;
  startDate: string;
  endDate: string;
}

interface TranscriptRecord {
  gradeLevel: number;
  courses: CourseEdit[];
  gpa: number;
  totalCredits: number;
}

interface TranscriptDraft {
  student: { firstName: string; lastName: string; email: string };
  records: TranscriptRecord[];
  cumulativeGPA: number;
  cumulativeCredits: number;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export default function TranscriptUploader() {
  const [grouped, setGrouped] = useState<Record<string, CourseEdit[]>>({});
  const [transcriptDrafts, setTranscriptDrafts] = useState<TranscriptDraft[] | null>(null);
  const navigate = useNavigate();

 const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const cleaned = results.data
          .map((row: any) => ({
            studentName: row["Name"],
            courseName: row["Course Name"],
            letterGrade: row["Letter Grade"],
            startDate: formatDate(row["Start Date"]),
            endDate: formatDate(row["Target Date"]),
          }))
          .filter((row) => row.studentName && row.courseName);

        const groupedByStudent: Record<string, CourseEdit[]> = {};
        cleaned.forEach((row) => {
          const course: CourseEdit = {
            name: row.courseName,
            grade: row.letterGrade,
            credits: 0.5,
            type: "normal",
            gradeLevel: detectGradeLevel(row.courseName, row.startDate),
            startDate: row.startDate,
            endDate: row.endDate,
          };

          if (!groupedByStudent[row.studentName]) groupedByStudent[row.studentName] = [];
          groupedByStudent[row.studentName].push(course);
        });

        // Build transcript drafts
        const drafts = Object.entries(groupedByStudent).map(([fullName, courses]) => {
          const [lastName, firstName] = fullName.split(",").map((s) => s.trim());
          const email = `${firstName}.${lastName}`.toLowerCase() + "@example.com";

          const recordsMap: Record<number, CourseEdit[]> = {};
          courses.forEach((c) => {
            if (!recordsMap[c.gradeLevel]) recordsMap[c.gradeLevel] = [];
            recordsMap[c.gradeLevel].push(c);
          });

          const records = Object.entries(recordsMap).map(([gradeStr, courseList]) => {
            const gradeLevel = parseInt(gradeStr);
            const totalCredits = courseList.reduce((sum, c) => sum + c.credits, 0);
            const totalPoints = courseList.reduce((sum, c) => {
              const base = { A: 4, B: 3, C: 2, D: 1, F: 0 }[c.grade.toUpperCase()] ?? 0;
              const boost = c.type === "honors" ? 0.5 : c.type === "ap" ? 1.0 : 0;
              return sum + (base + boost) * c.credits;
            }, 0);
            const gpa = totalCredits ? +(totalPoints / totalCredits).toFixed(2) : 0;

            return {
              gradeLevel,
              courses: courseList,
              gpa,
              totalCredits,
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
        });

        // Redirect to preview page with drafts as state
        navigate("/dashboard/transcripts/preview", { state: { transcriptDrafts: drafts } });
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
      }
    });
  };

  const handleCourseChange = (student: string, index: number, key: keyof CourseEdit, value: any) => {
    setGrouped((prev) => {
      const updated = { ...prev };
      updated[student][index] = {
        ...updated[student][index],
        [key]: key === "credits" || key === "gradeLevel" ? parseFloat(value) : value,
      };
      return updated;
    });
  };

  const generateTranscriptDrafts = () => {
    const drafts: TranscriptDraft[] = Object.entries(grouped).map(([fullName, courses]) => {
      // Split name "Lastname, Firstname"
      const [lastName, firstName] = fullName.split(",").map((s) => s.trim());
      const email = `${firstName}.${lastName}`.toLowerCase() + "@example.com";

      const recordsMap: Record<number, CourseEdit[]> = {};
      courses.forEach((c) => {
        if (!recordsMap[c.gradeLevel]) recordsMap[c.gradeLevel] = [];
        recordsMap[c.gradeLevel].push(c);
      });

      const records = Object.entries(recordsMap).map(([gradeStr, courseList]) => {
        const gradeLevel = parseInt(gradeStr);
        const totalCredits = courseList.reduce((sum, c) => sum + c.credits, 0);
        const totalPoints = courseList.reduce((sum, c) => {
          const base = { A: 4, B: 3, C: 2, D: 1, F: 0 }[c.grade.toUpperCase()] ?? 0;
          const boost = c.type === "honors" ? 0.5 : c.type === "ap" ? 1.0 : 0;
          return sum + (base + boost) * c.credits;
        }, 0);
        const gpa = totalCredits ? +(totalPoints / totalCredits).toFixed(2) : 0;

        return {
          gradeLevel,
          courses: courseList,
          gpa,
          totalCredits,
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
    });

    setTranscriptDrafts(drafts);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Upload Enrollments CSV</h2>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      <hr className="my-4" />

      {Object.entries(grouped).map(([student, courses]) => (
        <div key={student} className="mb-8 border p-4 rounded">
          <h3 className="text-lg font-bold mb-4">{student}</h3>
          <table className="w-full table-auto text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">Course</th>
                <th className="border px-2 py-1">Grade</th>
                <th className="border px-2 py-1">Credits</th>
                <th className="border px-2 py-1">Type</th>
                <th className="border px-2 py-1">Grade Level</th>
                <th className="border px-2 py-1">Start</th>
                <th className="border px-2 py-1">End</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">
                    <input
                      className="w-full"
                      value={course.name}
                      onChange={(e) => handleCourseChange(student, i, "name", e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      className="w-full"
                      value={course.grade}
                      onChange={(e) => handleCourseChange(student, i, "grade", e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      step="0.5"
                      className="w-20"
                      value={course.credits}
                      onChange={(e) => handleCourseChange(student, i, "credits", e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <select
                      className="w-full"
                      value={course.type}
                      onChange={(e) => handleCourseChange(student, i, "type", e.target.value)}
                    >
                      <option value="normal">Normal</option>
                      <option value="honors">Honors</option>
                      <option value="ap">AP</option>
                    </select>
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      className="w-16"
                      value={course.gradeLevel}
                      onChange={(e) => handleCourseChange(student, i, "gradeLevel", e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="date"
                      className="w-full"
                      value={course.startDate}
                      onChange={(e) => handleCourseChange(student, i, "startDate", e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="date"
                      className="w-full"
                      value={course.endDate}
                      onChange={(e) => handleCourseChange(student, i, "endDate", e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {Object.keys(grouped).length > 0 && (
        <button
          onClick={generateTranscriptDrafts}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-8"
        >
          Preview Transcripts
        </button>
      )}

      {transcriptDrafts && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Transcript Preview</h2>
          {transcriptDrafts.map(({ student, records, cumulativeGPA, cumulativeCredits }) => (
            <div key={student.email} className="mb-6 border p-4 rounded">
              <h3 className="text-lg font-bold">{student.firstName} {student.lastName} ({student.email})</h3>
              <p>Cumulative GPA: {cumulativeGPA}</p>
              <p>Total Credits: {cumulativeCredits}</p>
              <table className="w-full table-auto text-sm border mt-2">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-2 py-1">Grade Level</th>
                    <th className="border px-2 py-1">GPA</th>
                    <th className="border px-2 py-1">Credits</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(({ gradeLevel, gpa, totalCredits }) => (
                    <tr key={gradeLevel}>
                      <td className="border px-2 py-1">{gradeLevel}</td>
                      <td className="border px-2 py-1">{gpa}</td>
                      <td className="border px-2 py-1">{totalCredits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
