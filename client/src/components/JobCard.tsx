import { Link } from "react-router-dom";
import type { Job } from "../types";

type JobCardProps = {
  job: Job;
};

function formatJobType(jobType: string) {
  return jobType.replace("_", " ");
}

function formatSalary(min: number, max: number) {
  return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
}

function JobCard({ job }: JobCardProps) {
  return (
    <article className="flex h-full flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-100 hover:shadow-md">
      <div>
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">{job.title}</h2>
            <p className="mt-1 text-sm text-slate-600">
              {job.company?.name || "Company unavailable"}
            </p>
          </div>
          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
            {formatJobType(job.jobType)}
          </span>
        </div>

        <div className="space-y-2 text-sm text-slate-700">
          <p>{job.location}</p>
          <p className="font-medium text-slate-950">
            {formatSalary(job.salaryMin, job.salaryMax)}
          </p>
        </div>
      </div>

      <Link
        to={`/jobs/${job.id}`}
        className="mt-5 inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
      >
        View Details
      </Link>
    </article>
  );
}

export default JobCard;
