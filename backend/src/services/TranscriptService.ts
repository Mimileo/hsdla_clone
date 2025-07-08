import { isValidObjectId } from "mongoose";
import Transcript from "../models/Transcript";

export const findTranscriptById = async (id: string) => {
    const transcript = await Transcript.findById(id).populate("student");
    return transcript;
};

export const findTranscriptByStudentId = async (studentId: string) => {
    const transcript = await Transcript.findOne({ student: studentId }).populate("student");
    return transcript;
};

export const findTranscriptByStudentEmail = async (email: string) => {
    const transcript = await Transcript.findOne({ student: email }).populate("student");
    return transcript;
}

export const deleteTranscript = async (id: string) => {
   try {

    if(!id) {
        return null;
    }

    if (!isValidObjectId(id)) {
        console.error("Invalid transcript ID:", id);
        return null;
    }
    
    const transcript = await Transcript.findByIdAndDelete(id);
    return transcript;
   } catch (err) {
    console.error("Error deleting transcript:", err);
   }
};
