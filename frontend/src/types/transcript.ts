import { IUser } from "./user";

export type CourseType = 'normal' | 'honors' | 'ap';

export interface ICourse {
 _id: string;
  name: string;
  grade: string; // A, B, C, etc.
  credits: number;
  type: CourseType; 
}

export interface IYearRecord {
  gradeLevel: number; // 9, 10, 11, 12
  courses: ICourse[];
  gpa: number;
  startYear: number;
  endYear: number;
  totalCredits: number;
}


export interface ITranscript extends Document {
  _id: string;
  student: IUser | Partial<IUser>;
  records: IYearRecord[];
  cumulativeGPA: number;
  cumulativeCredits: number;
}