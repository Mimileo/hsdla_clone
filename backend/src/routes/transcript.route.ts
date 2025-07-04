import express from "express";
import { verifyToken, requireRole } from "../middleware/auth";
import { calculateYearGPA } from "../services/gpaCalculator";
import User from "../models/User";
import puppeteer from "puppeteer";
import { renderTranscriptHTML } from "../services/pdfTemplate";
import Transcript from "../models/Transcript";

const router = express.Router();

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

      // Normalize course.type to lowercase to match enum
for (const year of records) {
  for (const course of year.courses) {
    if (course.type) {
      course.type = course.type.toLowerCase(); // ensures it matches 'normal' | 'honors' | 'ap'
    }
  }
}


      // Try to find the student by email (lowercase to be safe)
      let student = await User.findOne({ email: studentData.email.toLowerCase() });

      if (!student) {
        // Create minimal user with temporary hashed password
        const tempPassword = "student";
      

        student = new User({
          email: studentData.email.toLowerCase(),
          firstName: studentData.firstName || "FirstName",
          lastName: studentData.lastName || "LastName",
          password: tempPassword,
          roles: ["user"], // default role
        
        });

        await student.save();
      }

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
  "/transcripts/:id/pdf",
  verifyToken,
  requireRole("admin", "teacher"),
  async (req, res):  Promise<void> => {
    try {
       const transcript = await Transcript.findById(req.params.id);
       

      if (!transcript) {
         res.status(404).json({ error: "Transcript not found" });
         return;
      }

      // Generate the HTML content
      const html = await renderTranscriptHTML(transcript);

      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });

      const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
      await browser.close();

     const student = await User.findById(transcript.student);

     if (!student) {
        res.status(404).json({ error: "Student with id not found" });
        return;
     }

      const studentName =
        `${student.firstName}_${student.lastName}`.replace(
          /\s+/g,
          "_"
        );
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${studentName}_Transcript.pdf"`,
        "Content-Length": pdfBuffer.length,
      });

      res.send(pdfBuffer);
      return; // return void
    } catch (err) {
      console.error("PDF generation failed:", err);
      res.status(500).json({ error: "Failed to generate PDF" });
      return;
    }
   
  }
);

export default router;
