import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranscriptStore } from "../../../stores/transciptStore";
import { apiClient } from "../../../config/axiosConfig";
import { IYearRecord } from "../../../types/transcript";

export default function TranscriptDetail() {
  const { id } = useParams();
  const {
    selectedTranscript,
    fetchTranscriptById,
    downloadTranscriptPDF,
    loading,
    error,
  } = useTranscriptStore();

  useEffect(() => {
    if (id) fetchTranscriptById(id);
    console.log("Transcript ID:", id);
  }, [id, fetchTranscriptById]);

  if (loading || !selectedTranscript)
    return <div className="p-6 text-center text-gray-500">Loading...</div>;
  if (error)
    return <div className="p-6 text-center text-red-600">Error: {error}</div>;

  const { student, cumulativeGPA, cumulativeCredits, records } =
    selectedTranscript;

  if (!records || !Array.isArray(records)) {
    return <div className="text-red-500">Invalid transcript data</div>;
  }

  const safeRecords = records ?? [];
  const pairedRecords = [];
  for (let i = 0; i < safeRecords.length; i += 2) {
    pairedRecords.push(safeRecords.slice(i, i + 2));
  }

  const handleDownload = async () => {
    try {
      await downloadTranscriptPDF(selectedTranscript._id);

      // handleDownloadPDF(pdf);
    } catch (error) {
      console.error("PDF generation failed:", error);
    }
  };

  const handleDownloadLogo = async () => {
    try {
      await downloadTranscriptPDF(selectedTranscript._id, true);
    } catch (error) {
      console.error("PDF generation failed:", error);
    }
  };

  const previewWithLogo = async () => {
    try {
      const res = await apiClient.get(
        `/transcripts/pdf/${selectedTranscript._id}?logo=true`,
        {
          responseType: "blob",
        }
      );

      if (res.status !== 200) {
        console.error("PDF preview failed:", res.status);
        return;
      }

      const blob = new Blob([res.data], { type: "application/pdf" });

      if (blob.size === 0) {
        console.error("PDF blob is empty");
        return;
      }

      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");

      // Optionally revoke later
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (err) {
      console.error("Failed to preview PDF:", err);
    }
  };

  function calculateCumulativeUpTo(
    records: IYearRecord[] | Partial<IYearRecord>[],
    index: number
  ) {
    let totalPoints = 0;
    let totalCredits = 0;

    for (let i = 0; i <= index; i++) {
      const rec = records[i];
      for (const c of rec?.courses ?? []) {
        const base =
          { A: 4, B: 3, C: 2, D: 1, F: 0 }[c.grade.toUpperCase()] || 0;
        const boost = c.type === "honors" ? 0.5 : c.type === "ap" ? 1.0 : 0;
        totalPoints += (base + boost) * c.credits;
        totalCredits += c.credits;
      }
    }

    const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    return {
      cumulativeGPA: +gpa.toFixed(2),
      cumulativeCredits: +totalCredits.toFixed(2),
    };
  }


  const handleEdit = () => {
    window.location.href = `/dashboard/transcripts/edit/${selectedTranscript._id}`;
  };

  return (
    <>
      {/* All PDF info goes inside this container */}
       <div className="container mx-auto mb-6 flex justify-end">
          <button 
           className="px-4 py-2 text-white uppercase bg-pink-500 border-2 border-transparent rounded-lg text-md hover:bg-pink-400"
           onClick={handleEdit}>
           Edit
          </button>
        </div>
      <div
        id="transcript"
        className="max-w-5xl mx-auto bg-white p-8 border border-gray-300 shadow"
      >
       
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold uppercase tracking-wide">
            Official High School Transcript
          </h2>
        </div>

        {/* Student Information */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h2 className="font-semibold text-gray-700 mb-1">
              Student Information
            </h2>
            <p className="text-gray-800">
              {student.firstName} {student.lastName}
            </p>
            <p className="text-gray-600">{student.address ?? "N/A"}</p>
            <p className="text-gray-600">
              {student.city}, {student.state} {student.zip ?? "N/A"}
            </p>
            <p className="text-gray-600">{student.country ?? "N/A"}</p>
           
            <p className="text-gray-600">{student.phone ?? "N/A"}</p>
            <p className="text-gray-600">
              Date of Birth:{" "}
              {student.dob ? new Date(student.dob).toLocaleDateString() : "N/A"}
            </p>
            <p className="text-gray-600">
              Parent/Guardian: {student.parentGuardian ?? "N/A"}
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-gray-700 mb-1">
              School Information
            </h2>
            <p className="text-gray-800">Sterling Academy</p>
            <p className="text-gray-600">Contact: Rebecca Chiu</p>
            <p className="text-gray-600">
              950 South Pine Island Road, Suite A150
            </p>
            <p className="text-gray-600">Plantation, Florida 33324</p>
            <p className="text-gray-600">626-360-8012</p>
            <p className="text-gray-600">registration@sterling.academy</p>
          </div>
        </div>

        {/* Academic Records */}
        <h2 className="text-md font-semibold uppercase mb-4">
          Official Academic Record
        </h2>
        {pairedRecords.map((pair, i) => (
          <div
            key={i}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-sm"
          >
            {pair.map((record) => (
              <div key={record?.gradeLevel}>
                <h3 className="font-bold text-gray-700 mb-2">
                  Grade Level {record?.gradeLevel} ({record?.startYear ?? "N/A"}{" "}
                  - {record?.endYear ?? "N/A"})
                </h3>
                <table className="w-full border text-sm mb-2">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-2 py-1 text-left">
                        Course Name
                      </th>
                      <th className="border px-2 py-1 text-center">
                        Final Grade
                      </th>
                      <th className="border px-2 py-1 text-center">Credits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.courses?.map((course, idx) => (
                      <tr key={idx}>
                        <td className="border px-2 py-1">{course.name}</td>
                        <td className="border px-2 py-1 text-center">
                          {course.grade}
                        </td>
                        <td className="border px-2 py-1 text-center">
                          {course.credits.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(() => {
                  const { cumulativeGPA, cumulativeCredits } =
                    calculateCumulativeUpTo(
                      records,
                      records.indexOf(record as IYearRecord)
                    );
                  return (
                    <>
                      <p>
                        <strong>Term GPA:</strong>{" "}
                        {(record.gpa ?? 0).toFixed(2)} |{" "}
                        <strong>Term Credits:</strong>{" "}
                        {(record.totalCredits ?? 0).toFixed(2)}
                      </p>
                      <p>
                        <strong>Cumulative GPA:</strong>{" "}
                        {cumulativeGPA.toFixed(2)} |{" "}
                        <strong>Cumulative Credits:</strong>{" "}
                        {cumulativeCredits.toFixed(2)}
                      </p>
                    </>
                  );
                })()}
              </div>
            ))}
          </div>
        ))}

        {/* Academic Summary */}
        <h2 className="text-md font-semibold uppercase mb-2">
          Academic Summary
        </h2>
        <div className="text-sm mb-6">
          <p>
            <strong>Overall GPA:</strong> {cumulativeGPA.toFixed(2)}
          </p>
          <p>
            <strong>Credits Earned:</strong> {cumulativeCredits.toFixed(2)}
          </p>
          <p>
            <strong>9th Grade Start Date:</strong>{" "}
            {student.startDate
              ? new Date(student.startDate).toLocaleDateString()
              : "N/A"}
          </p>
          <p>
            <strong>Graduation Date:</strong>{" "}
            {student.graduationDate
              ? new Date(student.graduationDate).toLocaleDateString()
              : "N/A"}
          </p>
          <p className="italic text-xs text-gray-500 mt-1">
            * Honors = 0.5 boost, AP = 1.0 boost
          </p>
        </div>

        {/* Certification */}
        <div className="text-sm border-t pt-4 mt-6">
          <p>
            I certify and affirm that this is the official
            transcript and record of{" "}
            <strong>
              {student.firstName} {student.lastName}
            </strong>{" "}
            in the academic studies of 2021–2025.
          </p>
          <p className="mt-4">{new Date().toLocaleDateString()}</p>
          <p>Student Services Date</p>
        </div>
      </div>

      {/* PDF and Print and Preview buttons */}
      <div className="mt-6 text-right max-w-5xl mx-auto">
        <button
          type="button"
          aria-label="Download PDF"
          onClick={handleDownload}
          className="ml-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Download PDF
        </button>

        <button
          type="button"
          aria-label="Download PDF"
          onClick={handleDownloadLogo}
          className="ml-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Download Styled
        </button>

        <button
          type="button"
          onClick={previewWithLogo}
          className="ml-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Preview
        </button>
      </div>
    </>
  );
}
