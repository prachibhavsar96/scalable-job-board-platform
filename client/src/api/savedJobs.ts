import api from "./client";
import type { SavedJob } from "../types";

export async function saveJob(jobId: number, token: string) {
  const response = await api.post<SavedJob>(
    `/api/saved-jobs/${jobId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function getMySavedJobs(token: string) {
  const response = await api.get<SavedJob[]>("/api/saved-jobs/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function removeSavedJob(jobId: number, token: string) {
  const response = await api.delete(`/api/saved-jobs/${jobId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}
