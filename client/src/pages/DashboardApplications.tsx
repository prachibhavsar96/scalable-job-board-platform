import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  getEmployerApplications,
  updateApplicationStatus,
} from "../api/applications";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";
import type { Application, ApplicationStatus } from "../types";
import { getApiErrorMessage } from "../utils/apiError";
import { downloadResume, getResumeUrl, openResume } from "../utils/resume";

const statusStyles: Record<ApplicationStatus, string> = {
  APPLIED: "bg-blue-50 text-blue-700 ring-blue-200",
  REVIEWED: "bg-yellow-50 text-yellow-800 ring-yellow-200",
  SHORTLISTED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REJECTED: "bg-red-50 text-red-700 ring-red-200",
  WITHDRAWN: "bg-slate-100 text-slate-700 ring-slate-200",
  ACCEPTED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DashboardApplications() {
  const { token, user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadApplications() {
      if (!token || user?.role !== "EMPLOYER") {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const receivedApplications = await getEmployerApplications(token);

        setApplications(receivedApplications);
      } catch (loadError) {
        const message = getApiErrorMessage(
          loadError,
          "Could not load applications received."
        );

        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    }

    loadApplications();
  }, [token, user]);

  async function handleStatusChange(
    applicationId: number,
    status: ApplicationStatus
  ) {
    if (!token) {
      return;
    }

    try {
      setUpdatingId(applicationId);
      setError("");

      const updatedApplication = await toast.promise(
        updateApplicationStatus(applicationId, status, token),
        {
          loading: "Updating application...",
          success: "Application status updated",
          error: (error) =>
            getApiErrorMessage(error, "Could not update application status."),
        }
      );

      setApplications((currentApplications) =>
        currentApplications.map((application) =>
          application.id === applicationId ? updatedApplication : application
        )
      );
      setSelectedApplication((currentApplication) =>
        currentApplication?.id === applicationId
          ? updatedApplication
          : currentApplication
      );
    } catch (updateError) {
      const message = getApiErrorMessage(
        updateError,
        "Could not update application status."
      );

      setError(message);
    } finally {
      setUpdatingId(null);
    }
  }

  if (user?.role !== "EMPLOYER") {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-amber-900">Forbidden</h1>
        <p className="mt-3 text-amber-800">
          Only employer accounts can view received applications.
        </p>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">
            Applications Received
          </h1>
          <p className="mt-2 text-slate-600">
            Applications submitted to jobs posted by your companies.
          </p>
        </div>
        <Link
          to="/dashboard"
          className="w-fit rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Back to Dashboard
        </Link>
      </div>

      {error && <ErrorMessage message={error} />}

      {isLoading ? (
        <Loading message="Loading applications..." />
      ) : applications.length === 0 && !error ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-600">
          No applications received yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map((application) => (
            <article
              key={application.id}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-100 hover:shadow-md"
            >
              {(() => {
                const resumeUrl = getResumeUrl(application.resumePath);
                const hasResume = Boolean(resumeUrl);

                return (
                  <>
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    {application.job.title}
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-slate-950">
                    {application.user?.name || "Candidate"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {application.user?.email || "Email unavailable"}
                  </p>
                  <p className="mt-3 text-sm text-slate-600">
                    Applied on {formatDate(application.createdAt)}
                  </p>
                </div>
                <span
                  className={`w-fit rounded-md px-3 py-1 text-sm font-semibold ring-1 ${
                    statusStyles[application.status]
                  }`}
                >
                  {application.status}
                </span>
              </div>

              <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-[auto_auto_1fr]">
                <button
                  type="button"
                  onClick={() => openResume(resumeUrl)}
                  disabled={!hasResume}
                  className="inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
                >
                  {hasResume ? "View Resume" : "Resume not available"}
                </button>
                <button
                  type="button"
                  onClick={() => downloadResume(resumeUrl)}
                  disabled={!hasResume}
                  className="inline-flex items-center justify-center rounded-md border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
                >
                  Download Resume
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedApplication(application)}
                  className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  View Cover Letter
                </button>
                <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row lg:col-span-3 lg:justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      handleStatusChange(application.id, "REVIEWED")
                    }
                    disabled={
                      updatingId === application.id ||
                      application.status === "REVIEWED"
                    }
                    className="rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm font-semibold text-yellow-800 transition hover:bg-yellow-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Mark as Reviewed
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleStatusChange(application.id, "SHORTLISTED")
                    }
                    disabled={
                      updatingId === application.id ||
                      application.status === "SHORTLISTED"
                    }
                    className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Shortlist
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleStatusChange(application.id, "REJECTED")
                    }
                    disabled={
                      updatingId === application.id ||
                      application.status === "REJECTED"
                    }
                    className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              </div>
                  </>
                );
              })()}
            </article>
          ))}
        </div>
      )}

      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Application Details
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                  {selectedApplication.user?.name || "Candidate"}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {selectedApplication.user?.email || "Email unavailable"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApplication(null)}
                className="rounded-md px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Job
                </p>
                <p className="mt-2 font-semibold text-slate-950">
                  {selectedApplication.job.title}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </p>
                <span
                  className={`mt-2 inline-flex rounded-md px-3 py-1 text-sm font-semibold ring-1 ${
                    statusStyles[selectedApplication.status]
                  }`}
                >
                  {selectedApplication.status}
                </span>
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-sm font-semibold text-slate-700">
                Cover Letter
              </p>
              <div className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
                {selectedApplication.coverLetter}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-between">
              {(() => {
                const resumeUrl = getResumeUrl(selectedApplication.resumePath);
                const hasResume = Boolean(resumeUrl);

                return (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => downloadResume(resumeUrl)}
                      disabled={!hasResume}
                      className="inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
                    >
                      {hasResume ? "Open Resume" : "Resume not available"}
                    </button>
                    <button
                      type="button"
                      onClick={() => openResume(resumeUrl)}
                      disabled={!hasResume}
                      className="inline-flex items-center justify-center rounded-md border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
                    >
                      Download Resume
                    </button>
                  </div>
                );
              })()}
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    handleStatusChange(selectedApplication.id, "REVIEWED")
                  }
                  disabled={updatingId === selectedApplication.id}
                  className="rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm font-semibold text-yellow-800 transition hover:bg-yellow-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Mark as Reviewed
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleStatusChange(selectedApplication.id, "SHORTLISTED")
                  }
                  disabled={updatingId === selectedApplication.id}
                  className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Shortlist
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleStatusChange(selectedApplication.id, "REJECTED")
                  }
                  disabled={updatingId === selectedApplication.id}
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default DashboardApplications;
