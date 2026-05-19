import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import ErrorMessage from "../components/ErrorMessage";
import JobCard from "../components/JobCard";
import Loading from "../components/Loading";
import { getJobs } from "../api/jobs";
import type { Job, JobFilters, JobType } from "../types";
import { getApiErrorMessage } from "../utils/apiError";

const defaultFilters: JobFilters = {
  title: "",
  location: "",
  jobType: "",
  minSalary: "",
  maxSalary: "",
  remoteOnly: false,
  sortBy: "newest",
  page: 1,
};

function getFiltersFromSearchParams(searchParams: URLSearchParams): JobFilters {
  return {
    ...defaultFilters,
    title: searchParams.get("title") || "",
    location: searchParams.get("location") || "",
    jobType: (searchParams.get("jobType") || "") as "" | JobType,
    minSalary: searchParams.get("minSalary") || "",
    maxSalary: searchParams.get("maxSalary") || "",
    remoteOnly: searchParams.get("remoteOnly") === "true",
    sortBy:
      (searchParams.get("sortBy") as JobFilters["sortBy"] | null) || "newest",
    page: Number(searchParams.get("page")) || 1,
  };
}

function buildSearchParams(filters: JobFilters) {
  const params = new URLSearchParams();

  if (filters.title.trim()) params.set("title", filters.title.trim());
  if (filters.location.trim()) params.set("location", filters.location.trim());
  if (filters.jobType) params.set("jobType", filters.jobType);
  if (filters.minSalary.trim()) params.set("minSalary", filters.minSalary.trim());
  if (filters.maxSalary.trim()) params.set("maxSalary", filters.maxSalary.trim());
  if (filters.remoteOnly) params.set("remoteOnly", "true");
  if (filters.sortBy !== "newest") params.set("sortBy", filters.sortBy);
  if (filters.page > 1) params.set("page", String(filters.page));

  return params;
}

function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchKey = searchParams.toString();
  const initialFilters = getFiltersFromSearchParams(searchParams);
  const [filters, setFilters] = useState<JobFilters>(initialFilters);
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const nextFilters = getFiltersFromSearchParams(
      new URLSearchParams(searchKey)
    );

    setFilters(nextFilters);
    setDraftFilters(nextFilters);
  }, [searchKey]);

  useEffect(() => {
    async function loadJobs() {
      try {
        setIsLoading(true);
        setError("");

        const response = await getJobs(filters);

        setJobs(response.data);
        setTotal(response.total);
        setTotalPages(response.totalPages);
      } catch (loadError) {
        const message = getApiErrorMessage(
          loadError,
          "Could not load jobs. Make sure the backend is running."
        );

        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    }

    loadJobs();
  }, [filters]);

  function updateUrl(nextFilters: JobFilters) {
    setSearchParams(buildSearchParams(nextFilters));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateUrl({ ...draftFilters, page: 1 });
  }

  function handleClearFilters() {
    updateUrl(defaultFilters);
  }

  function handlePrevious() {
    updateUrl({
      ...filters,
      page: Math.max(1, filters.page - 1),
    });
  }

  function handleNext() {
    updateUrl({
      ...filters,
      page: Math.min(totalPages, filters.page + 1),
    });
  }

  return (
    <section>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Jobs</h1>
          <p className="mt-2 text-slate-600">
            Search open roles by keyword, location, salary, and work style.
          </p>
        </div>
        <p className="text-sm font-medium text-slate-600">{total} jobs found</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-8 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Search keyword
            </span>
            <input
              value={draftFilters.title}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder="Role, skill, or keyword"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Location
            </span>
            <input
              value={draftFilters.location}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  location: event.target.value,
                }))
              }
              placeholder="Remote, Denver, Austin..."
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Job Type
            </span>
            <select
              value={draftFilters.jobType}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  jobType: event.target.value as "" | JobType,
                }))
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            >
              <option value="">All types</option>
              <option value="FULL_TIME">Full time</option>
              <option value="PART_TIME">Part time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Minimum Salary
            </span>
            <input
              type="number"
              min="0"
              value={draftFilters.minSalary}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  minSalary: event.target.value,
                }))
              }
              placeholder="60000"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Maximum Salary
            </span>
            <input
              type="number"
              min="0"
              value={draftFilters.maxSalary}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  maxSalary: event.target.value,
                }))
              }
              placeholder="140000"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Sort
            </span>
            <select
              value={draftFilters.sortBy}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  sortBy: event.target.value as JobFilters["sortBy"],
                }))
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            >
              <option value="newest">Newest</option>
              <option value="salaryHigh">Salary: High to Low</option>
              <option value="salaryLow">Salary: Low to High</option>
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={draftFilters.remoteOnly}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  remoteOnly: event.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-600"
            />
            Remote only
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleClearFilters}
              className="rounded-md border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Clear filters
            </button>
            <button
              type="submit"
              className="rounded-md bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Search
            </button>
          </div>
        </div>
      </form>

      {error && <ErrorMessage message={error} />}

      {isLoading ? (
        <Loading message="Loading jobs..." />
      ) : (
        <>
          {jobs.length === 0 && !error ? (
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-600">
              No jobs found matching your filters.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={filters.page === 1}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm font-medium text-slate-600">
              Page {filters.page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={handleNext}
              disabled={filters.page >= totalPages}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </section>
  );
}

export default Jobs;
