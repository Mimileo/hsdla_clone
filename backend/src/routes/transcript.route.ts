import express from "express";
import { verifyToken, requireRole } from "../middleware/auth";
import { calculateYearGPA } from "../services/gpaCalculator";
import User from "../models/User";
import puppeteer from "puppeteer";
import { renderTranscriptHTML } from "../services/pdfTemplate";
import Transcript, { ICourse } from "../models/Transcript";
import mongoose from "mongoose";
import  dotenv from "dotenv";
dotenv.config();

const router = express.Router();


function isValidObjectId(id: string | mongoose.Types.ObjectId): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

router.get(
  "/transcripts/all",
  verifyToken,
  requireRole("admin", "teacher"),
  async (req, res) => {
    try {
      const transcripts = await Transcript.find().populate("student");
      res.json(transcripts);
    } catch (err) {
      res
        .status(500)
        .json({ error: "Failed to fetch transcripts", details: err });
    }
  }
);

router.get(
  "/transcripts/:id",
  verifyToken,
  requireRole("admin", "teacher"),
  async (req, res) => {
    try {
      const transcript = await Transcript.findById(req.params.id).populate(
        "student"
      );
      res.json(transcript);
    } catch (err) {
      res
        .status(500)
        .json({ error: "Failed to fetch transcript", details: err });
    }
  }
)



router.post(
  "/transcripts/create",
  verifyToken,
  requireRole("admin", "teacher"),
  async (req, res) => {
    try {
      const { student: studentData, records } = req.body;

      

      //  to lowercase to match enum
        for (const year of records) {
        for (const course of year.courses) {
            if (course.type) {
            course.type = course.type.toLowerCase(); // ensures it matches 'normal' | 'honors' | 'ap'
            }
        }
        }


      // Try to find the student by email 
      let student = await User.findOne({ email: studentData.email.toLowerCase() });


      if (!student) {
        // Create minimal user with temporary hashed password
        const tempPassword = "student";
      

        student = new User({
          email: studentData.email.toLowerCase(),
          dob: studentData.dob,
          phone: studentData.phone,
          startDate: studentData.startDate,
          graduationDate: studentData.graduationDate,
          parentGuardian: studentData.parentGuardian,
          address: studentData.address,
          city: studentData.city,
          state: studentData.state,
          zip: studentData.zip,
          country: studentData.country,
          firstName: studentData.firstName || "FirstName",
          lastName: studentData.lastName || "LastName",
          password: tempPassword,
          roles: ["user"], // default role
        
        });

        await student.save();
      }


      // allow only these fields to be updated
       const updatableFields = [
        "firstName", "lastName", "dob", "phone", "startDate",
        "graduationDate", "parentGuardian", "address", "city",
        "state", "zip", "country"
        ];

        for (const key of updatableFields) {
            if (studentData[key] !== undefined) {
                (student as any)[key] = studentData[key]; // type assertion
            }
        }

        await student.save();


     

      // Calculate per-year GPA and total credits
      let cumulativeGPA = 0;
      let cumulativeCredits = 0;
      const processedRecords = [];

      for (const record of records) {
        const { gpa, credits } = calculateYearGPA(record.courses);
        cumulativeGPA += gpa * credits;
        cumulativeCredits += credits;
        processedRecords.push({
          gradeLevel: record.gradeLevel,
          startYear: record.startYear,
          endYear: record.endYear,
          courses: record.courses,
          gpa,
          totalCredits: credits,
        });
      }

      const finalGPA =
        cumulativeCredits === 0
          ? 0
          : parseFloat((cumulativeGPA / cumulativeCredits).toFixed(2));

      const transcript = await Transcript.create({
        student: student._id,
        records: processedRecords,
        cumulativeGPA: finalGPA,
        cumulativeCredits,
      });

      res.status(201).json(transcript);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ error: "Failed to create transcript", details: err });
    }
  }
);

router.get(
  "/transcripts/pdf/:id",
  verifyToken,
  requireRole("admin", "teacher"),
  async (req, res): Promise<void> => {
    try {
      const transcript = await Transcript.findById(req.params.id).populate("student");
      if (!transcript) {
        res.status(404).json({ error: "Transcript not found" });
        return;
      }

      // Parse the query parameter: ?logo=true
      const showLogo = req.query.logo === "true";

      // Generate HTML with logo flag
      const html = await renderTranscriptHTML(transcript, { showLogo });
      console.log(html);

      if (!html) {
        res.status(500).json({ error: "Failed to generate HTML" });
        return;
      }

      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      });
      const page = await browser.newPage();

      await page.setContent(html, { waitUntil: "networkidle0" });

      const pdfBuffer = await page.pdf({
        format: "letter",
        printBackground: true,
        margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
      });

      await browser.close();

      const student = await User.findById(transcript.student);

      if (!student) {
        res.status(404).json({ error: "Student not found" });
        return;
      }
      const studentName = `${student?.firstName}_${student?.lastName}`.replace(/\s+/g, "_");

      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${studentName}_Transcript.pdf"`,
        "Content-Length": pdfBuffer.length,
      });

      res.send(pdfBuffer);
    } catch (err) {
      console.error("PDF generation failed:", err);
      res.status(500).json({ error: "Failed to generate PDF" });
      return;
    }
    return;
  }
);

router.patch(
  "/transcripts/:id",
  verifyToken,
  requireRole("admin", "teacher"),
  async (req, res): Promise<void> => {
    try {

      const { records, ...rest } = req.body;

      if(!records || !Array.isArray(records)) {
        res.status(400).json({ error: "Records must be an array" });
        return;
      }


      // clean up records

      const sanitizedRecords = records.map((record) => ({
        ...record,
        courses: record.courses.map((course: ICourse) => {
          // If _id missing or invalid, assign a new ObjectId
          if (!course._id || !isValidObjectId(course._id.toString())) {
            return { ...course, _id: new mongoose.Types.ObjectId() };
          }
          // Otherwise keep the existing ObjectId string
          return course;
        }),
      }));
      

      // update transcript
      const updated = await Transcript.findByIdAndUpdate(
        req.params.id,
        { 
            records: sanitizedRecords, 
            ...rest 
        },
        { new: true }
      ).populate("student");


      if (!updated) {
         res.status(404).json({ error: "Transcript not found" });
      }
      res.json(updated);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update transcript", details: err });
    }
  }
);


router.delete(
  "/transcripts/:id",
  verifyToken,
  requireRole("admin", "teacher"),
  async (req, res): Promise<void> => {
    try {
      const deleted = await Transcript.findByIdAndDelete(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: "Transcript not found" });
      }
      res.json(deleted);
    } catch (err) {
      res.status(500).json({ error: "Failed to delete transcript", details: err });
    }
  }
);


export default router;