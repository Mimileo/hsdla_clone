/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranscriptStore } from "../../../stores/transciptStore";
import { IUser } from "../../../types/user";
import { apiClient } from "../../../config/axiosConfig";
import { CountryDropdown } from "@/components/ui/country-dropdown";
import { CSS } from "@dnd-kit/utilities";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragOverlay,
} from "@dnd-kit/core";
import type {
  DragEndEvent,
  DragStartEvent,
  //UniqueIdentifier,
} from "@dnd-kit/core";
import { GripVerticalIcon, Trash2Icon } from "lucide-react";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { EditableCourse, EditableRecord, EditableTranscript } from "@/types/editable";
import CourseRow from "@/components/ui/CourseRow";
import { DragProps } from "@/types/drag";
import Placeholder from "@/components/Placeholder";

// --- 1) Types for our draft state ---

// --- 2) Function to recalc a single term GPA & credits ---
function recalcRecord(r: EditableRecord): EditableRecord {
  const totalCredits = r.courses.reduce((sum, c) => sum + c.credits, 0);
  const totalPoints = r.courses.reduce((sum, c) => {
    const base = { A: 4, B: 3, C: 2, D: 1, F: 0 }[c.grade.toUpperCase()] || 0;
    const boost = c.type === "honors" ? 0.5 : c.type === "ap" ? 1 : 0;
    return sum + (base + boost) * c.credits;
  }, 0);
  console.log(totalPoints, totalCredits);
  return {
    gradeLevel: r.gradeLevel,
    courses: r.courses,
    startYear: r.startYear,
    endYear: r.endYear,
    // store for per-term GPA
    // gpa: totalCredits? +(totalPoints/totalCredits).toFixed(2):0,
    // totalCredits
  };
}


function calculateCumulativeStatsUpTo(
  records: EditableRecord[],
  index: number
) {
  let totalPoints = 0;
  let totalCredits = 0;

  for (let i = 0; i <= index; i++) {
    const term = recalcRecord(records[i]);
    for (const c of term.courses) {
      const base = { A: 4, B: 3, C: 2, D: 1, F: 0 }[c.grade.toUpperCase()] || 0;
      const boost = c.type === "honors" ? 0.5 : c.type === "ap" ? 1 : 0;
      totalPoints += (base + boost) * c.credits;
      totalCredits += c.credits;
    }
  }

  const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
  return {
    gpa: +gpa.toFixed(2),
    credits: +totalCredits.toFixed(2),
  };
}

/*function inferYearRange(rec: EditableRecord, index: number, start: number) {
  const startYear = rec.startYear ?? start + index;
  const endYear = rec.endYear ?? startYear + 1;
  return { startYear, endYear };
}*/

