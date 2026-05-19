import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  getMyApplications,
  withdrawApplication,
} from "../api/applications";
import { getMySavedJobs, removeSavedJob } from "../api/savedJobs";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";
import type { Application, ApplicationStatus, SavedJob } from "../types";
import { getApiErrorMessage } from "../utils/apiError";

const statusClasses: Record<ApplicationStatus, string> = {
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

function formatSalary(min: number, max: number) {
  return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
}

function CandidateDashboard() {
  const { token, user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingApplicationId, setUpdatingApplicationId] = useState<
    number | null
  >(null);
  const [removingJobId, setRemovingJobId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      if (!token || user?.role !== "CANDIDATE") {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const [candidateApplications, candidateSavedJobs] = await Promise.all([
          getMyApplications(token),
          getMySavedJobs(token),
        ]);

        setApplications(candidateApplications);
        setSavedJobs(candidateSavedJobs);
      } catch (loadError) {
        const message = getApiErrorMessage(
          loadError,
          "Could not load candidate dashboard."
        );

        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [token, user]);

  async function handleWithdraw(applicationId: number) {
    if (!token) {
      return;
    }

    try {
      setUpdatingApplicationId(applicationId);
      setError("");

      const response = await toast.promise(
        withdrawApplication(applicationId, token),
        {
          loading: "Withdrawing application...",
          success: "Application withdrawn",
          error: (error) =>
            getApiErrorMessage(error, "Could not withdraw application."),
        }
      );

      setApplications((currentApplications) =>
        currentApplications.map((application) =>
          application.id === applicationId ? response.data : application
        )
      );
    } catch (withdrawError) {
      const message = getApiErrorMessage(
        withdrawError,
        "Could not withdraw application."
      );

      setError(message);
    } finally {
      setUpdatingApplicationId(null);
    }
  }

  async function handleRemoveSavedJob(jobId: number) {
    if (!token) {
      return;
    }

    try {
      setRemovingJobId(jobId);
      setError("");

      await toast.promise(removeSavedJob(jobId, token), {
        loading: "Removing saved job...",
        success: "Job removed from saved jobs",
        error: (error) =>
          getApiErrorMessage(error, "Could not remove saved job."),
      });
      setSavedJobs((currentSavedJobs) =>
        currentSavedJobs.filter((savedJob) => savedJob.jobId !== jobId)
      );
    } catch (removeError) {
      const message = getApiErrorMessage(
        removeError,
        "Could not remove saved job."
      );

      setError(message);
    } finally {
      setRemovingJobId(null);
    }
  }

  if (user?.role !== "CANDIDATE") {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">
          Candidate Dashboard
        </h1>
        <p className="mt-3 text-slate-600">
          Only candidate accounts can view this dashboard.
        </p>
      </section>
    );
  }

  if (isLoading) {
    return <Loading message="Loading candidate dashboard..." />;
  }

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-950">
          Candidate Dashboard
        </h1>
        <p className="mt-2 text-slate-600">
          Track your applications and revisit saved jobs.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">
              My Applications
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Follow each role from applied to decision.
            </p>
          </div>
          <Link
            to="/jobs"
            className="text-sm font-semibold text-brand-700 hover:text-brand-600"
          >
            Browse jobs
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
            You have not applied for any jobs yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {applications.map((application) => (
              <article
                key={application.id}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">
                      {application.job.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {application.job.company?.name || "Company unavailable"}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {application.job.location}
                    </p>
                    <p className="mt-3 text-sm text-slate-500">
                      Applied on {formatDate(application.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`w-fit rounded-md px-3 py-1 text-sm font-semibold ring-1 ${
                      statusClasses[application.status]
                    }`}
                  >
                    {application.status}
                  </span>
                </div>

                <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-between">
                  <Link
                    to={`/jobs/${application.jobId}`}
                    className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    View Job
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleWithdraw(application.id)}
                    disabled={
                      updatingApplicationId === application.id ||
                      application.status === "WITHDRAWN"
                    }
                    className="inline-flex items-center justify-center rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {application.status === "WITHDRAWN"
                      ? "Withdrawn"
                      : "Withdraw"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-slate-950">Saved Jobs</h2>
          <p className="mt-1 text-sm text-slate-600">
            Keep track of roles you may want to apply to later.
          </p>
        </div>

        {savedJobs.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
            No saved jobs yet.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {savedJobs.map((savedJob) => (
              <article
                key={savedJob.id}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-slate-950">
                  {savedJob.job.title}
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {savedJob.job.company?.name || "Company unavailable"}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {savedJob.job.location}
                </p>
                <p className="mt-3 text-sm font-semibold text-slate-950">
                  {formatSalary(savedJob.job.salaryMin, savedJob.job.salaryMax)}
                </p>

                <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row">
                  <Link
                    to={`/jobs/${savedJob.jobId}`}
                    className="inline-flex flex-1 items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
                  >
                    View Details
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleRemoveSavedJob(savedJob.jobId)}
                    disabled={removingJobId === savedJob.jobId}
                    className="inline-flex flex-1 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Remove Saved Job
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

export default CandidateDashboard;
