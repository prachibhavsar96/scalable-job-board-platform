import api from "./client";
import type { Company, CreateCompanyInput } from "../types";

type CompaniesResponse = {
  success: boolean;
  data: Company[];
};

export async function getCompanies() {
  const response = await api.get<Company[] | CompaniesResponse>(
    "/api/companies"
  );

  return Array.isArray(response.data) ? response.data : response.data.data;
}

export async function getCompanyById(id: string) {
  const response = await api.get<Company>(`/api/companies/${id}`);

  return response.data;
}

export async function getMyCompanies(token: string) {
  const response = await api.get<Company[]>("/api/companies/my-companies", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function createCompany(data: CreateCompanyInput, token: string) {
  const response = await api.post<Company>("/api/companies", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function updateCompany(
  id: number,
  data: CreateCompanyInput,
  token: string
) {
  const response = await api.put<Company>(`/api/companies/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}