export default function EditTranscriptPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const {
    selectedTranscript,
    fetchTranscriptById,
    editTranscriptById,
    loading,
    error,
  } = useTranscriptStore();

  const [draft, setDraft] = useState<EditableTranscript | null>(null);

  //const [ setActiveId] = useState<UniqueIdentifier | null>(null);

  const [activeDrag, setActiveDrag] = useState<{
    recIdx: number;
    courseIdx: number;
    course: EditableCourse;
  } | null>(null);

  // 3) Fetch from store
  useEffect(() => {
    if (id) fetchTranscriptById(id);
  }, [id, fetchTranscriptById]);

  // 4) When store updates, hydrate local draft
  useEffect(() => {
    if (!selectedTranscript) return;

    if(draft) {
      return;
    }

    const s = selectedTranscript.student as IUser;
    setDraft({
      _id: selectedTranscript._id,

      student: {
        _id: s._id,
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.email,
        address: s.address || "",
        city: s.city || "",
        state: s.state || "",
        zip: s.zip || "",
        phone: s.phone || "",
        dob: s.dob?.slice(0, 10) || "",
        parentGuardian: s.parentGuardian || "",
        startDate: s.startDate?.slice(0, 10) || "",
        graduationDate: s.graduationDate?.slice(0, 10) || "",
      },

      records: selectedTranscript.records.map((r, i): EditableRecord => {
        const inferredStartYear =
          r.startYear ??
          (s.startDate
            ? new Date(s.startDate).getFullYear() + i
            : new Date().getFullYear() + i);

        const uniqueCourses = Array.from(
          new Map(r.courses!.map((c) => [c._id, c])).values()
        );

        return {
          gradeLevel: r.gradeLevel as number,
          startYear: inferredStartYear,
          endYear: r.endYear ?? inferredStartYear + 1,
         courses: uniqueCourses.map((c) => ({
          ...c,
            name: c.name ?? "",
            localId: c._id ? undefined : crypto.randomUUID(),
            
          })) as EditableCourse[],
        };
      }),
    });
  }, [selectedTranscript]);

  // 5) Handlers to update draft
  // any student‑field
  function updateStudentField<K extends keyof EditableTranscript["student"]>(
    key: K,
    val: EditableTranscript["student"][K]
  ) {
    setDraft(
      (d) =>
        d && {
          ...d,
          student: { ...d.student, [key]: val },
        }
    );
  }

  // any course cell
  function updateCourse(
    recIdx: number,
    courseIdx: number,
    key: keyof EditableCourse,
    val: EditableCourse[keyof EditableCourse]
  ) {
    setDraft((d) => {
      if (!d) return d;
      const records = d.records.map((r, i) => {
        if (i !== recIdx) return r;
        const courses = r.courses.map((c, j) =>
          j === courseIdx ? { ...c, [key]: val } : c
        );
        return { ...r, courses };
      });
      return { ...d, records };
    });
  }

  // add a blank course
