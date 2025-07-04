import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranscriptStore } from "../../../stores/transciptStore";
import { ITranscript, IYearRecord, ICourse } from "../../../types/transcript";

type EditableCourse = {
  name: string;
  grade: string;
  credits: number;
  type: "normal" | "honors" | "ap";
};

type EditableRecord = IYearRecord & {
  courses: EditableCourse[];
};

type EditableTranscript = Omit<ITranscript, "records"> & {
  records: EditableRecord[];
  address?: string;
  dob?: string;
  parentGuardian?: string;
  startDate?: string;
  graduationDate?: string;
  email?: string;
  phone?: string;
  state?: string;
  zip?: string;
  country?: string;
  gender?: string;
  middleName?: string;
  lastName?: string;
  firstName?: string;
  cumulativeGPA?: number;
  
  errors?: {
    [field: string]: string;
  }
};

export default function TranscriptPreviewPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { createTranscript } = useTranscriptStore();
   const drafts = state?.transcriptDrafts || [];

  const [editableDrafts, setEditableDrafts] = useState<EditableTranscript[]>(
    () =>
      drafts.map((t: ITranscript) => ({
        ...t,
        address: (t as any).address || "433 Sailmaster St. Apt. A",
        dob: (t as any).dob || "11/02/2006",
        parentGuardian: (t as any).parentGuardian || "Lisa Mansell",
        records: t.records.map((r) => ({
          ...r,
          courses: r.courses.map((c) => ({
            name: c.name,
            grade: c.grade,
            credits: c.credits,
            type: c.type || "normal",
          })),
        })),
      }))
  );

 

  const handleSave = async (data: EditableTranscript) => {
    const res = await createTranscript(data);
    navigate("/dashboard/transcripts");
  };

  function handleAddTerm(tIdx: number) {
    setEditableDrafts((prev) => {
      const newDrafts = [...prev];
      const draft = { ...newDrafts[tIdx] };

      // Determine next gradeLevel (max + 1)
      const maxGrade = draft.records.reduce(
        (max, r) => Math.max(max, r.gradeLevel),
        8
      );

      draft.records = [
        ...draft.records,
        {
          gradeLevel: maxGrade + 1,
          courses: [],
          totalCredits: 0,
          gpa: 0,
        },
      ];

      newDrafts[tIdx] = draft;
      return newDrafts;
    });
  }

  function handleAddCourse(tIdx: number, recordIndex: number) {
    setEditableDrafts((prev) => {
      const newDrafts = [...prev];
      const draft = { ...newDrafts[tIdx] };
      const records = [...draft.records];
      const record = { ...records[recordIndex] };

      record.courses = [
        ...record.courses,
        { name: "", grade: "A", credits: 0.5, type: "normal" },
      ];

      // Recalculate record after adding empty course
      records[recordIndex] = recalcRecord(record);
      draft.records = records;
      newDrafts[tIdx] = draft;
      return newDrafts;
    });
  }

  function handleStudentInfoChange(
    tIdx: number,
    key: keyof EditableTranscript,
    value: string
  ) {
    setEditableDrafts((prev) => {
      const newDrafts = [...prev];
      newDrafts[tIdx] = {
        ...newDrafts[tIdx],
        [key]: value,
      };
      return newDrafts;
    });
  }

  // Local editable state for all drafts
  /*const [editableDrafts, setEditableDrafts] = useState<EditableTranscript[]>(
    () =>
      drafts.map((t: ITranscript) => ({
        ...t,
        records: t.records.map((r) => ({
          ...r,
          courses: r.courses.map((c) => ({
            name: c.name,
            grade: c.grade,
            credits: c.credits,
            type: c.type || "normal",
          })),
        })),
      }))
  );*/

  function recalcRecord(record: EditableRecord): EditableRecord {
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

  function recalcAllRecords(records: EditableRecord[]): EditableRecord[] {
    return records.map(recalcRecord);
  }

  function handleDeleteCourse(
    tIdx: number,
    recordIndex: number,
    courseIndex: number
  ) {
    setEditableDrafts((prev) => {
      const newDrafts = [...prev];
      const draft = { ...newDrafts[tIdx] };
      const records = [...draft.records];
      const record = { ...records[recordIndex] };
      const courses = [...record.courses];

      courses.splice(courseIndex, 1); // remove the course

      record.courses = courses;
      records[recordIndex] = recalcRecord(record);
      draft.records = records;

      // Recalculate cumulative GPA/credits
      const totalCredits = records.reduce((sum, r) => sum + r.totalCredits, 0);
      const totalPoints = records.reduce(
        (sum, r) => sum + r.gpa * r.totalCredits,
        0
      );
      draft.cumulativeCredits = totalCredits;
      draft.cumulativeGPA = totalCredits
        ? +(totalPoints / totalCredits).toFixed(2)
        : 0;

      newDrafts[tIdx] = draft;
      return newDrafts;
    });
  }

  // Handler to update course field
  function handleCourseChange(
    transcriptIndex: number,
    recordIndex: number,
    courseIndex: number,
    key: keyof EditableCourse,
    value: string | number
  ) {
    setEditableDrafts((prev) => {
      const newDrafts = [...prev];
      const draft = { ...newDrafts[transcriptIndex] };
      const records = [...draft.records];
      const record = { ...records[recordIndex] };
      const courses = [...record.courses];
      const course = { ...courses[courseIndex] };

      course[key] =
        key === "credits" ? Number(value) : String(value).toUpperCase();

      courses[courseIndex] = course;
      record.courses = courses;

      // Recalculate GPA and credits for this record
      const updatedRecord = recalcRecord(record);

      records[recordIndex] = updatedRecord;
      draft.records = records;

      // Optional: recalc cumulative GPA and credits for the whole transcript
      const totalCredits = records.reduce((sum, r) => sum + r.totalCredits, 0);
      const totalPoints = records.reduce(
        (sum, r) => sum + r.gpa * r.totalCredits,
        0
      );
      draft.cumulativeCredits = totalCredits;
      draft.cumulativeGPA = totalCredits
        ? +(totalPoints / totalCredits).toFixed(2)
        : 0;

      newDrafts[transcriptIndex] = draft;
      return newDrafts;
    });
  }

  // Split years into pairs for layout (like TranscriptDetail)
  function getPairedRecords(records: EditableRecord[]) {
    const paired = [];
    for (let i = 0; i < records.length; i += 2) {
      paired.push(records.slice(i, i + 2));
    }
    return paired;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6 text-center uppercase tracking-wide">
        Transcript Preview & Edit
      </h1>

      {editableDrafts.length === 0 && <p>No transcripts to preview.</p>}

      {editableDrafts.map((transcript, tIdx) => {
        const { student, cumulativeGPA, cumulativeCredits, records } =
          transcript;
        const pairedRecords = getPairedRecords(records);

        return (
          <div key={tIdx} className="mb-10 border p-6 rounded shadow">
            {/* Student & School Info */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h2 className="font-semibold text-gray-700 mb-1">
                  Student Information
                </h2>
                <p>
                  {student.firstName} {student.lastName}
                </p>
                <p className="text-gray-600">
                  <strong>Address:</strong>{" "}
                  <input
                    type="text"
                    name="address"
                    aria-label="address"
                    className="border p-1 w-full"
                    value={transcript.address}
                    onChange={(e) =>
                      handleStudentInfoChange(tIdx, "address", e.target.value)
                    }
                  />
                </p>
                <p className="text-gray-600">Lakeway, Texas 78734</p>
                <p className="text-gray-600">
                  <strong>Phone:</strong>{" "}
                  <input
                    type="tel"
                    name="phone"
                    aria-label="phone"
                    className="border p-1 w-full"
                    value={transcript.phone}
                    onChange={(e) =>
                      handleStudentInfoChange(tIdx, "phone", e.target.value)
                    }
                  />
                </p>
                <p className="text-gray-600">
                  <strong>Email:</strong>{" "}
                  <input
                    type="email"
                    name="email"
                    aria-label="email"
                    className="border p-1 w-full"
                    value={transcript.email}
                    onChange={(e) =>
                      handleStudentInfoChange(tIdx, "email", e.target.value)
                    }
                  />
                </p>
                <p className="text-gray-600">
                     <strong>Date of Birth:</strong>{" "}
                  <input
                    type="date"
                    name="dob"
                    aria-label="dob"
                    className="border p-1 w-full"
                    value={transcript.dob}
                    onChange={(e) =>
                      handleStudentInfoChange(tIdx, "dob", e.target.value)
                    }
                  />
                </p>
                <p className="text-gray-600">
                    <strong>Parent/Guardian:</strong>{" "}
                  <input
                    type="text"
                    name="parent"
                    aria-label="parent"
                    className="border p-1 w-full"
                    value={transcript.parentGuardian}
                    onChange={(e) =>
                      handleStudentInfoChange(tIdx, "parentGuardian", e.target.value)
                    }
                  />
                </p>
              </div>
              <div>
                <h2 className="font-semibold text-gray-700 mb-1">
                  School Information
                </h2>
                <p>Sterling Academy</p>
                <p className="text-gray-600">Contact: Rebecca Chiu</p>
                <p className="text-gray-600">
                  950 South Pine Island Road, Suite A150
                </p>
                <p className="text-gray-600">Plantation, Florida 33324</p>
                <p className="text-gray-600">626-360-8012</p>
                <p className="text-gray-600">registration@sterling.academy</p>
              </div>
            </div>

            {/* Academic Records */}
            <h2 className="text-md font-semibold uppercase mb-4">
              Academic Records
            </h2>
            {pairedRecords.map((pair, i) => (
              <div
                key={i}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-sm"
              >
                {pair.map((record, rIdx) => (
                  <div key={record.gradeLevel}>
                    <h3 className="font-bold text-gray-700 mb-2">
                      Grade Level {record.gradeLevel} (
                      {2021 + (record.gradeLevel - 9)} -{" "}
                      {2022 + (record.gradeLevel - 9)})
                    </h3>
                    <table className="w-full border text-sm mb-2">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border px-2 py-1 text-left">
                            Course Name
                          </th>
                          <th className="border px-2 py-1 text-center">
                            Final Grade
                          </th>
                          <th className="border px-2 py-1 text-center">
                            Credits
                          </th>
                          <th className="border px-2 py-1 text-center">Type</th>
                          <th className="border px-2 py-1 text-center">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {record.courses.map((course, cIdx) => (
                          <tr key={cIdx}>
                            <td className="border px-2 py-1">
                              <input
                                className="w-full"
                                value={course.name}
                                onChange={(e) =>
                                  handleCourseChange(
                                    tIdx,
                                    i * 2 + rIdx,
                                    cIdx,
                                    "name",
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                            <td className="border px-2 py-1 text-center">
                              <input
                                className="w-16 text-center"
                                value={course.grade}
                                maxLength={2}
                                onChange={(e) =>
                                  handleCourseChange(
                                    tIdx,
                                    i * 2 + rIdx,
                                    cIdx,
                                    "grade",
                                    e.target.value.toUpperCase()
                                  )
                                }
                              />
                            </td>
                            <td className="border px-2 py-1 text-center">
                              <input
                                type="number"
                                step="0.25"
                                className="w-16 text-center"
                                value={course.credits}
                                onChange={(e) =>
                                  handleCourseChange(
                                    tIdx,
                                    i * 2 + rIdx,
                                    cIdx,
                                    "credits",
                                    Number(e.target.value)
                                  )
                                }
                              />
                            </td>
                            <td className="border px-2 py-1 text-center">
                              <select
                                value={course.type}
                                onChange={(e) =>
                                  handleCourseChange(
                                    tIdx,
                                    i * 2 + rIdx,
                                    cIdx,
                                    "type",
                                    e.target.value as any
                                  )
                                }
                              >
                                <option value="normal">Normal</option>
                                <option value="honors">Honors</option>
                                <option value="ap">AP</option>
                              </select>
                            </td>
                            <td className="border px-2 py-1 text-center">
                              <button
                                onClick={() =>
                                  handleDeleteCourse(tIdx, i * 2 + rIdx, cIdx)
                                }
                                className="text-red-600 hover:text-red-800 font-bold"
                                aria-label="Delete course"
                              >
                                &times;
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <button
                      className="mt-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      onClick={() => handleAddCourse(tIdx, i * 2 + rIdx)}
                    >
                      + Add Course
                    </button>

                    <p>
                      <strong>Total GPA:</strong> {record.gpa.toFixed(2)} |{" "}
                      <strong>Credits:</strong> {record.totalCredits.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            ))}

            <button
              className="mt-4 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
              onClick={() => handleAddTerm(tIdx)}
            >
              + Add Term (Grade Level)
            </button>

            {/* Academic Summary */}
            <h2 className="text-md font-semibold uppercase mb-2">
              Academic Summary
            </h2>
            <div className="text-sm mb-6">
              <p>
                <strong>Overall GPA:</strong> {cumulativeGPA.toFixed(2)}
              </p>
              <p>
                <strong>Credits Earned:</strong> {cumulativeCredits.toFixed(2)}
              </p>
              <p>
               
                <strong>9th Grade Start Date:</strong>{" "}
                <input
                    name="startDate"
                    id="startDate"
                    aria-label="Start Date"
                    type="date"
                    className="border p-1"
                    value={transcript.startDate || ""}
                    onChange={(e) =>
                    handleStudentInfoChange(tIdx, "startDate", e.target.value)
                    }
                />
              </p>
              <p>
                <strong>Graduation Date:</strong> {" "}
                <input
                    name="graduationDate"
                    id="graduationDate"
                    aria-label="Graduation Date"
                    type="date"
                    className="border p-1"
                    value={transcript.graduationDate || ""}
                    onChange={(e) =>
                    handleStudentInfoChange(tIdx, "graduationDate", e.target.value)
                    }
                />
              </p>
              <p className="italic text-xs text-gray-500 mt-1">
                * Honors = 0.5 boost, AP = 1.0 boost
              </p>
            </div>

            {/* Certification */}
            <div className="text-sm border-t pt-4 mt-6">
              <p>
                I do hereby self-certify and affirm that this is the official
                transcript and record of{" "}
                <strong>
                  {student.firstName} {student.lastName}
                </strong>{" "}
                in the academic studies of 2021–2025.
              </p>
              <p className="mt-4">06/26/2025</p>
              <p>Student Services Date</p>
            </div>

            <div className="mt-6 text-right">
              <button
                type="button"
                onClick={() => handleSave(transcript)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save Transcript
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
