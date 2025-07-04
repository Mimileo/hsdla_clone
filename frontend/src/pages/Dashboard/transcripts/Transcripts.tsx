import { useEffect, useState } from "react";
import { useTranscriptStore } from "../../../stores/transciptStore";
import { ITranscript } from "../../../types/transcript";
import { useNavigate } from "react-router-dom";
import TranscriptUploader from "./Uploader/TranscriptUploader";

export const Transcripts = () => {
  const {
    transcripts,
    createTranscript,
    fetchTranscriptById,
    editTranscriptById,
    deleteTranscript,
    downloadTranscriptPDF,
    fetchAllTranscripts,
    loading,
    error,
  } = useTranscriptStore();

  const navigate = useNavigate();

  const [showUploader, setShowUploader] = useState(false);

  useEffect(() => {
    fetchAllTranscripts();
  }, [fetchAllTranscripts]);

  const handleView = async (id: string) => {
    try {
      const transcript = await fetchTranscriptById(id);

      if (!transcript) {
        console.error("Transcript not found");
        return;
      }
      // found transcript so navigate to transcript page
      navigate(`/dashboard/transcripts/${id}`);
    } catch (err) {
      console.error("Error fetching transcript:", err);
    }
  };

  const handleDownload = async (id: string) => {
    await downloadTranscriptPDF(id);
  };

  const handleEdit = async (id: string) => {
    await editTranscriptById(id);
  };

  const handleDelete = async (id: string) => {
    await deleteTranscript(id);
  };

  const handleCreateTranscript = async () => {
    // await createTranscript({ data });
  };

  return (
    <div>
      <div className="flex justify-center px-4 py-6">
        <div className="w-full max-w-6xl overflow-x-auto">
          <div className="p-1.5 min-w-full inline-block align-middle">
            <div className="overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Transcripts
                </h1>

                <div className="flex justify-center">
                  <label
                    htmlFor="search"
                    className="px-4 py-2 text-white uppercase bg-pink-500 border-2 border-transparent rounded-lg text-md hover:bg-pink-400"
                  >
                    Search
                  </label>
                  <input
                    type="text"
                    name="search"
                    id="search"
                    placeholder="Search"
                    className="px-4 py-2 text-white uppercase bg-pink-500 border-2 border-transparent rounded-lg text-md hover:bg-pink-400"
                  />
                </div>
              </div>

              <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500"
                    >
                      Transcript ID
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500"
                    >
                      View
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase dark:text-neutral-500"
                    >
                      Edit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transcripts.map((transcript: ITranscript) => (
                    <tr
                      key={transcript._id}
                      className="odd:bg-white even:bg-gray-100 dark:odd:bg-neutral-900 dark:even:bg-neutral-800"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-start text-sm font-medium">
                        {transcript.student.firstName}{" "}
                        {transcript.student.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-start text-sm font-medium">
                        {transcript._id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                        <button
                          onClick={() => handleView(transcript._id.toString())}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
                        >
                          View
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                        <button
                          onClick={() => handleEdit(transcript._id.toString())}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

                <tfoot>
                  <tr>
                    <td colSpan={6}>
                      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 dark:bg-gray-800 dark:border-neutral-700">
                        <div className="flex flex-1 justify-between sm:hidden">
                          <a
                            href="#"
                            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Previous
                          </a>
                          <a
                            href="#"
                            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Next
                          </a>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="mt-4 text-right">
                <button
                  aria-label="Create transcript"
                  type="button"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleCreateTranscript}
                >
                  Create
                </button>

                <div className="mt-4 text-right">
                  <button
                    aria-label="Create transcript"
                    type="button"
                    onClick={() => setShowUploader(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                  >
                    Create Transcript via Uploader
                  </button>
                </div>
              </div>

              {showUploader && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
                  <div className="bg-white max-w-6xl w-full p-6 rounded shadow-lg z-50 relative">
                    <button
                      className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                      onClick={() => setShowUploader(false)}
                    >
                      ✕
                    </button>
                    <TranscriptUploader />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
