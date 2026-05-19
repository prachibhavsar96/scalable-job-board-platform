import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import ErrorMessage from "./ErrorMessage";

type ApplicationModalProps = {
  isSubmitting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (resume: File, coverLetter: string) => Promise<void>;
};

function ApplicationModal({
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: ApplicationModalProps) {
  const [resume, setResume] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeError, setResumeError] = useState("");

  function validateResume(file: File | null) {
    if (!file) {
      return "Resume file is required";
    }

    if (file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) {
      return "Only PDF files are allowed";
    }

    if (file.size > 5 * 1024 * 1024) {
      return "File size must be less than 5MB";
    }

    return "";
  }

  function handleResumeChange(file: File | null) {
    setResume(file);
    setResumeError(validateResume(file));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationMessage = validateResume(resume);

    if (validationMessage) {
      setResumeError(validationMessage);
      toast.error(
        validationMessage === "Resume file is required"
          ? "Resume upload failed"
          : validationMessage
      );
      return;
    }

    if (!resume) {
      return;
    }

    await onSubmit(resume, coverLetter);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Apply for job</h2>
            <p className="mt-1 text-sm text-slate-600">
              Upload your resume PDF and add a short cover letter.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        {error && (
          <div className="mb-4">
            <ErrorMessage message={error} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Resume Upload (PDF)
            </span>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(event) =>
                handleResumeChange(
                  event.target.files ? event.target.files[0] : null
                )
              }
              required
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <p className="mt-2 text-xs text-slate-500">
              Upload PDF only, max 5MB.
            </p>
            {resume && (
              <p className="mt-2 text-sm text-slate-600">
                Selected file: {resume.name}
              </p>
            )}
            {resumeError && (
              <p className="mt-2 text-sm font-medium text-red-700">
                {resumeError}
              </p>
            )}
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Cover Letter
            </span>
            <textarea
              value={coverLetter}
              onChange={(event) => setCoverLetter(event.target.value)}
              required
              rows={5}
              placeholder="Why are you interested in this role?"
              className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            />
          </label>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ApplicationModal;
