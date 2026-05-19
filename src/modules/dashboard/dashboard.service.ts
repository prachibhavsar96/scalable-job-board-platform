import prisma from "../../db/prisma";

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

export async function getPublicStats(): Promise<PublicStats> {
  const [
    activeJobs,
    companiesHiring,
    totalApplications,
    remoteOpportunities,
  ] = await prisma.$transaction([
    prisma.job.count(),
    prisma.company.count(),
    prisma.application.count(),
    prisma.job.count({
      where: {
        location: {
          contains: "remote",
          mode: "insensitive",
        },
      },
    }),
  ]);

  return {
    activeJobs,
    companiesHiring,
    totalApplications,
    remoteOpportunities,
  };
}

export async function getEmployerStats(
  employerId: number
): Promise<EmployerStats> {
  const companies = await prisma.company.findMany({
    where: {
      employerId,
    },
    select: {
      id: true,
    },
  });

  const companyIds = companies.map((company) => company.id);

  if (companyIds.length === 0) {
    return {
      jobsPosted: 0,
      companiesManaged: 0,
      applicationsReceived: 0,
      remoteJobsPosted: 0,
    };
  }

  const [jobsPosted, applicationsReceived, remoteJobsPosted] =
    await prisma.$transaction([
      prisma.job.count({
        where: {
          companyId: {
            in: companyIds,
          },
        },
      }),
      prisma.application.count({
        where: {
          job: {
            companyId: {
              in: companyIds,
            },
          },
        },
      }),
      prisma.job.count({
        where: {
          companyId: {
            in: companyIds,
          },
          location: {
            contains: "remote",
            mode: "insensitive",
          },
        },
      }),
    ]);

  return {
    jobsPosted,
    companiesManaged: companies.length,
    applicationsReceived,
    remoteJobsPosted,
  };
}