function addCourse(recIdx: number) {
  console.log("Adding course to record", recIdx);

  setDraft((d): EditableTranscript | null => {
    if (!d) return d;

    const updatedRecords = d.records.map((r, i) => {
      if (i !== recIdx) return r;

      const newCourse: EditableCourse = {
        _id: crypto.randomUUID(),
        name: "",
        grade: "A",
        credits: 0.5,
        type: "normal",
      };

      return {
        ...r,
        courses: [...r.courses, newCourse],
      };
    });

    return {
      ...d,
      records: updatedRecords,
    };
  });
}







  // TODO: add a blank term
  // add a new term
  function addTerm() {
    setDraft((d) => {
      if (!d) {
        return d;
      }

      const lastRecord = d.records[d.records.length - 1];

      const nextGrade = Math.max(...d.records.map((r) => r.gradeLevel)) + 1;

      const inferredStart = lastRecord?.endYear ?? new Date().getFullYear();
      return {
        ...d,
        records: [
          ...d.records,
          {
            gradeLevel: nextGrade,
            startYear: inferredStart,
            endYear: inferredStart + 1,
            courses: [],
          },
        ],
      };
    });
  }

  // remove a course
  // TODO: also remove the course from the transcript
  function removeCourse(recIdx: number, courseId: string) {
    setDraft((d) => {
      if (!d) return d;

      const records = d.records.map((r, i) => {
        if (i !== recIdx) return r;
        return {
          ...r,
          courses: r.courses.filter((c) => c._id !== courseId),
        };
      });
      return { ...d, records };
    });
  }

  // TODO: also remove the term from the transcript

  const DroppableTerm = ({ recIdx, children }: any) => {
    const { setNodeRef } = useDroppable({
      id: `term-${recIdx}`,
      data: { recIdx },
    });

    return (
      <div ref={setNodeRef} className="p-2 bg-gray-100 rounded">
        {children}
      </div>
    );
  };

  //  Save

  async function onSave() {
    if (!draft) return;

    // 1️ Recalculate each term's GPA + total credits
    const recalculatedRecords = draft.records.map((r) => {
      const recalc = recalcRecord(r);
      console.log(recalc);
      const totalCredits = r.courses.reduce((sum, c) => sum + c.credits, 0);
      const totalPoints = r.courses.reduce((sum, c) => {
        const base =
          { A: 4, B: 3, C: 2, D: 1, F: 0 }[c.grade.toUpperCase()] || 0;
        const boost = c.type === "honors" ? 0.5 : c.type === "ap" ? 1 : 0;
        return sum + (base + boost) * c.credits;
      }, 0);
      const gpa =
        totalCredits > 0 ? +(totalPoints / totalCredits).toFixed(2) : 0;

      return {
        gradeLevel: r.gradeLevel,
        startYear: r.startYear,
        endYear: r.endYear,
        courses: r.courses,
        gpa,
        totalCredits: +totalCredits.toFixed(2),
      };
    });

    // 2️⃣ Recalculate cumulative totals
    const totalPoints = recalculatedRecords.reduce(
      (sum, r) => sum + r.gpa * r.totalCredits,
      0
    );
    const totalCredits = recalculatedRecords.reduce(
      (sum, r) => sum + r.totalCredits,
      0
    );
    const cumulativeGPA =
      totalCredits > 0 ? +(totalPoints / totalCredits).toFixed(2) : 0;

    // 3️⃣ Save transcript
    await editTranscriptById(draft._id, {
      records: recalculatedRecords,
      cumulativeGPA,
      cumulativeCredits: +totalCredits.toFixed(2),
    });

    // 4️⃣ Save updated student info
    await apiClient.patch(`/users/edit/${selectedTranscript?.student._id}`, {
      firstName: draft.student.firstName,
      lastName: draft.student.lastName,
      address: draft.student.address,
      city: draft.student.city,
      state: draft.student.state,
      country: draft.student.country,
      zip: draft.student.zip,
      phone: draft.student.phone,
      dob: draft.student.dob,
      parentGuardian: draft.student.parentGuardian,
      startDate: draft.student.startDate,
      graduationDate: draft.student.graduationDate,
    });

    navigate(`/dashboard/transcripts/${selectedTranscript?._id}`);
  }

  const DraggableCourse = ({ recIdx, courseIdx, courseId, children }: any) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      isDragging,
    } = useSortable({
      id: courseId,
      data: { recIdx, courseId },
    });

    console.log(isDragging, recIdx, courseIdx);

    // const isDragging = activeId === `course-${recIdx}-${courseIdx}`;

    const style = {
      transform: CSS.Transform.toString(transform),
      transition: "transform 200ms ease",
      backgroundColor: isDragging ? "#f0f8ff" : undefined,
    };

    return children({
      ref: setNodeRef,
      style: style,
      listeners,
      attributes,
      isDragging,
    });
  };

  function handleDragStart(event: DragStartEvent) {

    const { recIdx, courseId } = event.active.data.current || {};

    if (typeof recIdx !== "number" || !courseId || !draft) return;

    const courseIdx = draft.records[recIdx]?.courses.findIndex(
      (c) => c._id === courseId
    );

    if (typeof courseIdx !== "number" || courseIdx < 0) return;

    const course = draft.records[recIdx].courses[courseIdx];

    setActiveDrag({ recIdx, courseIdx, course });
  }

  function handleDragEnd(event: DragEndEvent) {
   // setActiveId(null); // <– clear when done
    setActiveDrag(null);
    const { active, over } = event;

    if (!active || !over || active.id === over.id) return;

    const from = active.data.current; // where the course came from
    const to = over.data.current;

    // Ensure valid drag source
    if (!from || !to) return;

    const fromRecIdx = from.recIdx;
    const fromId = from.courseId;
    const toRecIdx = to.recIdx;
    const toId = to.courseId;

    // Update state
    setDraft((prev) => {
      if (!prev) return prev;
      const records = [...prev.records];

      const fromCourses = [...records[fromRecIdx].courses];
      const fromIdx = fromCourses.findIndex((c) => c._id === fromId);
      if (fromIdx === -1) return prev;

      const moved = fromCourses[fromIdx];
      fromCourses.splice(fromIdx, 1);

      if (fromRecIdx === toRecIdx) {
        const toCourses = [...fromCourses];
        const toIdx = toCourses.findIndex((c) => c._id === toId);

        // If the dragged course was above the target, inserting below shifts
        const insertAt = fromIdx < toIdx ? toIdx - 1 : toIdx;

        toCourses.splice(insertAt, 0, moved);
        records[fromRecIdx].courses = toCourses;
      } else {
        const toCourses = [...records[toRecIdx].courses];
        const toIdx = toCourses.findIndex((c) => c._id === toId);
        toCourses.splice(toIdx, 0, moved);
        records[fromRecIdx].courses = fromCourses;
        records[toRecIdx].courses = toCourses;
      }

      return { ...prev, records };
    });
  }

  if (loading || !draft) return <Placeholder />;
  if (error) return <p className="text-red-600">{error}</p>;

  const studentStartYear = draft?.student?.startDate
    ? new Date(draft.student.startDate).getFullYear()
    : new Date().getFullYear(); // fallback if not available

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow">
      <h1 className="text-xl font-bold mb-4">
        Edit Transcript for {selectedTranscript?.student.firstName}
      </h1>
      <p className="mb-6">
        Use the form below to edit this transcript for{" "}
        {selectedTranscript?.student?._id as string}.
      </p>

      <section className="mb-6">
        <h2 className="font-semibold">Student Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {(
            [
              "firstName",
              "lastName",
              "address",
              "city",
              "state",
              "zip",
              "country",
              "phone",
              "dob",
              "parentGuardian",
              "startDate",
              "graduationDate",
            ] as (keyof EditableTranscript["student"])[]
          ).map((field) => (
            <div key={field}>
              {field === "country" ? (
                <>
                  <label className="block mb-1 text-sm font-medium">
                    {field}
                  </label>
                  <CountryDropdown
                    defaultValue={draft.student.country || undefined}
                    onChange={(country) =>
                      updateStudentField("country", country.alpha3)
                    }
                  />
                </>
              ) : (
                <label key={field} className="block">
                  {field}
                  <input
                    type={
                      field.includes("Date") || field === "dob"
                        ? "date"
                        : "text"
                    }
                    className="border p-1 w-full"
                    value={draft.student[field] || ""}
                    onChange={(e) => updateStudentField(field, e.target.value)}
                  />
                </label>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold">Academic Records</h2>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          {draft.records.map((rec, recIdx) => (
            <DroppableTerm key={recIdx} recIdx={recIdx}>
              <div className="mb-4 border p-3 rounded">
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <label className="text-sm">
                    Grade Level:
                    <input
                      type="number"
                      className="ml-2 border px-2 py-1 w-20"
                      value={rec.gradeLevel}
                      onChange={(e) => {
                        const grade = parseInt(e.target.value);
                        if (!isNaN(grade)) {
                          setDraft((prev) => {
                            if (!prev) {
                              return prev;
                            }

                            const records = [...prev.records];
                            records[recIdx].gradeLevel = grade;

                            return {
                              ...prev,
                              records,
                            };
                          });
                        }
                      }}
                    />
                  </label>

                  <label className="text-sm">
                    Start Year:
                    <input
                      type="number"
                      className="ml-2 border px-2 py-1 w-20"
                      value={rec.startYear ?? studentStartYear + recIdx}
                      placeholder={(() => {
                        if (draft.student.startDate) {
                          return (
                            new Date(draft.student.startDate).getFullYear() +
                            (recIdx || 0)
                          ).toString();
                        }
                        return "";
                      })()}
                      onChange={(e) => {
                        const year = parseInt(e.target.value);
                        if (!isNaN(year)) {
                          setDraft((prev) => {
                            if (!prev) {
                              return prev;
                            }

                            const records = [...prev.records];
                            records[recIdx].startYear = year;
                            records[recIdx].endYear = year + 1;

                            return {
                              ...prev,
                              records,
                            };
                          });
                        }
                      }}
                    />
                  </label>

                  <label className="text-sm">
                    End Year:
                    <input
                      type="number"
                      className="ml-2 border px-2 py-1 w-24"
                      value={
                        rec.endYear ??
                        (rec.startYear ?? studentStartYear + recIdx) + 1
                      }
                      onChange={(e) => {
                        const year = parseInt(e.target.value);
                        if (!isNaN(year)) {
                          setDraft((prev) => {
                            if (!prev) {
                              return prev;
                            }

                            const records = [...prev.records];
                            records[recIdx].endYear = year;

                            return {
                              ...prev,
                              records,
                            };
                          });
                        }
                      }}
                    />
                  </label>
                </div>
                <table className="w-full border-collapse text-sm mb-2">
                  <thead>
                    <tr>
                      <th className="border p-1"></th>
                      <th className="border p-1">Course</th>
                      <th className="border p-1">Grade</th>
                      <th className="border p-1">Credits</th>
                      <th className="border p-1">Type</th>
                      <th className="border p-1">Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    <SortableContext
                      items={rec.courses.map((c) => c._id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {rec.courses.length > 0 ? (
                        rec.courses.map((c, cIdx) => (
                          <DraggableCourse
                            key={c._id }
                            recIdx={recIdx}
                            courseIdx={cIdx}
                            courseId={c._id}
                          >
                           {(dragProps: DragProps) => (
                              <CourseRow
                                recIdx={recIdx}
                                courseIdx={cIdx}
                                course={c}
                                updateCourse={updateCourse}
                                removeCourse={removeCourse}
                                dragProps={dragProps}
                              />
                            )}
                          </DraggableCourse>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6}>
                            <div className="p-4 text-gray-500 italic text-center border rounded bg-gray-50">
                              Drop a course here to add to this term
                            </div>
                          </td>
                        </tr>
                      )}
                    </SortableContext>
                  </tbody>
                </table>
                <button
                  onClick={() => addCourse(recIdx)}
                  className="text-green-600"
                >
                  + Add Course
                </button>

                <p className="text-sm text-gray-700 mt-1">
                  <strong>Term GPA:</strong>{" "}
                  {(() => {
                    const totalCredits = rec.courses.reduce(
                      (sum, c) => sum + c.credits,
                      0
                    );
                    const totalPoints = rec.courses.reduce((sum, c) => {
                      const base =
                        { A: 4, B: 3, C: 2, D: 1, F: 0 }[
                          c.grade.toUpperCase()
                        ] || 0;
                      const boost =
                        c.type === "honors" ? 0.5 : c.type === "ap" ? 1 : 0;
                      return sum + (base + boost) * c.credits;
                    }, 0);
                    const gpa =
                      totalCredits > 0
                        ? (totalPoints / totalCredits).toFixed(2)
                        : "0.00";
                    return gpa;
                  })()}
                </p>

                {(() => {
                  const { gpa, credits } = calculateCumulativeStatsUpTo(
                    draft.records,
                    recIdx
                  );
                  return (
                    <div className="mt-1 text-sm text-gray-700 italic">
                      <p>
                        <strong>Cumulative GPA:</strong> {gpa.toFixed(2)}
                      </p>
                      <p>
                        <strong>Cumulative Credits:</strong>{" "}
                        {credits.toFixed(2)}
                      </p>
                    </div>
                  );
                })()}
              </div>
            </DroppableTerm>
          ))}{" "}
          <DragOverlay>
            {activeDrag ? (
              <div className="bg-blue-100 border grid grid-cols-6">
                <div className="px-2">
                  <GripVerticalIcon fontSize={8} />
                </div>
                <div className="border p-1">{activeDrag.course.name}</div>
                <div className="border p-1">{activeDrag.course.grade}</div>
                <div className="border p-1">{activeDrag.course.credits}</div>
                <div className="border p-1 capitalize">
                  {activeDrag.course.type}
                </div>
                <div className="border p-1 text-center">
                  <Trash2Icon fontSize={8} />
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        <button
          onClick={addTerm}
          className="mt-2 px-3 py-1 bg-blue-100 rounded"
        >
          + Add Term
        </button>
      </section>

      <button
        onClick={onSave}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Save Transcript
      </button>
    </div>
  );
}
