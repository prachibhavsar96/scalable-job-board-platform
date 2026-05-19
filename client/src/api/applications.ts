import api from "./client";
import type {
  Application,
  ApplicationStatus,
  CreateApplicationInput,
} from "../types";

export async function createApplication(
  data: CreateApplicationInput,
  token: string
) {
  const formData = new FormData();

  formData.append("jobId", String(data.jobId));
  formData.append("coverLetter", data.coverLetter);
  formData.append("resume", data.resume);

  const response = await api.post<Application>("/api/applications", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function getApplicationsByUserId(userId: number, token: string) {
  const response = await api.get<Application[]>(
    `/api/applications/user/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function getMyApplications(token: string) {
  const response = await api.get<Application[]>("/api/applications/user/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function getApplications() {
  const response = await api.get<Application[]>("/api/applications");

  return response.data;
}

export async function getEmployerApplications(token: string) {
  const response = await api.get<Application[]>("/api/applications/employer/received", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function updateApplicationStatus(
  applicationId: number,
  status: ApplicationStatus,
  token: string
) {
  const response = await api.patch<Application>(
    `/api/applications/${applicationId}/status`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

type WithdrawApplicationResponse = {
  success: boolean;
  message: string;
  data: Application;
};

export async function withdrawApplication(applicationId: number, token: string) {
  const response = await api.delete<WithdrawApplicationResponse>(
    `/api/applications/${applicationId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}
