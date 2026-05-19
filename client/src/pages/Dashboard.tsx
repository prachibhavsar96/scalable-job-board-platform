import { FormEvent, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import {
  createCompany,
  getMyCompanies,
  updateCompany,
} from "../api/companies";
import { createJob, getEmployerJobs, updateJob } from "../api/jobs";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";
import type {
  Company,
  CreateCompanyInput,
  CreateJobInput,
  Job,
  JobType,
} from "../types";
import { getApiErrorMessage } from "../utils/apiError";

const emptyCompanyForm: CreateCompanyInput = {
  name: "",
  description: "",
  location: "",
};

const emptyJobForm: CreateJobInput = {
  title: "",
  description: "",
  location: "",
  salaryMin: 0,
  salaryMax: 0,
  jobType: "FULL_TIME",
  companyId: 0,
};

const emptySalaryForm = {
  salaryMin: "",
  salaryMax: "",
};

function formatJobType(jobType: string) {
  return jobType.replace("_", " ");
}

function Dashboard() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [companyForm, setCompanyForm] =
    useState<CreateCompanyInput>(emptyCompanyForm);
  const [jobForm, setJobForm] = useState<CreateJobInput>(emptyJobForm);
  const [salaryForm, setSalaryForm] = useState(emptySalaryForm);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employerJobs, setEmployerJobs] = useState<Job[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [companyError, setCompanyError] = useState("");
  const [jobError, setJobError] = useState("");
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [editCompanyForm, setEditCompanyForm] =
    useState<CreateCompanyInput>(emptyCompanyForm);
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editJobForm, setEditJobForm] = useState<CreateJobInput>(emptyJobForm);
  const [editSalaryForm, setEditSalaryForm] = useState(emptySalaryForm);
  const [isSavingJob, setIsSavingJob] = useState(false);

  const loadCompanies = useCallback(async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (!user || user.role !== "EMPLOYER") {
      setIsLoadingCompanies(false);
      return;
    }

    try {
      setIsLoadingCompanies(true);
      setCompanyError("");

      const employerCompanies = await getMyCompanies(token);

      console.log("companies response", employerCompanies);
      setCompanies(employerCompanies);
      setJobForm((current) => ({
        ...current,
        companyId: employerCompanies.some(
          (company) => company.id === current.companyId
        )
          ? current.companyId
          : employerCompanies[0]?.id || 0,
      }));
    } catch (error) {
      console.error("companies response error", error);
      const status = (error as { response?: { status?: number } }).response
        ?.status;

      if (status === 401) {
        navigate("/login");
      }

      toast.error(
        getApiErrorMessage(error, "Could not load your companies.")
      );
      setCompanies([]);
    } finally {
      setIsLoadingCompanies(false);
    }
  }, [navigate, token, user]);

  const loadEmployerJobs = useCallback(async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (!user || user.role !== "EMPLOYER") {
      setIsLoadingJobs(false);
      return;
    }

    try {
      setIsLoadingJobs(true);
      setJobError("");

      const jobs = await getEmployerJobs(token);

      console.log("employer jobs response", jobs);
      setEmployerJobs(jobs);
    } catch (error) {
      console.error("employer jobs response error", error);
      const status = (error as { response?: { status?: number } }).response
        ?.status;

      if (status === 401) {
        navigate("/login");
      }

      toast.error(getApiErrorMessage(error, "Could not load your jobs."));
      setEmployerJobs([]);
    } finally {
      setIsLoadingJobs(false);
    }
  }, [navigate, token, user]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  useEffect(() => {
    loadEmployerJobs();
  }, [loadEmployerJobs]);

  if (user?.role !== "EMPLOYER") {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-amber-900">Forbidden</h1>
        <p className="mt-3 text-amber-800">
          Only employer accounts can access the Employer Dashboard.
        </p>
        <Link
          to="/jobs"
          className="mt-5 inline-flex rounded-md bg-white px-4 py-2 text-sm font-semibold text-amber-900 ring-1 ring-amber-200 transition hover:bg-amber-100"
        >
          Back to Jobs
        </Link>
      </section>
    );
  }

  function updateCompanyForm<Field extends keyof CreateCompanyInput>(
    field: Field,
    value: CreateCompanyInput[Field]
  ) {
    setCompanyForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateJobForm<Field extends keyof CreateJobInput>(
    field: Field,
    value: CreateJobInput[Field]
  ) {
    setJobForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateSalaryForm(field: keyof typeof emptySalaryForm, value: string) {
    setSalaryForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateEditCompanyForm<Field extends keyof CreateCompanyInput>(
    field: Field,
    value: CreateCompanyInput[Field]
  ) {
    setEditCompanyForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateEditJobForm<Field extends keyof CreateJobInput>(
    field: Field,
    value: CreateJobInput[Field]
  ) {
    setEditJobForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateEditSalaryForm(
    field: keyof typeof emptySalaryForm,
    value: string
  ) {
    setEditSalaryForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function openEditCompany(company: Company) {
    setCompanyError("");
    setEditingCompany(company);
    setEditCompanyForm({
      name: company.name,
      description: company.description,
      location: company.location,
    });
  }

  function closeEditCompany() {
    setEditingCompany(null);
    setEditCompanyForm(emptyCompanyForm);
    setCompanyError("");
  }

  function openEditJob(job: Job) {
    setJobError("");
    setEditingJob(job);
    setEditJobForm({
      title: job.title,
      description: job.description,
      location: job.location,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      jobType: job.jobType,
      companyId: job.companyId,
    });
    setEditSalaryForm({
      salaryMin: String(job.salaryMin),
      salaryMax: String(job.salaryMax),
    });
  }

  function closeEditJob() {
    setEditingJob(null);
    setEditJobForm(emptyJobForm);
    setEditSalaryForm(emptySalaryForm);
    setJobError("");
  }

  async function handleCreateCompany(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      const message = "You must be logged in to create a company.";
      setCompanyError(message);
      toast.error(message);
      return;
    }

    try {
      setIsCreatingCompany(true);
      setCompanyError("");

      await toast.promise(createCompany(companyForm, token), {
        loading: "Creating company...",
        success: "Company profile created successfully",
        error: (error) =>
          getApiErrorMessage(
            error,
            "Could not create company. Check all required fields."
          ),
      });
      await loadCompanies();

      setCompanyForm(emptyCompanyForm);
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Could not create company. Check all required fields."
      );

      setCompanyError(message);
    } finally {
      setIsCreatingCompany(false);
    }
  }

  async function handleUpdateCompany(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !editingCompany) {
      const message = "You must be logged in to update a company.";
      setCompanyError(message);
      toast.error(message);
      return;
    }

    try {
      setIsSavingCompany(true);
      setCompanyError("");

      await toast.promise(
        updateCompany(editingCompany.id, editCompanyForm, token),
        {
          loading: "Updating company...",
          success: "Company profile updated successfully",
          error: (error) =>
            getApiErrorMessage(
              error,
              "Could not update company. Check all fields."
            ),
        }
      );
      await loadCompanies();
      await loadEmployerJobs();

      closeEditCompany();
    } catch (error) {
      setCompanyError(
        getApiErrorMessage(error, "Could not update company. Check all fields.")
      );
    } finally {
      setIsSavingCompany(false);
    }
  }

  async function handleCreateJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      const message = "You must be logged in to create a job.";
      setJobError(message);
      toast.error(message);
      return;
    }

    if (companies.length === 0) {
      const message = "Create your company profile before posting a job.";
      setJobError(message);
      toast.error(message);
      return;
    }

    const salaryMin = Number(salaryForm.salaryMin);
    const salaryMax = Number(salaryForm.salaryMax);

    if (!salaryForm.salaryMin || !salaryForm.salaryMax) {
      const message = "Salary min and salary max are required.";
      setJobError(message);
      toast.error(message);
      return;
    }

    if (salaryMin <= 0 || salaryMax <= 0) {
      const message = "Salary values must be positive numbers.";
      setJobError(message);
      toast.error(message);
      return;
    }

    if (salaryMax < salaryMin) {
      const message =
        "Maximum salary must be greater than or equal to minimum salary.";
      setJobError(message);
      toast.error(message);
      return;
    }

    try {
      setIsCreatingJob(true);
      setJobError("");

      await toast.promise(
        createJob(
          {
            ...jobForm,
            salaryMin,
            salaryMax,
          },
          token
        ),
        {
          loading: "Posting job...",
          success: "Job posted successfully",
          error: (error) =>
            getApiErrorMessage(
              error,
              "Could not create job. Check required fields and salary values."
            ),
        }
      );
      await loadEmployerJobs();

      setJobForm({
        ...emptyJobForm,
        companyId: jobForm.companyId,
      });
      setSalaryForm(emptySalaryForm);
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Could not create job. Check required fields and salary values."
      );

      setJobError(message);
    } finally {
      setIsCreatingJob(false);
    }
  }

  async function handleUpdateJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !editingJob) {
      const message = "You must be logged in to update a job.";
      setJobError(message);
      toast.error(message);
      return;
    }

    const salaryMin = Number(editSalaryForm.salaryMin);
    const salaryMax = Number(editSalaryForm.salaryMax);

    if (!editSalaryForm.salaryMin || !editSalaryForm.salaryMax) {
      const message = "Salary min and salary max are required.";
      setJobError(message);
      toast.error(message);
      return;
    }

    if (salaryMin <= 0 || salaryMax <= 0) {
      const message = "Salary values must be positive numbers.";
      setJobError(message);
      toast.error(message);
      return;
    }

    if (salaryMax < salaryMin) {
      const message =
        "Maximum salary must be greater than or equal to minimum salary.";
      setJobError(message);
      toast.error(message);
      return;
    }

    try {
      setIsSavingJob(true);
      setJobError("");

      await toast.promise(
        updateJob(
          editingJob.id,
          {
            ...editJobForm,
            salaryMin,
            salaryMax,
          },
          token
        ),
        {
          loading: "Updating job...",
          success: "Job updated successfully",
          error: (error) =>
            getApiErrorMessage(error, "Could not update job. Check all fields."),
        }
      );
      await loadEmployerJobs();

      closeEditJob();
    } catch (error) {
      setJobError(
        getApiErrorMessage(error, "Could not update job. Check all fields.")
      );
    } finally {
      setIsSavingJob(false);
    }
  }

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-950">
          Employer Dashboard
        </h1>
        <p className="mt-2 text-slate-600">
          Create your company profile, then post jobs under that company.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-8">
          <form
            onSubmit={handleCreateCompany}
            className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-slate-950">
              Company Profile
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Create a company once, then choose it when posting jobs.
            </p>

            {companyError && (
              <div className="mt-4">
                <ErrorMessage message={companyError} />
              </div>
            )}

            <div className="mt-5 grid gap-4">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Company Name
                </span>
                <input
                  value={companyForm.name}
                  onChange={(event) =>
                    updateCompanyForm("name", event.target.value)
                  }
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Description
                </span>
                <textarea
                  value={companyForm.description}
                  onChange={(event) =>
                    updateCompanyForm("description", event.target.value)
                  }
                  required
                  rows={3}
                  className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Location
                </span>
                <input
                  value={companyForm.location}
                  onChange={(event) =>
                    updateCompanyForm("location", event.target.value)
                  }
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={isCreatingCompany}
              className="mt-6 w-full rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isCreatingCompany ? "Creating company..." : "Create Company"}
            </button>
          </form>

          <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">
              Your Companies
            </h2>

            {isLoadingCompanies ? (
              <div className="mt-5">
                <Loading message="Loading companies..." />
              </div>
            ) : companies.length === 0 ? (
              <div className="mt-5 rounded-md bg-slate-50 p-4 text-sm text-slate-600">
                No companies created yet.
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {companies.map((company) => (
                  <article
                    key={company.id}
                    className="rounded-md border border-slate-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-slate-950">
                        {company.name}
                      </h3>
                      <button
                        type="button"
                        onClick={() => openEditCompany(company)}
                        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {company.location}
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      {company.description}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </aside>
        </div>

        <div className="space-y-8">
          <form
            onSubmit={handleCreateJob}
            className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-slate-950">Create Job</h2>

            {companies.length === 0 && !isLoadingCompanies && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
                Create your company profile before posting a job.
              </div>
            )}

            {jobError && (
              <div className="mt-4">
                <ErrorMessage message={jobError} />
              </div>
            )}

            <div className="mt-5 grid gap-4">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Company
                </span>
                <select
                  value={jobForm.companyId}
                  onChange={(event) =>
                    updateJobForm("companyId", Number(event.target.value))
                  }
                  disabled={companies.length === 0}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-100 disabled:text-slate-500"
                >
                  {companies.length === 0 ? (
                    <option value={0}>No company yet</option>
                  ) : (
                    companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))
                  )}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Title
                </span>
                <input
                  value={jobForm.title}
                  onChange={(event) => updateJobForm("title", event.target.value)}
                  required
                  disabled={companies.length === 0}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-100"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Description
                </span>
                <textarea
                  value={jobForm.description}
                  onChange={(event) =>
                    updateJobForm("description", event.target.value)
                  }
                  required
                  disabled={companies.length === 0}
                  rows={4}
                  className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-100"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700">
                    Location
                  </span>
                  <input
                    value={jobForm.location}
                    onChange={(event) =>
                      updateJobForm("location", event.target.value)
                    }
                    required
                    disabled={companies.length === 0}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700">
                    Job Type
                  </span>
                  <select
                    value={jobForm.jobType}
                    onChange={(event) =>
                      updateJobForm("jobType", event.target.value as JobType)
                    }
                    disabled={companies.length === 0}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-100"
                  >
                    <option value="FULL_TIME">Full time</option>
                    <option value="PART_TIME">Part time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700">
                    Salary Min
                  </span>
                  <input
                    type="number"
                    min="1"
                    placeholder="Salary Min"
                    value={salaryForm.salaryMin}
                    onChange={(event) =>
                      updateSalaryForm("salaryMin", event.target.value)
                    }
                    required
                    disabled={companies.length === 0}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700">
                    Salary Max
                  </span>
                  <input
                    type="number"
                    min="1"
                    placeholder="Salary Max"
                    value={salaryForm.salaryMax}
                    onChange={(event) =>
                      updateSalaryForm("salaryMax", event.target.value)
                    }
                    required
                    disabled={companies.length === 0}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-100"
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isCreatingJob || companies.length === 0}
              className="mt-6 w-full rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isCreatingJob ? "Creating job..." : "Create Job"}
            </button>
          </form>

          <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">
              Created Jobs
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Jobs posted by your company appear here.
            </p>

            {isLoadingJobs ? (
              <div className="mt-5">
                <Loading message="Loading your jobs..." />
              </div>
            ) : employerJobs.length === 0 ? (
              <div className="mt-5 rounded-md bg-slate-50 p-4 text-sm text-slate-600">
                No jobs posted yet.
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {employerJobs.map((job) => (
                  <article
                    key={job.id}
                    className="rounded-md border border-slate-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-950">
                          {job.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {job.company?.name}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {job.location}
                        </p>
                      </div>
                      <span className="rounded-md bg-brand-100 px-2 py-1 text-xs font-semibold text-brand-700">
                        {formatJobType(job.jobType)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-medium text-slate-950">
                      ${job.salaryMin.toLocaleString()} - $
                      {job.salaryMax.toLocaleString()}
                    </p>
                    <Link
                      to={`/jobs/${job.id}`}
                      className="mt-4 inline-flex rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      View Job
                    </Link>
                    <button
                      type="button"
                      onClick={() => openEditJob(job)}
                      className="ml-3 mt-4 inline-flex rounded-md border border-brand-200 bg-white px-3 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                    >
                      Edit
                    </button>
                  </article>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>

      {editingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
          <form
            onSubmit={handleUpdateCompany}
            className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  Edit Company
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Update the profile candidates see when browsing companies.
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditCompany}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>

            {companyError && (
              <div className="mt-4">
                <ErrorMessage message={companyError} />
              </div>
            )}

            <div className="mt-5 grid gap-4">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Company Name
                </span>
                <input
                  value={editCompanyForm.name}
                  onChange={(event) =>
                    updateEditCompanyForm("name", event.target.value)
                  }
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Description
                </span>
                <textarea
                  value={editCompanyForm.description}
                  onChange={(event) =>
                    updateEditCompanyForm("description", event.target.value)
                  }
                  required
                  rows={4}
                  className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Location
                </span>
                <input
                  value={editCompanyForm.location}
                  onChange={(event) =>
                    updateEditCompanyForm("location", event.target.value)
                  }
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeEditCompany}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingCompany}
                className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSavingCompany ? "Saving..." : "Save Company"}
              </button>
            </div>
          </form>
        </div>
      )}

      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 px-4 py-6">
          <form
            onSubmit={handleUpdateJob}
            className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  Edit Job
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Keep job details accurate for candidates.
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditJob}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>

            {jobError && (
              <div className="mt-4">
                <ErrorMessage message={jobError} />
              </div>
            )}

            <div className="mt-5 grid gap-4">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Company
                </span>
                <select
                  value={editJobForm.companyId}
                  onChange={(event) =>
                    updateEditJobForm("companyId", Number(event.target.value))
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                >
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Title
                </span>
                <input
                  value={editJobForm.title}
                  onChange={(event) =>
                    updateEditJobForm("title", event.target.value)
                  }
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Description
                </span>
                <textarea
                  value={editJobForm.description}
                  onChange={(event) =>
                    updateEditJobForm("description", event.target.value)
                  }
                  required
                  rows={4}
                  className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700">
                    Location
                  </span>
                  <input
                    value={editJobForm.location}
                    onChange={(event) =>
                      updateEditJobForm("location", event.target.value)
                    }
                    required
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700">
                    Job Type
                  </span>
                  <select
                    value={editJobForm.jobType}
                    onChange={(event) =>
                      updateEditJobForm("jobType", event.target.value as JobType)
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                  >
                    <option value="FULL_TIME">Full time</option>
                    <option value="PART_TIME">Part time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700">
                    Salary Min
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={editSalaryForm.salaryMin}
                    onChange={(event) =>
                      updateEditSalaryForm("salaryMin", event.target.value)
                    }
                    required
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700">
                    Salary Max
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={editSalaryForm.salaryMax}
                    onChange={(event) =>
                      updateEditSalaryForm("salaryMax", event.target.value)
                    }
                    required
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                  />
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeEditJob}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingJob}
                className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSavingJob ? "Saving..." : "Save Job"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

export default Dashboard;
