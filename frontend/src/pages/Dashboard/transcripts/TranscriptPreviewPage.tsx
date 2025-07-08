import { ITranscript, IYearRecord } from "../../../types/transcript";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranscriptStore } from "../../../stores/transciptStore";
import { v4 as uuidv4 } from 'uuid';
import toast from "react-hot-toast";
import { formatDate } from "@/utils/formatDate";
import { useRef } from "react";
import {  ArrowDownCircle } from "lucide-react";
import { CountryDropdown } from "@/components/ui/country-dropdown";



type EditableCourse = {
  name: string;
  grade: string;
  credits: number;
  type: "normal" | "honors" | "ap";
};

type EditableRecord = IYearRecord & {
  courses: EditableCourse[];
  startYear?: number;
  endYear?: number;
};

interface CourseEdit {
  name: string;
  grade: string;
  credits: number;
  type: "normal" | "honors" | "ap";
  startDate?: string;
  endDate?: string;
}


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
  city?: string;
  gender?: string;
  lastName?: string;
  firstName?: string;
  cumulativeGPA?: number;

  errors?: {
    [field: string]: string;
  };
};

export default function TranscriptPreviewPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { createTranscript } = useTranscriptStore();

  const submitRef = useRef<HTMLDivElement | null>(null);

  const drafts = state?.transcriptDrafts || [];

  const [editableDrafts, setEditableDrafts] = useState<EditableTranscript[]>(
    () =>
      drafts.map((t: ITranscript) => ({
        ...t,
        firstName: t.student.firstName || "First Name",
        lastName: t.student.lastName || "Last Name",
        address: t.student.address || "Address",
        city: t.student.city || "City",
        state: t.student.state || "",
        country: t.student.country || "",
        zip: t.student.zip || "",
        email: t.student.email || "Email",
        phone: t.student.phone || "(123) 456-7890",
        dob: t.student.dob || "MM/DD/YYYY",
        gender: t.student.gender || "",
        parentGuardian: t.student.parentGuardian || "Parent/Guardian",
        startDate: t.student.startDate || "MM/DD/YYYY",
        graduationDate: t.student.graduationDate || "MM/DD/YYYY",


        records: t.records.map((r) => {
          const defaultStart = 2021 + (r.gradeLevel - 9);
          const startYears = r.courses
            .map((c:CourseEdit) => new Date(c.startDate ?? "").getFullYear())
            .filter((y) => !isNaN(y));
          const inferredStartYear = startYears.length
            ? Math.min(...startYears)
            : defaultStart;

          const endYears = r.courses
            .map((c) => new Date(c.endDate ?? "").getFullYear())
            .filter((y) => !isNaN(y));
          const inferredEndYear = endYears.length
            ? Math.max(...endYears)
            : inferredStartYear + 1;

        console.log(inferredStartYear, inferredEndYear);

          const safeStartYear =
            r.startYear > 1900 ? r.startYear : inferredStartYear;
          const safeEndYear =
            r.endYear > 1900 && r.endYear > safeStartYear
              ? r.endYear
              : safeStartYear + 1;

          return {
            ...r,
            startYear: safeStartYear,
            endYear: safeEndYear,
            courses: r.courses.map((c) => ({
              name: c.name,
              grade: c.grade,
              credits: c.credits,
              type: c.type || "normal",
            })),
          };
        }),
      }))
  );

  const handleSave = async (data: EditableTranscript) => {
  // Validate years
  for (const r of data.records) {
    if (!r.startYear || !r.endYear) {
      alert("Each academic record must include a valid start and end year.");
      return;
    }
  }

  // Build student object from editable fields
  const student = {
    firstName: data.firstName ?? "",
    lastName: data.lastName ?? "",
    email: data.email ?? "",
    address: data.address ?? "",
    city: data.city ?? "",
    state: data.state ?? "",
    zip: data.zip ?? "",
    country: data.country ?? "",
    phone: data.phone ?? "",
    dob: data.dob ?? "",
    parentGuardian: data.parentGuardian ?? "",
    startDate: data.startDate ?? "",
    graduationDate: data.graduationDate ?? "",
    gender: data.gender ?? "",
    
  };

  // Build final transcript object
  const fullTranscript: ITranscript = {
    ...data,
    student,
    records: data.records,
  };

  console.log(fullTranscript);

  try {
    const res = await createTranscript(fullTranscript);
    console.log(res);
    toast.success("Transcript created successfully");
    navigate("/dashboard/transcripts");
  } catch (err) {
    toast.error("Failed to create transcript");
    console.error("Error creating transcript:", err);
  }
};




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

  function handleRecordMetaChange(
    tIdx: number,
    recordIndex: number,
    key: keyof EditableRecord,
    value: string | number
  ) {
    setEditableDrafts((prev) => {
      const newDrafts = [...prev];
      const draft = { ...newDrafts[tIdx] };
      const records = [...draft.records];
      const record = { ...records[recordIndex], [key]: value };
      records[recordIndex] = record;
      draft.records = records;
      newDrafts[tIdx] = draft;
      return newDrafts;
    });
  }

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
      const totalPoints = records.reduce((sum, r) => sum + r.totalCredits * r.gpa, 0);

      draft.cumulativeCredits = totalCredits;
      draft.cumulativeGPA = totalCredits
        ? + (totalPoints / totalCredits).toFixed(2): 0;

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

      (course[key] as string | number) =
        key === "credits"
          ? Number(value)
          : key === "grade"
          ? String(value).toUpperCase()
          : String(value);

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
        Transcript Preview 
      </h1>

    <span className="bg-green-100 text-green-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-blue-900 dark:text-blue-300">

            1. Enter Student information
    </span>

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
                <p className="text-gray-600">
                  <strong>First Name:</strong>{" "}
                 <input
                    title="firstName"
                    type="text"
                    name="firstName"
                    aria-label="firstName"
                    className="border p-1 w-full"
                    value={transcript.firstName || ""}
                    placeholder={transcript.firstName ? transcript.firstName : "First Name"}
                    onChange={(e) =>
                      handleStudentInfoChange(tIdx, "firstName", e.target.value)
                    }
                  />
                </p>

                 <p className="text-gray-600">
                  <strong>Last Name:</strong>{" "}
                  <input
                    title="lastName"
                    type="text"
                    name="lastName"
                    aria-label="lastName"
                    className="border p-1 w-full"
                    value={transcript.lastName}
                    placeholder={transcript.lastName ? transcript.lastName : "Last Name"}
                    onChange={(e) =>
                      handleStudentInfoChange(tIdx, "lastName", e.target.value)
                    }
                  />
                </p>
                <p className="text-gray-600">
                  <strong>Address:</strong>{" "}
                  <input
                    title="address"
                    type="text"
                    name="address"
                    aria-label="address"
                    className="border p-1 w-full"
                    placeholder={transcript.address ? transcript.address : "Address"}
                    value={transcript.address}
                    onChange={(e) =>
                      handleStudentInfoChange(tIdx, "address", e.target.value)
                    }
                  />
                </p>

                <p className="text-gray-600">
                  <strong>City:</strong>{" "}
                  <input
                    title="city"
                    type="text"
                    name="city"
                    aria-label="city"
                    className="border p-1 w-full"
                    placeholder={transcript.city ? transcript.city : "City"}
                    value={transcript.city}
                    onChange={(e) =>
                      handleStudentInfoChange(tIdx, "city", e.target.value)
                    }
                  />
                </p>

                <p className="text-gray-600">
                  <strong>State:</strong>{" "}
                  <input
                    title="State"
                    type="text"
                    name="state"
                    aria-label="state"
                    className="border p-1 w-full"
                    value={transcript.state}
                    placeholder={transcript.state ? transcript.state : "State"}
                    onChange={(e) =>
                      handleStudentInfoChange(tIdx, "state", e.target.value)
                    }
                  />
                </p>

                <p className="text-gray-600">
                  <strong>Country:</strong>{" "}
                  <CountryDropdown
                    defaultValue={transcript.country || undefined}
                    onChange={(country) =>
                      handleStudentInfoChange(tIdx, "country", country.alpha3)
                    }
                  />
                </p>
                <p className="text-gray-600">
                  <strong>Phone:</strong>{" "}
                  <input
                    title="phone"
                    type="tel"
                    name="phone"
                    aria-label="phone"
                    placeholder={transcript.phone ? transcript.phone : "(xxx) xxx-xxxx"}
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
                    title="email"
                    type="email"
                    name="email"
                    aria-label="email"
                    className="border p-1 w-full"
                    value={transcript.email}
                    placeholder={transcript.email ? transcript.email : "email@example.com"}
                    onChange={(e) =>
                      handleStudentInfoChange(tIdx, "email", e.target.value)
                    }
                  />
                </p>
                <p className="text-gray-600">
                  <strong>Date of Birth:</strong>{" "}
                  <input
                    title="date of birth"
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
                    title="parent/guardian"
                    type="text"
                    name="parent"
                    aria-label="parent"
                    className="border p-1 w-full"
                    value={transcript.parentGuardian}
                    placeholder={transcript.parentGuardian ? transcript.parentGuardian : "Parent/Guardian"}
                    onChange={(e) =>
                      handleStudentInfoChange(
                        tIdx,
                        "parentGuardian",
                        e.target.value
                      )
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

              <div>
                 <p>
                <strong>9th Grade Start Date:</strong>{" "}
                <input
                  title="startDate"
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
                <strong>Graduation Date:</strong>{" "}
                <input
                  title="graduationDate"
                  name="graduationDate"
                  id="graduationDate"
                  aria-label="Graduation Date"
                  type="date"
                  className="border p-1"
                  value={transcript.graduationDate || ""}
                  onChange={(e) =>
                    handleStudentInfoChange(
                      tIdx,
                      "graduationDate",
                      e.target.value
                    )
                  }
                />
              </p>
              </div>
            </div>


            <span 
                onClick={() => submitRef.current?.scrollIntoView({ behavior: "smooth" })}
                
                className="cursor-pointer inline-flex items-center 
                bg-blue-100 text-blue-800 text-sm font-medium me-3 px-3 py-0.75 rounded-sm 
                dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 hover:transform hover:scale-105 transition duration-300 ease-in-out"
            >

            2. Review and Submit

            <span className="me-2"> <ArrowDownCircle className="ms-2" /></span>
                
           
             </span>
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
                    <h3 className="font-bold text-gray-700 mb-2 ">
                    <span className="me-2"> Grade Level {record.gradeLevel} </span>
                     
                      <input
                        disabled
                        title="startYear"
                        aria-label="startYear"
                        type="number"
                        value={record.startYear}
                        className="border p-1 w-20"
                        onChange={(e) =>
                          handleRecordMetaChange(
                            tIdx,
                            i * 2 + rIdx,
                            "startYear",
                            +e.target.value
                          )
                        }
                      />{" "}
                      -{" "}
                      <input
                        disabled
                        title="endYear"
                        aria-label="endYear"
                        type="number"
                        value={record.endYear}
                        className="border p-1 w-20"
                        onChange={(e) =>
                          handleRecordMetaChange(
                            tIdx,
                            i * 2 + rIdx,
                            "endYear",
                            +e.target.value
                          )
                        }
                      />
                      
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
                          
                        </tr>
                      </thead>
                      <tbody>
                        {record.courses.map((course, cIdx) => (
                          <tr key={cIdx}>
                            <td className="border px-2 py-1">
                              <input
                                disabled
                                title="courseName"
                                type="text"
                                aria-label="courseName"
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
                                disabled
                                title="grade"
                                aria-label="grade"
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
                                disabled
                                title="credits"
                                aria-label="credits"
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
                                disabled
                                title="type"
                                className="w-full"
                                aria-label="type"
                                value={course.type}
                                onChange={(e) =>
                                  handleCourseChange(
                                    tIdx,
                                    i * 2 + rIdx,
                                    cIdx,
                                    "type",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="normal">Normal</option>
                                <option value="honors">Honors</option>
                                <option value="ap">AP</option>
                              </select>
                            </td>
                            
                          </tr>
                        ))}
                      </tbody>
                    </table>

                   

                    <p>
                      <strong>Total GPA:</strong> {record.gpa.toFixed(2)} |{" "}
                      <strong>Credits:</strong> {record.totalCredits.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            ))}

            <hr className="my-6" />

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
             
              <p className="italic text-xs text-gray-500 mt-1">
                * Honors = 0.5 boost, AP = 1.0 boost
              </p>
            </div>

            {/* Certification */}
            <div className="text-sm border-t pt-4 mt-6">
              <p>
                I self-certify and affirm that this is the official
                transcript and record of{" "}
                <strong>
                  {student.firstName} {student.lastName}
                </strong>{" "}
                in the academic studies of 2021–2025.
              </p>
              <p className="mt-4">{formatDate(new Date())}</p>
              <p>Authorized Signature</p>
            </div>

            <div ref={submitRef} className="mt-6 text-right">
              <button
                type="button"
                onClick={() => handleSave(transcript)}
                className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
              >
                Confirm & Proceed to Editing
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
