import { CourseType, ICourse } from "../models/Transcript";

// services/gpaCalculator.ts
export function getGPAFromLetter(grade: string, type: CourseType): number {
  const cleanGrade = grade?.toUpperCase();
  const cleanType = type?.toLowerCase() as CourseType;

  const baseMap: Record<string, number> = {
    A: 4.0,
    B: 3.0,
    C: 2.0,
    D: 1.0,
    F: 0.0
  };

  const boostMap: Record<CourseType, number> = {
    normal: 0.0,
    honors: 0.5,
    ap: 1.0
  };

  const base = baseMap[cleanGrade] ?? 0.0;
  const boost = boostMap[cleanType] ?? 0.0;

  return base + boost;
}


export function calculateYearGPA(courses: ICourse[]): { gpa: number, credits: number } {
  let totalPoints = 0;
  let totalCredits = 0;

  for (const course of courses) {
    if (!course.grade || typeof course.credits !== 'number' || !course.type) {
      continue; // skip invalid courses
    }

    const courseGPA = getGPAFromLetter(course.grade, course.type);

    if (isNaN(courseGPA)) continue;

    totalPoints += courseGPA * course.credits;
    totalCredits += course.credits;
  }

  if (totalCredits === 0) return { gpa: 0, credits: 0 };

  const gpa = totalPoints / totalCredits;
  return { gpa: parseFloat(gpa.toFixed(2)), credits: totalCredits };
}
