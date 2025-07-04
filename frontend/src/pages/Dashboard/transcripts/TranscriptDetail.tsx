import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranscriptStore } from "../../../stores/transciptStore";
export default function TranscriptDetail() {
  const { id } = useParams();
  const { selectedTranscript, fetchTranscriptById, downloadTranscriptPDF, loading, error } = useTranscriptStore();

  useEffect(() => {
    if (id) fetchTranscriptById(id);
  }, [id, fetchTranscriptById]);

  if (loading || !selectedTranscript) return <div className="p-6 text-center text-gray-500">Loading...</div>;
  if (error) return <div className="p-6 text-center text-red-600">Error: {error}</div>;

  const { student, cumulativeGPA, cumulativeCredits, records } = selectedTranscript;

  // Split years into pairs: [ [9,10], [11,12] ]
  const pairedRecords = [];
  for (let i = 0; i < records.length; i += 2) {
    pairedRecords.push(records.slice(i, i + 2));
  }

  return (
    <div className="max-w-5xl mx-auto bg-white p-8 border border-gray-300 shadow">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold uppercase tracking-wide">Official High School Transcript</h1>
      </div>

      {/* Student Information */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        <div>
          <h2 className="font-semibold text-gray-700 mb-1">Student Information</h2>
          <p className="text-gray-800">{student.firstName} {student.lastName}</p>
          <p className="text-gray-600">433 Sailmaster St. Apt. A</p>
          <p className="text-gray-600">Lakeway, Texas 78734</p>
          <p className="text-gray-600">512-547-8967</p>
          <p className="text-gray-600">{student.email}</p>
          <p className="text-gray-600">Date of Birth: 11/02/2006</p>
          <p className="text-gray-600">Parent/Guardian: Lisa Mansell</p>
        </div>
        <div>
          <h2 className="font-semibold text-gray-700 mb-1">School Information</h2>
          <p className="text-gray-800">Sterling Academy</p>
          <p className="text-gray-600">Contact: Rebecca Chiu</p>
          <p className="text-gray-600">950 South Pine Island Road, Suite A150</p>
          <p className="text-gray-600">Plantation, Florida 33324</p>
          <p className="text-gray-600">626-360-8012</p>
          <p className="text-gray-600">registration@sterling.academy</p>
        </div>
      </div>

      {/* Academic Records */}
      <h2 className="text-md font-semibold uppercase mb-4">Official Academic Record</h2>
      {pairedRecords.map((pair, i) => (
        <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-sm">
          {pair.map((record) => (
            <div key={record.gradeLevel}>
              <h3 className="font-bold text-gray-700 mb-2">
                Grade Level {record.gradeLevel} ({2021 + (record.gradeLevel - 9)} - {2022 + (record.gradeLevel - 9)})
              </h3>
              <table className="w-full border text-sm mb-2">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-2 py-1 text-left">Course Name</th>
                    <th className="border px-2 py-1 text-center">Final Grade</th>
                    <th className="border px-2 py-1 text-center">Credits</th>
                  </tr>
                </thead>
                <tbody>
                  {record.courses.map((course, idx) => (
                    <tr key={idx}>
                      <td className="border px-2 py-1">{course.name}</td>
                      <td className="border px-2 py-1 text-center">{course.grade}</td>
                      <td className="border px-2 py-1 text-center">{course.credits.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p><strong>Total GPA:</strong> {record.gpa.toFixed(2)} | <strong>Credits:</strong> {record.totalCredits.toFixed(2)}</p>
              <p><strong>Cumulative GPA:</strong> {record.gpa.toFixed(2)} | <strong>Cumulative Credits:</strong> {record.totalCredits.toFixed(2)}</p>
            </div>
          ))}
        </div>
      ))}

      {/* Academic Summary */}
      <h2 className="text-md font-semibold uppercase mb-2">Academic Summary</h2>
      <div className="text-sm mb-6">
        <p><strong>Overall GPA:</strong> {cumulativeGPA.toFixed(2)}</p>
        <p><strong>Credits Earned:</strong> {cumulativeCredits.toFixed(2)}</p>
        <p><strong>9th Grade Start Date:</strong> 08/01/2021</p>
        <p><strong>Graduation Date:</strong> 04/30/2025</p>
        <p className="italic text-xs text-gray-500 mt-1">* Honors = 0.5 boost, AP = 1.0 boost</p>
      </div>

      {/* Certification */}
      <div className="text-sm border-t pt-4 mt-6">
        <p>I do hereby self-certify and affirm that this is the official transcript and record of <strong>{student.firstName} {student.lastName}</strong> in the academic studies of 2021–2025.</p>
        <p className="mt-4">06/26/2025</p>
        <p>Student Services Date</p>
      </div>

      <div className="mt-6 text-right">
        <button
          type="button"
          aria-label="Download PDF"
          onClick={() => downloadTranscriptPDF(selectedTranscript._id)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
}

