import prisma from "../../db/prisma";
import { CreateCompanyInput, UpdateCompanyInput } from "./company.validation";

const safeEmployerSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
};

export function createCompany(data: CreateCompanyInput, employerId: number) {
  return prisma.company.create({
    data: {
      ...data,
      employerId,
    },
    include: {
      employer: {
        select: safeEmployerSelect,
      },
      jobs: true,
    },
  });
}

export function getCompanies() {
  return prisma.company.findMany({
    include: {
      employer: {
        select: safeEmployerSelect,
      },
      jobs: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export function getCompanyById(id: number) {
  return prisma.company.findUnique({
    where: { id },
    include: {
      employer: {
        select: safeEmployerSelect,
      },
      jobs: {
        include: {
          company: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
}

export async function updateCompany(
  id: number,
  data: UpdateCompanyInput,
  employerId: number
) {
  const company = await prisma.company.findUnique({
    where: { id },
    select: {
      id: true,
      employerId: true,
    },
  });

  if (!company) {
    return null;
  }

  if (company.employerId !== employerId) {
    throw new Error("Forbidden");
  }

  return prisma.company.update({
    where: { id },
    data,
    include: {
      employer: {
        select: safeEmployerSelect,
      },
      jobs: true,
    },
  });
}

export function getCompaniesByEmployerId(employerId: number) {
  return prisma.company.findMany({
    where: { employerId },
    include: {
      employer: {
        select: safeEmployerSelect,
      },
      jobs: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
