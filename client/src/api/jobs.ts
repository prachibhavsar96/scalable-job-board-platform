import api from "./client";
import type {
  CreateJobInput,
  Job,
  JobDetailsResponse,
  JobFilters,
  JobsResponse,
} from "../types";

export async function getJobs(filters: JobFilters) {
  const response = await api.get<JobsResponse | Job[]>("/api/jobs", {
    params: {
      title: filters.title || undefined,
      location: filters.location || undefined,
      jobType: filters.jobType || undefined,
      minSalary: filters.minSalary || undefined,
      maxSalary: filters.maxSalary || undefined,
      remoteOnly: filters.remoteOnly ? "true" : undefined,
      sortBy: filters.sortBy,
      page: filters.page,
      limit: 6,
    },
  });

  if (Array.isArray(response.data)) {
    return {
      success: true,
      total: response.data.length,
      page: filters.page,
      limit: response.data.length,
      totalPages: 1,
      data: response.data,
    };
  }

  return {
    ...response.data,
    total: response.data.total ?? response.data.data.length,
    totalPages:
      response.data.totalPages ??
      Math.max(1, Math.ceil((response.data.total ?? response.data.data.length) / 6)),
  };
}

export async function getJobById(id: string) {
  const response = await api.get<JobDetailsResponse>(`/api/jobs/${id}`);

  return response.data;
}

export async function createJob(data: CreateJobInput, token: string) {
  const response = await api.post<Job>("/api/jobs", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function updateJob(id: number, data: CreateJobInput, token: string) {
  const response = await api.put<Job>(`/api/jobs/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function getEmployerJobs(token: string) {
  const response = await api.get<Job[]>("/api/jobs/employer/my-jobs", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}
