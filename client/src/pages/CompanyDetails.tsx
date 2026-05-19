import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createApplication,
  getApplicationsByUserId,
} from "../api/applications";
import { getCompanyById } from "../api/companies";
import ApplicationModal from "../components/ApplicationModal";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";
import type { Company, Job } from "../types";
import { getApiErrorMessage } from "../utils/apiError";

function formatJobType(jobType: string) {
  return jobType.replace("_", " ");
}

function formatSalary(min: number, max: number) {
  return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
}

function CompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, token, user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);
  const [applicationError, setApplicationError] = useState("");
  const [appliedJobIds, setAppliedJobIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function loadCompany() {
      if (!id) {
        setError("Missing company id.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const response = await getCompanyById(id);

        setCompany(response);
      } catch (loadError) {
        const message = getApiErrorMessage(
          loadError,
          "Could not load this company. It may not exist anymore."
        );

        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    }

    loadCompany();
  }, [id]);

  useEffect(() => {
    async function loadApplications() {
      if (!token || !user || user.role !== "CANDIDATE") {
        setAppliedJobIds(new Set());
        return;
      }

      try {
        const applications = await getApplicationsByUserId(user.id, token);

        setAppliedJobIds(
          new Set(applications.map((application) => application.jobId))
        );
      } catch (loadError) {
        setAppliedJobIds(new Set());
      }
    }

    loadApplications();
  }, [token, user]);

  function handleApplyClick(job: Job) {
    setApplicationError("");

    if (!isAuthenticated) {
      toast.error("Please log in to apply for jobs");
      navigate("/login");
      return;
    }

    if (user?.role !== "CANDIDATE" || appliedJobIds.has(job.id)) {
      return;
    }

    setSelectedJob(job);
  }

  async function handleApplicationSubmit(
    resume: File,
    coverLetter: string
  ) {
    if (!selectedJob || !token) {
      return;
    }

    try {
      setIsSubmittingApplication(true);
      setApplicationError("");

      await toast.promise(
        createApplication(
          {
            jobId: selectedJob.id,
            resume,
            coverLetter,
          },
          token
        ),
        {
          loading: "Submitting application...",
          success: `Application submitted for ${selectedJob.title}`,
          error: (error) =>
            getApiErrorMessage(
              error,
              "Resume upload failed. Upload a PDF resume and try again."
            ),
        }
      );

      setAppliedJobIds((current) => new Set(current).add(selectedJob.id));
      setSelectedJob(null);
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

  if (isLoading) {
    return <Loading message="Loading company details..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!company) {
    return <ErrorMessage message="Company not found." />;
  }

  const jobs = company.jobs || [];
  const canShowApply = !isAuthenticated || user?.role === "CANDIDATE";

  return (
    <section>
      <Link
        to="/companies"
        className="mb-6 inline-flex text-sm font-semibold text-brand-700 hover:text-brand-600"
      >
        Back to companies
      </Link>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">
              {company.name}
            </h1>
            <p className="mt-2 text-lg text-slate-600">{company.location}</p>
          </div>
          <div className="w-fit rounded-md bg-brand-100 px-3 py-2 text-sm font-semibold text-brand-700">
            {jobs.length} open jobs
          </div>
        </div>

        <p className="mt-6 max-w-3xl leading-7 text-slate-700">
          {company.description}
        </p>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">Open Jobs</h2>
            <p className="mt-1 text-sm text-slate-600">
              Browse roles currently listed by {company.name}.
            </p>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-600">
            This company does not have open jobs right now.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {jobs.map((job) => {
              const hasApplied = appliedJobIds.has(job.id);

              return (
                <article
                  key={job.id}
                  className="flex h-full flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div>
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-950">
                          {job.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {job.location}
                        </p>
                      </div>
                      <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {formatJobType(job.jobType)}
                      </span>
                    </div>

                    <p className="text-sm font-medium text-slate-950">
                      {formatSalary(job.salaryMin, job.salaryMax)}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <Link
                      to={`/jobs/${job.id}`}
                      className="inline-flex flex-1 items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
                    >
                      View Details
                    </Link>

                    {canShowApply && (
                      <button
                        type="button"
                        onClick={() => handleApplyClick(job)}
                        disabled={hasApplied}
                        className="inline-flex flex-1 items-center justify-center rounded-md border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
                      >
                        {hasApplied ? "Already Applied" : "Apply"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {selectedJob && (
        <ApplicationModal
          isSubmitting={isSubmittingApplication}
          error={applicationError}
          onClose={() => setSelectedJob(null)}
          onSubmit={handleApplicationSubmit}
        />
      )}
    </section>
  );
}

export default CompanyDetails;
