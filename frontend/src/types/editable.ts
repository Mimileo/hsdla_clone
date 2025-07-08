import { ICourse, IYearRecord } from "./transcript";
import { IUser } from "./user";

export type EditableCourse = Omit<ICourse, "_id"> & {
  _id: string;
  localId?: string;
  name: string;
  grade: string;
  credits: number;
  type: "normal" | "honors" | "ap";
};

export type EditableRecord = Omit<IYearRecord, "gpa" | "totalCredits"> & {
  gradeLevel: number;
  startYear?: number;
  endYear?: number;
  courses: EditableCourse[];
};

export type EditableTranscript = {
  _id: string;
  student: Partial<IUser> & {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    phone?: string;
    dob?: string; // yyyy-mm-dd
    parentGuardian?: string;
    startDate?: string; // yyyy-mm-dd
    graduationDate?: string; // yyyy-mm-dd
  };
  records: EditableRecord[];
};

