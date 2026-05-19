import api from "./client";

export type EmployerStats = {
  jobsPosted: number;
  companiesManaged: number;
  applicationsReceived: number;
  remoteJobsPosted: number;
};

export type PublicStats = {
  activeJobs: number;
  companiesHiring: number;
  totalApplications: number;
  remoteOpportunities: number;
};

type EmployerStatsResponse = {
  success: boolean;
  data: EmployerStats;
};

type PublicStatsResponse = {
  success: boolean;
  data: PublicStats;
};

export async function getPublicStats() {
  const response = await api.get<PublicStatsResponse>(
    "/api/dashboard/public-stats"
  );

  return response.data.data;
}

export async function getEmployerStats(token: string) {
  const response = await api.get<EmployerStatsResponse>(
    "/api/dashboard/employer-stats",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.data;
}
