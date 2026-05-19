import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createApplication,
  getApplicationsByUserId,
} from "../api/applications";
import { getJobById } from "../api/jobs";
import { getMySavedJobs, removeSavedJob, saveJob } from "../api/savedJobs";
import ApplicationModal from "../components/ApplicationModal";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";
import type { Job, JobDetailsResponse } from "../types";
import { getApiErrorMessage } from "../utils/apiError";

function formatJobType(jobType: string) {
  return jobType.replace("_", " ");
}

function formatSalary(min: number, max: number) {
  return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getSkillTags(job: JobDetailsResponse) {
  const text = `${job.title} ${job.description} ${job.location}`.toLowerCase();
  const tagRules = [
    { label: "Backend", keywords: ["backend", "api", "server"] },
    { label: "Frontend", keywords: ["frontend", "ui", "interface"] },
    { label: "React", keywords: ["react"] },
    { label: "Node.js", keywords: ["node", "express"] },
    { label: "SQL", keywords: ["sql", "database", "data"] },
    { label: "Remote", keywords: ["remote"] },
    { label: "DevOps", keywords: ["devops", "aws", "docker", "ci/cd"] },
    { label: "Analytics", keywords: ["analyst", "analytics", "dashboard"] },
  ];

  return tagRules
    .filter((rule) => rule.keywords.some((keyword) => text.includes(keyword)))
    .map((rule) => rule.label)
    .slice(0, 6);
}

function SimilarJobCard({ job }: { job: Job }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-100 hover:shadow-md">
      <h3 className="text-base font-semibold text-slate-950">{job.title}</h3>
      <p className="mt-1 text-sm text-slate-600">
        {job.company?.name || "Company unavailable"}
      </p>
      <p className="mt-3 text-sm text-slate-600">{job.location}</p>
      <p className="mt-2 text-sm font-semibold text-slate-950">
        {formatSalary(job.salaryMin, job.salaryMax)}
      </p>
      <Link
        to={`/jobs/${job.id}`}
        className="mt-4 inline-flex w-full items-center justify-center rounded-md border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
      >
        View Details
      </Link>
    </article>
  );
}

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, token, user } = useAuth();
  const [job, setJob] = useState<JobDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);
  const [applicationError, setApplicationError] = useState("");
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSavingJob, setIsSavingJob] = useState(false);

  useEffect(() => {
    async function loadJob() {
      if (!id) {
        setError("Missing job id.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const response = await getJobById(id);

        setJob(response);
      } catch (loadError) {
        const message = getApiErrorMessage(
          loadError,
          "Could not load this job. It may not exist anymore."
        );

        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    }

    loadJob();
  }, [id]);

  useEffect(() => {
    async function checkExistingApplication() {
      if (!id || !token || !user || user.role !== "CANDIDATE") {
        setHasApplied(false);
        return;
      }

      try {
        const applications = await getApplicationsByUserId(user.id, token);
        const alreadyApplied = applications.some(
          (application) => application.jobId === Number(id)
        );

        setHasApplied(alreadyApplied);
      } catch (loadError) {
        setHasApplied(false);
      }
    }

    checkExistingApplication();
  }, [id, token, user]);

  useEffect(() => {
    async function checkSavedJob() {
      if (!id || !token || !user || user.role !== "CANDIDATE") {
        setIsSaved(false);
        return;
      }

      try {
        const savedJobs = await getMySavedJobs(token);

        setIsSaved(
          savedJobs.some((savedJob) => savedJob.jobId === Number(id))
        );
      } catch (loadError) {
        setIsSaved(false);
      }
    }

    checkSavedJob();
  }, [id, token, user]);

  const skillTags = useMemo(() => (job ? getSkillTags(job) : []), [job]);

  function handleApplyClick() {
    setApplicationError("");

    if (!isAuthenticated) {
      toast.error("Please log in to apply for jobs");
      navigate("/login");
      return;
    }

    if (user?.role !== "CANDIDATE" || hasApplied) {
      return;
    }

    setIsApplyModalOpen(true);
  }

  async function handleApplicationSubmit(resume: File, coverLetter: string) {
    if (!job || !token) {
      return;
    }

    try {
      setIsSubmittingApplication(true);
      setApplicationError("");

      await toast.promise(
        createApplication(
          {
            jobId: job.id,
            resume,
            coverLetter,
          },
          token
        ),
        {
          loading: "Submitting application...",
          success: "Application submitted",
          error: (error) =>
            getApiErrorMessage(
              error,
              "Resume upload failed. Upload a PDF resume and try again."
            ),
        }
      );

      setHasApplied(true);
      setIsApplyModalOpen(false);
    } catch (submitError) {
      const message = getApiErrorMessage(
        submitError,
        "Could not submit application. Upload a PDF resume and try again."
      );

      setApplicationError(message);
    } finally {
      setIsSubmittingApplication(false);
    }
  }

  async function handleSaveToggle() {
    if (!job || !token || user?.role !== "CANDIDATE") {
      return;
    }

    try {
      setIsSavingJob(true);

      if (isSaved) {
        await toast.promise(removeSavedJob(job.id, token), {
          loading: "Removing saved job...",
          success: "Job removed from saved jobs",
          error: (error) =>
            getApiErrorMessage(error, "Could not remove saved job."),
        });
        setIsSaved(false);
      } else {
        await toast.promise(saveJob(job.id, token), {
          loading: "Saving job...",
          success: "Job saved",
          error: (error) => getApiErrorMessage(error, "Could not save job."),
        });
        setIsSaved(true);
      }
    } catch (saveError) {
      console.error("Save job failed", saveError);
    } finally {
      setIsSavingJob(false);
    }
  }

  if (isLoading) {
    return <Loading message="Loading job details..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!job) {
    return <ErrorMessage message="Job not found." />;
  }

  const isEmployer = user?.role === "EMPLOYER";
  const isCandidate = user?.role === "CANDIDATE";
  const applyButtonText = !isAuthenticated
    ? "Login to Apply"
    : isEmployer
      ? "Employers Cannot Apply"
      : hasApplied
        ? "Already Applied"
        : "Apply Now";

  return (
    <section className="space-y-6">
      <Link
        to="/jobs"
        className="inline-flex text-sm font-semibold text-brand-700 hover:text-brand-600"
      >
        Back to jobs
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <main className="space-y-6">
          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-start">
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="rounded-md bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-700">
                    {formatJobType(job.jobType)}
                  </span>
                  <span className="rounded-md bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                    {job.location}
                  </span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-slate-950">
                  {job.title}
                </h1>
                <p className="mt-3 text-lg text-slate-600">
                  {job.company?.name || "Company unavailable"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {job.company?.location || "Company location not listed"}
                </p>
              </div>
              {isCandidate && (
                <button
                  type="button"
                  onClick={handleSaveToggle}
                  disabled={isSavingJob}
                  className="w-fit rounded-md border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaved ? "Unsave Job" : "Save Job"}
                </button>
              )}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-md bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Salary
                </p>
                <p className="mt-1 font-semibold text-slate-950">
                  {formatSalary(job.salaryMin, job.salaryMax)}
                </p>
              </div>
              <div className="rounded-md bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Job Location
                </p>
                <p className="mt-1 font-semibold text-slate-950">
                  {job.location}
                </p>
              </div>
              <div className="rounded-md bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Job Type
                </p>
                <p className="mt-1 font-semibold text-slate-950">
                  {formatJobType(job.jobType)}
                </p>
              </div>
              <div className="rounded-md bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Posted
                </p>
                <p className="mt-1 font-semibold text-slate-950">
                  {formatDate(job.createdAt)}
                </p>
              </div>
            </div>
          </article>

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">
              Job Description
            </h2>
            <p className="mt-4 whitespace-pre-wrap leading-7 text-slate-700">
              {job.description}
            </p>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">
              Skills and Tags
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {(skillTags.length > 0 ? skillTags : [formatJobType(job.jobType)]).map(
                (tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-700"
                  >
                    {tag}
                  </span>
                )
              )}
            </div>
          </section>

          {job.similarJobs && job.similarJobs.length > 0 && (
            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-950">
                Similar Jobs
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {job.similarJobs.map((similarJob) => (
                  <SimilarJobCard key={similarJob.id} job={similarJob} />
                ))}
              </div>
            </section>
          )}
        </main>

        <aside className="space-y-5">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">Apply</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Submit a PDF resume and a short cover letter for this role.
            </p>

            {isEmployer && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
                Employers cannot apply to jobs.
              </div>
            )}

            <button
              type="button"
              onClick={handleApplyClick}
              disabled={(isAuthenticated && !isCandidate) || hasApplied}
              className="mt-5 w-full rounded-md bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
            >
              {applyButtonText}
            </button>
          </section>

          {job.company && (
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">
                Company Information
              </h2>
              <p className="mt-4 font-semibold text-slate-950">
                {job.company.name}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {job.company.location}
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-700">
                {job.company.description}
              </p>
              <Link
                to={`/companies/${job.company.id}`}
                className="mt-5 inline-flex w-full items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                View Company
              </Link>
            </section>
          )}
        </aside>
      </div>

      {isApplyModalOpen && (
        <ApplicationModal
          isSubmitting={isSubmittingApplication}
          error={applicationError}
          onClose={() => setIsApplyModalOpen(false)}
          onSubmit={handleApplicationSubmit}
        />
      )}
    </section>
  );
}

export default JobDetails;
