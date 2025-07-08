import { ITranscript } from "../models/Transcript";
import User from "../models/User";

const formatDate = (date: Date | string | undefined | null): string => {
  if (!date) return "N/A";
  const d = new Date(date);
  return isNaN(d.getTime())
    ? "Invalid Date"
    : d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
};

export const renderUnofficialTranscriptHTML = async (
  transcript: ITranscript,
  options: { showLogo?: boolean } = {}
): Promise<string> => {
  const studentOntranscript = transcript.student;
  const student = await User.findById(studentOntranscript);
  if (!student || typeof student !== "object") {
    throw new Error("Student data missing or not populated");
  }

  const maxTerms = 4;
  const baseGrade = 9;
  const terms = [...transcript.records];

  // get start year
  const startYear = student.startDate
    ? new Date(student.startDate).getFullYear()
    : new Date().getFullYear();

  // add remaining terms
  while (terms.length < maxTerms) {
    const nextGrade = baseGrade + terms.length;
    terms.push({
      gradeLevel: nextGrade,
      startYear: startYear + terms.length,
      endYear: startYear + terms.length,
      courses: [],
      gpa: 0,
      totalCredits: 0,
    });
  }

  const rows = [];
  for (let i = 0; i < maxTerms; i += 2) {
    rows.push(terms.slice(i, i + 2));
  }

  let cumulativeCreditsSoFar = 0;
  let cumulativePointsSoFar = 0;

  function getCumulativeStats(termIndex: number) {
    const term = terms[termIndex];
    const termPoints = term.courses.reduce((sum, c) => {
      const base = { A: 4, B: 3, C: 2, D: 1, F: 0 }[c.grade.toUpperCase()] || 0;
      const boost = c.type === "honors" ? 0.5 : c.type === "ap" ? 1.0 : 0;
      return sum + (base + boost) * c.credits;
    }, 0);
    const termCredits = term.courses.reduce((sum, c) => sum + c.credits, 0);

    cumulativePointsSoFar += termPoints;
    cumulativeCreditsSoFar += termCredits;

    const cumulativeGPA =
      cumulativeCreditsSoFar > 0
        ? cumulativePointsSoFar / cumulativeCreditsSoFar
        : 0;

    return {
      termGPA: term.gpa ?? (termCredits ? termPoints / termCredits : 0),
      termCredits,
      cumulativeGPA,
      cumulativeCredits: cumulativeCreditsSoFar,
    };
  }

  function getTermYears(term: typeof terms[number], fallbackIndex: number) {
  const fallbackStart = startYear + fallbackIndex;
  const start = term.startYear ?? fallbackStart;
  const end = term.endYear ?? start + 1;
  return { start, end };
}


  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Transcript PDF</title>
      <style>
        body {
          font-family: 'Georgia', serif;
          font-size: 10pt;
          margin: 10px;
          color: #111;
        }

        #transcript-container {
          max-width: 750px;
          margin: auto;
        }

        .logo {
          text-align: center;
          margin-bottom: 12px;
        }

        .logo img {
          max-height: 60px;
        }

        h1, #transcript-title {
          text-align: center;
          font-size: 12pt;
          margin-bottom: 10px;
        }

        h2 {
          font-size: 9pt;
          margin-bottom: 8px;
          border-bottom: 1px solid #999;
          padding-bottom: 4px;
        }

        h3 {
          font-size: 9pt;
          margin: 8px 0 4px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 16px;
        }

        .info-col {
          flex: 1;
          font-size: 9pt;
        }

        .info-col p {
          margin: 2px 0;
        }

        .records-row {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 12px;
        }

        .term {
          flex: 1;
          font-size: 9pt;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 8.5pt;
          margin-bottom: 4px;
        }

        th, td {
          border: 1px solid #888;
          padding: 4px;
        }

        th {
          background: #f2f2f2;
          text-align: center;
        }

        td:nth-child(2), td:nth-child(3) {
          text-align: center;
        }

        .summary, .certify {
          margin-top: 12px;
          font-size: 9.5pt;
        }

        .summary p, .certify p {
          margin: 4px 0;
        }

        .italic {
          font-style: italic;
          color: #666;
          font-size: 8pt;
        }

       .signature-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30px;
  max-width: 500px;
}

.signature-block {
  width: 250px;
  text-align: center;
  font-size: 9pt;
  color: #333;
}

.signature-line {
  border-bottom: 1px solid #333;
  margin-bottom: 4px;
  height: 2px;
}

