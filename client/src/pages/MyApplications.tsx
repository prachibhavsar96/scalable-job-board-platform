import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { getMyApplications } from "../api/applications";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";
import type { Application, ApplicationStatus } from "../types";
import { getApiErrorMessage } from "../utils/apiError";
import { getResumeUrl, openResume } from "../utils/resume";

function getStatusClass(status: ApplicationStatus) {
  switch (status) {
    case "ACCEPTED":
      return "bg-emerald-100 text-emerald-700";
    case "REJECTED":
      return "bg-red-100 text-red-700";
    case "REVIEWED":
      return "bg-amber-100 text-amber-700";
    case "SHORTLISTED":
      return "bg-emerald-100 text-emerald-700";
    case "WITHDRAWN":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-brand-100 text-brand-700";
  }
}

function MyApplications() {
  const { token, user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadApplications() {
      if (!token || !user || user.role !== "CANDIDATE") {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const response = await getMyApplications(token);

        setApplications(response);
      } catch (loadError) {
        const message = getApiErrorMessage(
          loadError,
          "Could not load your applications."
        );

        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    }

    loadApplications();
  }, [token, user]);

  if (user?.role !== "CANDIDATE") {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">My Applications</h1>
        <p className="mt-3 text-slate-600">
          Only candidate accounts can view submitted applications.
        </p>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-950">My Applications</h1>
        <p className="mt-2 text-slate-600">
          Track the jobs you have applied for and their current status.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      {isLoading ? (
        <Loading message="Loading applications..." />
      ) : (
        <>
          {applications.length === 0 && !error ? (
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-600">
              You have not applied for any jobs yet.
            </div>
          ) : (
            <div className="grid gap-4">
              {applications.map((application) => (
                <article
                  key={application.id}
                  className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-950">
                        {application.job.title}
                      </h2>
                      <p className="mt-1 text-sm text-slate-600">
                        {application.job.location}
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-950">
                        ${application.job.salaryMin.toLocaleString()} - $
                        {application.job.salaryMax.toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`w-fit rounded-md px-3 py-1 text-sm font-semibold ${getStatusClass(
                        application.status
                      )}`}
                    >
                      {application.status}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-600">
                      Applied on{" "}
                      {new Date(application.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      {(() => {
                        const resumeUrl = getResumeUrl(application.resumePath);
                        const hasResume = Boolean(resumeUrl);

                        return (
                          <button
                            type="button"
                            onClick={() => openResume(resumeUrl)}
                            disabled={!hasResume}
                            className="inline-flex w-fit rounded-md border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
                          >
                            {hasResume
                              ? "View Uploaded Resume"
                              : "Resume not available"}
                          </button>
                        );
                      })()}
                      <Link
                        to={`/jobs/${application.jobId}`}
                        className="inline-flex w-fit rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        View Job
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default MyApplications;
