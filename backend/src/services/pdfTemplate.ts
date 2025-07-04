import User, { IUser } from '../models/User';
import { ITranscript } from '../models/Transcript';

export const renderTranscriptHTML = async (transcript: ITranscript): Promise<string> => {
  const student = await User.findById(transcript.student);

  if (!student) {
    throw new Error('Student not found');
  }

  return `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            line-height: 1.6;
          }
          h1, h2 {
            text-align: center;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          td, th {
            border: 1px solid #333;
            padding: 8px;
            text-align: left;
          }
          .summary {
            margin-top: 40px;
          }
        </style>
      </head>
      <body>
        <h1>Official High School Transcript</h1>

        <h2>Student Information</h2>
        <p><strong>Name:</strong> ${student.firstName} ${student.lastName}</p>
        <p><strong>Address:</strong> ${student.address ?? 'N/A'}</p>
        <p><strong>Date of Birth:</strong> ${student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'}</p>
        <p><strong>Email:</strong> ${student.email}</p>
        <p><strong>Phone:</strong> ${student.phone ?? 'N/A'}</p>
        <p><strong>Parent/Guardian:</strong> ${student.parentGuardian ?? 'N/A'}</p>

        ${transcript.records.map((year: any) => `
          <h3>Grade Level ${year.gradeLevel}</h3>
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Grade</th>
                <th>Credits</th>
              </tr>
            </thead>
            <tbody>
              ${year.courses.map((course: any) => `
                <tr>
                  <td>${course.name}</td>
                  <td>${course.grade}</td>
                  <td>${course.credits}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p><strong>Total GPA:</strong> ${year.gpa}</p>
          <p><strong>Total Credits:</strong> ${year.totalCredits}</p>
        `).join('')}

        <div class="summary">
          <h2>Academic Summary</h2>
          <p><strong>Cumulative GPA:</strong> ${transcript.cumulativeGPA}</p>
          <p><strong>Cumulative Credits:</strong> ${transcript.cumulativeCredits}</p>
          <p><strong>Start Date:</strong> ${student.startDate ? new Date(student.startDate).toLocaleDateString() : 'N/A'}</p>
          <p><strong>Projected Graduation:</strong> ${student.graduationDate ? new Date(student.graduationDate).toLocaleDateString() : 'N/A'}</p>
        </div>

        <p style="margin-top: 50px;">I do hereby self-certify and affirm that this is the official transcript and record of ${student.firstName} ${student.lastName}.</p>
        <p>Date: ${new Date().toLocaleDateString()}</p>
      </body>
    </html>
  `;
};
