import prisma from "../../db/prisma";
import { Prisma } from "@prisma/client";
import { CreateJobInput, GetJobsQueryInput, UpdateJobInput } from "./job.validation";

export function createJob(data: CreateJobInput) {
  return prisma.job.create({
    data,
    include: { company: true },
  });
}

export async function getJobs(query: GetJobsQueryInput) {
  const where: Prisma.JobWhereInput = {};

  if (query.title) {
    where.OR = [
      {
        title: {
          contains: query.title,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: query.title,
          mode: "insensitive",
        },
      },
    ];
  }

  if (query.location) {
    where.location = {
      contains: query.location,
      mode: "insensitive",
    };
  }

  if (query.jobType) {
    where.jobType = query.jobType;
  }

  if (query.minSalary !== undefined) {
    where.salaryMax = {
      gte: query.minSalary,
    };
  }

  if (query.maxSalary !== undefined) {
    where.salaryMin = {
      lte: query.maxSalary,
    };
  }

  if (query.remoteOnly) {
    where.location = {
      contains: "Remote",
      mode: "insensitive",
    };
  }

  const skip = (query.page - 1) * query.limit;
  const orderBy: Prisma.JobOrderByWithRelationInput =
    query.sortBy === "salaryHigh"
      ? { salaryMax: "desc" }
      : query.sortBy === "salaryLow"
        ? { salaryMin: "asc" }
        : { createdAt: "desc" };

  const [total, data] = await prisma.$transaction([
    prisma.job.count({ where }),
    prisma.job.findMany({
      where,
      include: { company: true },
      skip,
      take: query.limit,
      orderBy,
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / query.limit));

  return {
    success: true,
    total,
    page: query.page,
    limit: query.limit,
    totalPages,
    data,
  };
}

function getTitleKeywords(title: string) {
  return title
    .split(/\s+/)
    .map((word) => word.replace(/[^a-zA-Z0-9.#+-]/g, ""))
    .filter((word) => word.length >= 3)
    .slice(0, 3);
}

export async function getJobById(id: number) {
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      company: true,
      applications: true,
    },
  });

  if (!job) {
    return null;
  }

  const titleKeywords = getTitleKeywords(job.title);
  const similarJobs = await prisma.job.findMany({
    where: {
      id: {
        not: job.id,
      },
      OR: [
        {
          jobType: job.jobType,
        },
        {
          location: {
            contains: job.location,
            mode: "insensitive",
          },
        },
        ...titleKeywords.map((keyword) => ({
          title: {
            contains: keyword,
            mode: "insensitive" as const,
          },
        })),
      ],
    },
    include: {
      company: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 3,
  });

  return {
    ...job,
    similarJobs,
  };
}

export async function updateJob(
  id: number,
  data: UpdateJobInput,
  employerId: number
) {
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      company: true,
    },
  });

  if (!job) {
    return null;
  }

  if (job.company.employerId !== employerId) {
    throw new Error("Forbidden");
  }

  const targetCompany = await prisma.company.findUnique({
    where: { id: data.companyId },
    select: {
      id: true,
      employerId: true,
    },
  });

  if (!targetCompany) {
    throw new Error("Company not found");
  }

  if (targetCompany.employerId !== employerId) {
    throw new Error("Forbidden");
  }

  return prisma.job.update({
    where: { id },
    data,
    include: {
      company: true,
    },
  });
}

export async function getJobsByEmployerId(employerId: number) {
  const companies = await prisma.company.findMany({
    where: { employerId },
    select: { id: true },
  });
  const companyIds = companies.map((company) => company.id);

  if (companyIds.length === 0) {
    return [];
  }

  return prisma.job.findMany({
    where: {
      companyId: {
        in: companyIds,
      },
    },
    include: {
      company: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
