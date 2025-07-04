export const calculateGPA = (
  courses: {
    finalGrade: string;
    credits: number;
    isHonors?: boolean;
    isAP?: boolean;
  }[]
): number => {
  const gradeMap: Record<string, number> = { A: 4, B: 3, C: 2, D: 1, F: 0 };

  let totalPoints = 0;
  let totalCredits = 0;

  for (const course of courses) {
    let base = gradeMap[course.finalGrade.toUpperCase()] ?? 0;
    if (course.isHonors) base += 0.5;
    if (course.isAP) base += 1;
    const weighted = Math.min(base, 5) * course.credits;

    totalPoints += weighted;
    totalCredits += course.credits;
  }

  return totalCredits ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0;
};
