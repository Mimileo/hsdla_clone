import { DragProps } from "@/types/drag";
import { EditableCourse } from "@/types/editable";
import { GripVerticalIcon, Trash2Icon } from "lucide-react";
import { memo, useEffect, useState } from "react";



type CourseRowProps = {
  recIdx: number;
  courseIdx: number;
  course: EditableCourse;
  updateCourse: (
    recIdx: number,
    courseIdx: number,
    key: keyof EditableCourse,
    val: EditableCourse[keyof EditableCourse]
  ) => void;
  removeCourse: (recIdx: number, courseId: string) => void;
  dragProps: DragProps;
};


const CourseRow = memo(function CourseRow({
  recIdx,
  courseIdx,
  course,
  updateCourse,
  removeCourse,
  dragProps,
}: CourseRowProps) {
  const { ref, style, listeners, attributes, isDragging } = dragProps;

  const [localCourse, setLocalCourse] = useState<EditableCourse>(course);

  // Sync when prop course changes (e.g., due to external update)
  useEffect(() => {
    setLocalCourse(course);
  }, [course]);

  // Call updateCourse only if the value changed
  function syncField<K extends keyof EditableCourse>(
    key: K,
    val: EditableCourse[K]
  ) {
    if (course[key] !== val) {
      updateCourse(recIdx, courseIdx, key, val);
    }
  }

  return (
    <tr
      ref={ref}
      style={{ ...style, visibility: isDragging ? "hidden" : "visible" }}
      {...attributes}
      {...listeners}
    >
      <td className="cursor-grab px-2">
        <GripVerticalIcon fontSize={8} />
      </td>
      <td className="border p-1" onPointerDown={(e) => e.stopPropagation()}>
        <input
          aria-label="name"
          className="w-full"
          value={localCourse.name}
          onChange={(e) =>
           // updateCourse(recIdx, courseIdx, "name", e.target.value)
           setLocalCourse({ ...localCourse, name: e.target.value })
          }
          onBlur={() => syncField("name", localCourse.name)}
        />
      </td>
      <td className="border p-1" onPointerDown={(e) => e.stopPropagation()}>
        <input
          aria-label="grade"
          className="w-12 text-center"
          maxLength={2}
          value={localCourse.grade}
          onChange={(e) =>
           /* updateCourse(
              recIdx,
              courseIdx,
              "grade",
              e.target.value.toUpperCase()
            )*/
            setLocalCourse({ ...localCourse, grade: e.target.value.toUpperCase() })
          }
          onBlur={() => syncField("grade", localCourse.grade)}
        />
      </td>
      <td className="border p-1" onPointerDown={(e) => e.stopPropagation()}>
        <input
          aria-label="credits"
          type="number"
          step="0.25"
          className="w-16 text-center"
          value={localCourse.credits}
          onChange={(e) =>
            //updateCourse(recIdx, courseIdx, "credits", Number(e.target.value))
            setLocalCourse({ ...localCourse, credits: Number(e.target.value) })
          }
          onBlur={() => syncField("credits", localCourse.credits)}
        />
      </td>
      <td className="border p-1" onPointerDown={(e) => e.stopPropagation()}>
        <select
          name="type"
          aria-label="type"
          className="w-full"
          value={localCourse.type}
          onChange={(e) =>
            //updateCourse(recIdx, courseIdx, "type", e.target.value)
            setLocalCourse({ ...localCourse, type: e.target.value })
          }
          onBlur={() => syncField("type", localCourse.type)}
        >
          <option value="normal">Normal</option>
          <option value="honors">Honors</option>
          <option value="ap">AP</option>
        </select>
      </td>
      <td className="border p-1 text-center">
        <button
          aria-label="remove course"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm("Are you sure you want to remove this course?")) {
              removeCourse(recIdx, course._id);
            }
          }}
          className="text-red-600"
        >
          <Trash2Icon className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
});

export default CourseRow;
