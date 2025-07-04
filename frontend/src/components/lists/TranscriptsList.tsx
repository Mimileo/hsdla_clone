import { useEffect } from "react";
import { useTranscriptStore } from "../../stores/transciptStore";
export default function TranscriptsList() {
  const { transcripts, fetchAllTranscripts, loading, error } = useTranscriptStore();

  useEffect(() => {
    fetchAllTranscripts();
  }, []);

  if (loading) return <p>Loading transcripts...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">All Transcripts</h2>
      <ul className="space-y-4">
        {transcripts.map((t) => (
          <li key={t._id} className="border p-4 rounded bg-white shadow">
            <div><strong>Student:</strong> {t.student.firstName} {t.student.lastName}</div>
            <div><strong>GPA:</strong> {t.cumulativeGPA}</div>
            <div><strong>Credits:</strong> {t.cumulativeCredits}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
