import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getApplicationsByUserId } from "../api/applications";
import { getCompanies } from "../api/companies";
import { getEmployerStats, getPublicStats } from "../api/dashboard";
import { getJobs } from "../api/jobs";
import { useAuth } from "../context/AuthContext";
import type { Company, Job } from "../types";

type PlatformStats = {
  activeJobs: number;
  companiesHiring: number;
  applicationsSubmitted: number;
  remoteOpportunities: number;
  myApplications: number;
  jobsPosted: number;
  companiesManaged: number;
  applicationsReceived: number;
  remoteJobsPosted: number;
};

type StatCardProps = {
  label: string;
  value: number | null;
  icon: "briefcase" | "building" | "document" | "remote";
  to?: string;
  action: string;
  helperText: string;
};

const emptyStats: PlatformStats = {
  activeJobs: 0,
  companiesHiring: 0,
  applicationsSubmitted: 0,
  remoteOpportunities: 0,
  myApplications: 0,
  jobsPosted: 0,
  companiesManaged: 0,
  applicationsReceived: 0,
  remoteJobsPosted: 0,
};

const searchSuggestions = [
  "Backend",
  "Frontend",
  "DevOps",
  "Data Analyst",
  "Business Analyst",
  "Product Manager",
  "Marketing",
  "Finance",
  "Remote",
];

function formatSalary(min: number, max: number) {
  return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
}

function getCompanyInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function StatIcon({ icon }: { icon: StatCardProps["icon"] }) {
  const iconPath = {
    briefcase:
      "M4 7h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Zm5 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M4 12h16",
    building:
      "M5 20V4h10v16M15 8h4v12M8 8h1M11 8h1M8 12h1M11 12h1M8 16h1M11 16h1",
    document:
      "M7 3h7l4 4v14H7V3Zm7 0v5h5M10 12h6M10 16h6",
    remote:
      "M4 12a8 8 0 0 1 16 0M8 12a4 4 0 0 1 8 0M12 12h.01M5 18h14",
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d={iconPath[icon]} />
    </svg>
  );
}

function StatCard({
  label,
  value,
  icon,
  to,
  action,
  helperText,
}: StatCardProps) {
  const content = (
    <>
      <div className="flex items-center justify-between gap-4">
        <div className="rounded-md bg-brand-100 p-2 text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white">
          <StatIcon icon={icon} />
        </div>
        <p className="text-2xl font-bold text-slate-950">
          {value === null ? "--" : value.toLocaleString()}
        </p>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-1 min-h-10 text-xs leading-5 text-slate-500">
        {helperText}
      </p>
      <p className="mt-3 text-sm font-semibold text-brand-700 transition group-hover:text-brand-600">
        {action}
      </p>
    </>
  );

  if (!to) {
    return (
      <div className="cursor-default rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        {content}
      </div>
    );
  }

  return (
    <Link
      to={to}
      className="group block cursor-pointer rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-brand-100 hover:shadow-md"
    >
      {content}
    </Link>
  );
}

function FeaturedJobCard({ job }: { job: Job }) {
  return (
    <article className="flex h-full flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-brand-100 hover:shadow-md">
      <div>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">
              {job.title}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              {job.company?.name || "Company unavailable"}
            </p>
          </div>
          <span className="rounded-md bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
            {job.jobType.replace("_", " ")}
          </span>
        </div>
        <div className="space-y-2 text-sm text-slate-700">
          <p>{job.location}</p>
          <p className="font-semibold text-slate-950">
            {formatSalary(job.salaryMin, job.salaryMax)}
          </p>
        </div>
      </div>

      <Link
        to={`/jobs/${job.id}`}
        className="mt-5 inline-flex items-center justify-center rounded-md border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
      >
        View Details
      </Link>
    </article>
  );
}

function CompanyCard({ company }: { company: Company }) {
  return (
    <Link
      to={`/companies/${company.id}`}
      className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-brand-100 hover:shadow-md"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br from-brand-100 to-sky-100 text-sm font-bold text-brand-700">
          {getCompanyInitials(company.name)}
        </div>
        <div>
          <h3 className="font-semibold text-slate-950 group-hover:text-brand-700">
            {company.name}
          </h3>
          <p className="text-sm text-slate-600">{company.location}</p>
        </div>
      </div>
      <p className="line-clamp-2 text-sm leading-6 text-slate-600">
        {company.description}
      </p>
    </Link>
  );
}

