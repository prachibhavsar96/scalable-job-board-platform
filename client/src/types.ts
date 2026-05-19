export type JobType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";

export type Company = {
  id: number;
  name: string;
  description: string;
  location: string;
  employerId?: number | null;
  jobs?: Job[];
};

export type Job = {
  id: number;
  title: string;
  description: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  jobType: JobType;
  companyId: number;
  company?: Company;
  createdAt: string;
  updatedAt: string;
};

export type JobDetailsResponse = Job & {
  similarJobs?: Job[];
};

export type JobsResponse = {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: Job[];
};

export type JobFilters = {
  title: string;
  location: string;
  jobType: "" | JobType;
  minSalary: string;
  maxSalary: string;
  remoteOnly: boolean;
  sortBy: "newest" | "salaryHigh" | "salaryLow";
  page: number;
};

export type CreateJobInput = {
  title: string;
  description: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  jobType: JobType;
  companyId: number;
};

export type CreateCompanyInput = {
  name: string;
  description: string;
  location: string;
};

export type UserRole = "CANDIDATE" | "EMPLOYER";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthResponse = {
  success: boolean;
  token: string;
  user: AuthUser;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export type ApplicationStatus =
  | "APPLIED"
  | "REVIEWED"
  | "SHORTLISTED"
  | "REJECTED"
  | "WITHDRAWN"
  | "ACCEPTED";

export type Application = {
  id: number;
  userId: number;
  jobId: number;
  resumePath: string;
  coverLetter: string;
  status: ApplicationStatus;
  job: Job;
  user?: AuthUser;
  createdAt: string;
  updatedAt: string;
};

export type CreateApplicationInput = {
  jobId: number;
  resume: File;
  coverLetter: string;
};

export type SavedJob = {
  id: number;
  userId: number;
  jobId: number;
  job: Job;
  createdAt: string;
};
