// models/Transcript.ts
import mongoose, { Schema, Document } from "mongoose";

export type CourseType = "normal" | "honors" | "ap";

export interface ICourse {
    _id?: mongoose.Schema.Types.ObjectId;
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
  _id: mongoose.Schema.Types.ObjectId;
  student: mongoose.Schema.Types.ObjectId;
  records: IYearRecord[];
  cumulativeGPA: number;
  cumulativeCredits: number;
}

const courseSchema = new Schema<ICourse>({
  name: { type: String, required: true },
  grade: { type: String, required: true },
  credits: { type: Number, required: true },
  type: {
    type: String,
    enum: ["normal", "honors", "ap"], // lowercase
    default: "normal",
  },
});

const yearRecordSchema = new Schema<IYearRecord>({
  gradeLevel: { type: Number, required: true },
  courses: [courseSchema],
  startYear: { type: Number, required: true },
  endYear: { type: Number, required: true },
  gpa: { type: Number, required: true },
  totalCredits: { type: Number, required: true },
});

const transcriptSchema = new Schema<ITranscript>({
  student: { type: Schema.Types.ObjectId, ref: "User", required: true },
  records: [yearRecordSchema],
  cumulativeGPA: { type: Number, required: true },
  cumulativeCredits: { type: Number, required: true },
});

const Transcript = mongoose.model<ITranscript>("Transcript", transcriptSchema);

export default Transcript;