.signature-date {
  font-size: 9pt;
  color: #333;
  padding-left: 20px;
  white-space: nowrap;
}

.right-note {
  float: right;
  font-style: italic;
  color: #666;
  font-size: 8pt;
}



      </style>
    </head>
    <body>
      <div id="transcript-container">
        ${
          options.showLogo
            ? `
          <div class="logo">
            <img src="https://www.sterling.academy/hubfs/sa_logo_resized.png" alt="Sterling Academy Logo" />
          </div>
        `
            : ""
        }

        <h2 id="transcript-title">Unofficial High School Transcript</h2>

        <div class="info-row">
          <div class="info-col">
            <h2>Student Information</h2>
            <p><strong>Name:</strong> ${student.firstName} ${
    student.lastName
  }</p>
            <p>${student.address ?? "N/A"}</p>
            <p>${student.city ?? ""}, ${student.state ?? ""} ${
    student.zip ?? ""
  }</p>
            <p><strong>Phone:</strong> ${student.phone ?? "N/A"}</p>
            <p><strong>DOB:</strong> ${formatDate(student.dob) ?? "N/A"}</p>
            <p><strong>Guardian:</strong> ${student.parentGuardian ?? "N/A"}</p>
          </div>

          <div class="info-col">
            <h2>School Information</h2>
            <p>Sterling Academy</p>
            <p>Rebecca Chiu</p>
            <p>950 South Pine Island Rd, Suite A150</p>
            <p>Plantation, FL 33324</p>
            <p>626-360-8012</p>
            <p>registration@sterling.academy</p>
          </div>
        </div>

        <h2>Academic Record</h2>

        ${rows
          .map(
            (row, rowIndex) => `
          <div class="records-row">
            ${row
              .map((term, i) => {
                const { start, end } = getTermYears(term, rowIndex * 2 + i);

                const termIndex = rowIndex * 2 + i;
                const stats = getCumulativeStats(termIndex);

                return `
                <div class="term">
                 <h3>Grade ${term.gradeLevel} (${start}–${end})</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Course</th>
                        <th>Grade</th>
                        <th>Credits</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${
                        term.courses.length > 0
                          ? term.courses
                              .map(
                                (c) => `
                            <tr>
                              <td>${c.name}</td>
                              <td>${c.grade}</td>
                              <td>${c.credits.toFixed(2)}</td>
                            </tr>
                          `
                              )
                              .join("")
                          : `<tr><td colspan="3" class="italic">No courses recorded</td></tr>`
                      }
                    </tbody>
                  </table>


                  <div style="margin-top: 6px; font-size: 8.5pt; color: #222;">

                        <p>
                            <strong>Term GPA:</strong> ${stats.termGPA.toFixed(2)} |
                            <strong>Term Credits:</strong> ${stats.termCredits.toFixed(2)}
                        </p>

                        <p>
                            <strong>Cumulative GPA:</strong> ${stats.cumulativeGPA.toFixed(2)} |
                            <strong>Cumulative Credits:</strong> ${stats.cumulativeCredits.toFixed(2)}
                        </p>

                    </div>

                 
                </div>
              `;
              })
              .join("")}
          </div>
        `
          )
          .join("")}

        <div class="summary">
          <h2>Academic Summary</h2>
          <p><strong>Overall GPA:</strong> ${transcript.cumulativeGPA.toFixed(
            2
          )}</p>
                    <span class="italic right-note">* Honors = +0.5, AP = +1.0 GPA boost</span>

          <p><strong>Total Credits:</strong> ${transcript.cumulativeCredits.toFixed(
            2
          )}</p>
          <p><strong>Start Date:</strong> ${
            student.startDate
              ? new Date(student.startDate).toLocaleDateString()
              : "N/A"
          }</p>
          <p><strong>Graduation:</strong> ${
            student.graduationDate
              ? new Date(student.graduationDate).toLocaleDateString()
              : "N/A"
          }</p>
        </div>

        <div class="certify">
          <p>Coursework completed by <strong>${student.firstName} ${
    student.lastName
  }</strong> from ${startYear}–${startYear + 4}.</p>
        
          <div class="signature-row">
            <div class="signature-block">
            <div class="signature-line"></div>
            <p>***Unofficial Transcript - This is not an official transcript unless signed by an authorized representative***</p>
            </div>
             
            <div class="signature-date">
            ${new Date().toLocaleDateString()}
            </div>
        </div>

      </div>
    </body>
  </html>
  `;
};