function Home() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [stats, setStats] = useState<PlatformStats>(emptyStats);
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [featuredCompanies, setFeaturedCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingFeaturedJobs, setIsLoadingFeaturedJobs] = useState(true);
  const [isLoadingFeaturedCompanies, setIsLoadingFeaturedCompanies] =
    useState(true);
  const [statsMessage, setStatsMessage] = useState("");
  const [jobsMessage, setJobsMessage] = useState("");
  const [companiesMessage, setCompaniesMessage] = useState("");
  const [homeDataError, setHomeDataError] = useState("");
  const isLoggedOut = !user;

  useEffect(() => {
    let isActive = true;

    async function loadStats() {
      try {
        setIsLoadingStats(true);
        setIsLoadingFeaturedJobs(true);
        setIsLoadingFeaturedCompanies(true);
        setStatsMessage("");
        setJobsMessage("");
        setCompaniesMessage("");
        setHomeDataError("");

        console.log("Home jobs API started: GET /api/jobs?page=1&limit=6");
        console.log("Home companies API started: GET /api/companies");

        const jobsRequest = getJobs({
            title: "",
            location: "",
            jobType: "",
            minSalary: "",
            maxSalary: "",
            remoteOnly: false,
            sortBy: "newest",
            page: 1,
          });
        const companiesRequest = getCompanies();

        const [jobsResult, companiesResult] = await Promise.allSettled([
          jobsRequest,
          companiesRequest,
        ]);

        let failedFeaturedRequests = 0;
        let nextJobsMessage = "";
        let nextCompaniesMessage = "";

        if (jobsResult.status === "fulfilled") {
          const jobs = jobsResult.value.data;

          console.log("Home jobs API success:", jobsResult.value);
          if (isActive) {
            setFeaturedJobs(jobs.slice(0, 6));
          }
        } else {
          failedFeaturedRequests += 1;
          nextJobsMessage = "Could not load featured jobs.";
          console.error("Home jobs API failed:", jobsResult.reason);
          if (isActive) {
            setFeaturedJobs([]);
          }
        }

        if (companiesResult.status === "fulfilled") {
          const companies = companiesResult.value;

          console.log("Home companies API success:", companies);
          if (isActive) {
            setFeaturedCompanies(companies.slice(0, 6));
          }
        } else {
          failedFeaturedRequests += 1;
          nextCompaniesMessage = "Could not load companies.";
          console.error("Home companies API failed:", companiesResult.reason);
          if (isActive) {
            setFeaturedCompanies([]);
          }
        }

        if (isActive) {
          setJobsMessage(nextJobsMessage);
          setCompaniesMessage(nextCompaniesMessage);
          setIsLoadingFeaturedJobs(false);
          setIsLoadingFeaturedCompanies(false);
        }

        const [
          publicStatsResult,
          employerStatsResult,
          candidateApplicationsResult,
        ] = await Promise.allSettled([
          getPublicStats(),
          user?.role === "EMPLOYER" && token
            ? getEmployerStats(token)
            : Promise.resolve(null),
          user?.role === "CANDIDATE" && token
            ? getApplicationsByUserId(user.id, token)
            : Promise.resolve(null),
        ]);

        const nextStats = { ...emptyStats };
        let nextStatsMessage = "";
        let failedStatsRequests = 0;

        if (publicStatsResult.status === "fulfilled") {
          nextStats.activeJobs = publicStatsResult.value.activeJobs;
          nextStats.companiesHiring = publicStatsResult.value.companiesHiring;
          nextStats.applicationsSubmitted =
            publicStatsResult.value.totalApplications;
          nextStats.remoteOpportunities =
            publicStatsResult.value.remoteOpportunities;
        } else {
          failedStatsRequests += 1;
          nextStatsMessage = "Stats unavailable";
          console.error("Home public stats API failed:", publicStatsResult.reason);
        }

        let myApplications = 0;
        let jobsPosted = 0;
        let companiesManaged = 0;
        let applicationsReceived = 0;
        let remoteJobsPosted = 0;

        if (user?.role === "CANDIDATE" && token) {
          if (candidateApplicationsResult.status === "fulfilled") {
            myApplications = candidateApplicationsResult.value?.length || 0;
          } else {
            nextStatsMessage = "Stats unavailable";
            console.error(
              "Home candidate applications API failed:",
              candidateApplicationsResult.reason
            );
          }
        }

        if (user?.role === "EMPLOYER" && token) {
          if (
            employerStatsResult.status === "fulfilled" &&
            employerStatsResult.value
          ) {
            jobsPosted = employerStatsResult.value.jobsPosted;
            companiesManaged = employerStatsResult.value.companiesManaged;
            applicationsReceived = employerStatsResult.value.applicationsReceived;
            remoteJobsPosted = employerStatsResult.value.remoteJobsPosted;
          } else {
            nextStatsMessage = "Stats unavailable";
            if (employerStatsResult.status === "rejected") {
              console.error(
                "Home employer stats API failed:",
                employerStatsResult.reason
              );
            }
          }
        }

        nextStats.myApplications = myApplications;
        nextStats.jobsPosted = jobsPosted;
        nextStats.companiesManaged = companiesManaged;
        nextStats.applicationsReceived = applicationsReceived;
        nextStats.remoteJobsPosted = remoteJobsPosted;

        if (!isActive) {
          return;
        }

        setStats(nextStats);
        setStatsMessage(nextStatsMessage);
        setHomeDataError(
          failedFeaturedRequests === 2 && failedStatsRequests > 0
            ? "Could not load home page data. Make sure the backend is running."
            : ""
        );
      } catch (error) {
        if (!isActive) {
          return;
        }

        console.error("Home page data loading failed:", error);
        setStats(emptyStats);
        setFeaturedJobs([]);
        setFeaturedCompanies([]);
        setStatsMessage("Stats unavailable");
        setJobsMessage("Could not load featured jobs.");
        setCompaniesMessage("Could not load companies.");
        setHomeDataError(
          "Could not load home page data. Make sure the backend is running."
        );
      } finally {
        if (isActive) {
          setIsLoadingStats(false);
          setIsLoadingFeaturedJobs(false);
          setIsLoadingFeaturedCompanies(false);
        }
      }
    }

    loadStats();

    return () => {
      isActive = false;
    };
  }, [token, user]);

  const shouldShowStatValues =
    !isLoadingStats && !statsMessage && !homeDataError;

  const cards: StatCardProps[] =
    user?.role === "EMPLOYER"
      ? [
          {
            label: "Jobs Posted",
            value: shouldShowStatValues ? stats.jobsPosted : null,
            icon: "briefcase",
            to: "/dashboard",
            action: "Manage jobs",
            helperText: "Jobs posted under companies you manage.",
          },
          {
            label: "Companies Managed",
            value: shouldShowStatValues ? stats.companiesManaged : null,
            icon: "building",
            to: "/dashboard",
            action: "Manage companies",
            helperText: "Company profiles linked to your employer account.",
          },
          {
            label: "Applications Received",
            value: shouldShowStatValues ? stats.applicationsReceived : null,
            icon: "document",
            to: "/employer/applications",
            action: "Review applications",
            helperText: "Applications submitted to jobs from your companies.",
          },
          {
            label: "Remote Jobs Posted",
            value: shouldShowStatValues ? stats.remoteJobsPosted : null,
            icon: "remote",
            to: "/jobs?location=Remote",
            action: "View remote jobs",
            helperText: "Your posted jobs with remote locations.",
          },
        ]
      : user?.role === "CANDIDATE"
        ? [
            {
              label: "Active Jobs",
              value: shouldShowStatValues ? stats.activeJobs : null,
              icon: "briefcase",
              to: "/jobs",
              action: "View jobs",
              helperText: "Open roles available across the platform.",
            },
            {
              label: "Companies Hiring",
              value: shouldShowStatValues ? stats.companiesHiring : null,
              icon: "building",
              to: "/companies",
              action: "Explore companies",
              helperText: "Companies with profiles on the platform.",
            },
            {
              label: "My Applications",
              value: shouldShowStatValues ? stats.myApplications : null,
              icon: "document",
              to: "/my-applications",
              action: "View applications",
              helperText: "Applications submitted from your candidate account.",
            },
            {
              label: "Remote Opportunities",
              value: shouldShowStatValues ? stats.remoteOpportunities : null,
              icon: "remote",
              to: "/jobs?location=Remote",
              action: "Browse remote jobs",
              helperText: "Open roles matching a remote location search.",
            },
          ]
        : [
            {
              label: "Active Jobs",
              value: shouldShowStatValues ? stats.activeJobs : null,
              icon: "briefcase",
              to: "/jobs",
              action: "View jobs",
              helperText: "Open roles available to browse now.",
            },
            {
              label: "Companies Hiring",
              value: shouldShowStatValues ? stats.companiesHiring : null,
              icon: "building",
              to: "/companies",
              action: "Explore companies",
              helperText: "Companies with profiles on the platform.",
            },
            {
              label: "Job Categories",
              value: shouldShowStatValues ? searchSuggestions.length : null,
              icon: "document",
              to: "/jobs",
              action: "Browse categories",
              helperText: "Browse roles by specialty and skill area.",
            },
            {
              label: "Remote Opportunities",
              value: shouldShowStatValues ? stats.remoteOpportunities : null,
              icon: "remote",
              to: "/jobs?location=Remote",
              action: "Browse remote jobs",
              helperText: "Open roles matching a remote location search.",
            },
          ];

  const heroJobs = featuredJobs.slice(0, 3);

  function buildJobsPath(title: string, location: string) {
    const params = new URLSearchParams();

    if (title.trim()) {
      params.set("title", title.trim());
    }

    if (location.trim()) {
      params.set("location", location.trim());
    }

    const queryString = params.toString();

    return queryString ? `/jobs?${queryString}` : "/jobs";
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate(buildJobsPath(searchTerm, searchLocation));
  }

  function getSuggestionPath(suggestion: string) {
    if (suggestion === "Remote") {
      return buildJobsPath("", "Remote");
    }

    return buildJobsPath(suggestion, "");
  }

  return (
    <div className="space-y-14 py-6">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-br from-white via-sky-50 to-brand-50 shadow-sm">
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_420px] lg:items-center lg:p-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
              Scalable Jobs
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Find the right role at companies building what comes next.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Browse curated openings, compare growing teams, and move from
              discovery to application with a clean job search experience.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/jobs"
                className="inline-flex items-center justify-center rounded-md bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 hover:shadow-md"
              >
                Browse Jobs
              </Link>
              <Link
                to="/companies"
                className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
              >
                Explore Companies
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-white/80 bg-white/85 p-4 shadow-xl shadow-slate-200/70 backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Featured roles
                </p>
                <h2 className="mt-1 text-lg font-bold text-slate-950">
                  Fresh opportunities
                </h2>
              </div>
              <Link
                to="/jobs"
                className="text-sm font-semibold text-brand-700 hover:text-brand-600"
              >
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {heroJobs.length > 0 ? (
                heroJobs.map((job) => (
                  <Link
                    key={job.id}
                    to={`/jobs/${job.id}`}
                    className="block rounded-lg border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-100 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-950">
                          {job.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {job.company?.name || "Company unavailable"}
                        </p>
                      </div>
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                        {job.location}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-950">
                      {formatSalary(job.salaryMin, job.salaryMax)}
                    </p>
                  </Link>
                ))
              ) : (
                <div className="rounded-lg border border-slate-100 bg-white p-5 text-sm text-slate-600">
                  {isLoadingFeaturedJobs
                    ? "Loading featured jobs..."
                    : jobsMessage ||
                      homeDataError ||
                      "Featured jobs will appear here when jobs are available."}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
              Featured Jobs
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">
              Roles hiring now
            </h2>
          </div>
          <Link
            to="/jobs"
            className="text-sm font-semibold text-brand-700 hover:text-brand-600"
          >
            Browse all jobs
          </Link>
        </div>

        {featuredJobs.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featuredJobs.map((job) => (
              <FeaturedJobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-600 shadow-sm">
            {isLoadingFeaturedJobs
              ? "Loading featured jobs..."
              : jobsMessage ||
                homeDataError ||
                "No featured jobs are available yet."}
          </div>
        )}
      </section>

      <section>
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
              Top Companies
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">
              Explore teams on the platform
            </h2>
          </div>
          <Link
            to="/companies"
            className="text-sm font-semibold text-brand-700 hover:text-brand-600"
          >
            View all companies
          </Link>
        </div>

        {featuredCompanies.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-600 shadow-sm">
            {isLoadingFeaturedCompanies
              ? "Loading companies..."
              : companiesMessage ||
                homeDataError ||
                "Company profiles will appear here soon."}
          </div>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
            Job Search
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950">
            Search jobs your way
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Find roles across engineering, business, analytics, product, and
            more.
          </p>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-sm md:grid-cols-[1fr_220px_auto]"
        >
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by role, skill, company, or keyword"
            className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
          />
          <input
            value={searchLocation}
            onChange={(event) => setSearchLocation(event.target.value)}
            placeholder="Location"
            className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
          />
          <button
            type="submit"
            className="rounded-md bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 hover:shadow-md"
          >
            Search
          </button>
        </form>

        <div className="mt-5 flex flex-wrap gap-2">
          {searchSuggestions.map((suggestion) => (
            <Link
              key={suggestion}
              to={getSuggestionPath(suggestion)}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-100 hover:bg-brand-50 hover:text-brand-700 hover:shadow-md"
            >
              {suggestion}
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-slate-100/70 p-4 shadow-sm">
        <div className="mb-4 px-1">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Platform Activity
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">
            {isLoggedOut
              ? "Platform activity at a glance"
              : "Hiring momentum at a glance"}
          </h2>
          {isLoggedOut && (
            <p className="mt-2 text-sm leading-6 text-slate-600">
              These numbers represent overall platform activity.
            </p>
          )}
          {(statsMessage || homeDataError) && (
            <p className="mt-2 text-sm font-medium text-amber-700">
              {statsMessage || homeDataError}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
