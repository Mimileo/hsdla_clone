export function detectGradeLevel(courseName: string, startDate: string): number {
  const name = courseName.toLowerCase();

  if (name.includes("english 1") || name.includes("algebra 1") || name.includes("biology") || name.includes("cultural geography"))
    return 9;
  if (name.includes("english 2") || name.includes("geometry") || name.includes("chemistry") || name.includes("world history"))
    return 10;
  if (name.includes("english 3") || name.includes("algebra 2") || name.includes("earth science") || name.includes("us history"))
    return 11;
  if (name.includes("english 4") || name.includes("physics") || name.includes("economics") || name.includes("government"))
    return 12;

  // Middle School
  if (name.includes("language arts 6") || name.includes("math 6")) return 6;
  if (name.includes("language arts 7") || name.includes("math 7")) return 7;
  if (name.includes("language arts 8") || name.includes("math 8")) return 8;

  // Fallback using startDate if needed
  const year = new Date(startDate).getFullYear();
  if (year <= 2020) return 9;
  if (year >= 2025) return 12;

  return 9; // fallback default
}
