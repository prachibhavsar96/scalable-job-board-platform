import prisma from "../../db/prisma";
import {
  CreateApplicationInput,
  UpdateApplicationStatusInput,
} from "./application.validation";

type CreateApplicationData = CreateApplicationInput & {
  userId: number;
  resumePath: string;
};

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

export class ApplicationNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApplicationNotFoundError";
  }
}

export class ApplicationForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApplicationForbiddenError";
  }
}

export async function createApplication(data: CreateApplicationData) {
  const user = await prisma.user.findUnique({
    where: { id: data.userId },
  });

  if (!user) {
    throw new ApplicationNotFoundError(
      `User with id ${data.userId} does not exist`
    );
  }

  const job = await prisma.job.findUnique({
    where: { id: data.jobId },
  });

  if (!job) {
    throw new ApplicationNotFoundError(
      `Job with id ${data.jobId} does not exist`
    );
  }

  return prisma.application.create({
    data: {
      userId: data.userId,
      jobId: data.jobId,
      resumePath: data.resumePath,
      coverLetter: data.coverLetter,
      status: data.status,
    },
    include: {
      user: {
        select: safeUserSelect,
      },
      job: true,
    },
  });
}

export function getApplications() {
  return prisma.application.findMany({
    include: {
      user: {
        select: safeUserSelect,
      },
      job: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export function getApplicationsByUserId(userId: number) {
  return prisma.application.findMany({
    where: { userId },
    include: {
      user: {
        select: safeUserSelect,
      },
      job: {
        include: {
          company: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export function getApplicationsForCandidate(candidateId: number) {
  return getApplicationsByUserId(candidateId);
}

export async function withdrawApplicationForCandidate(
  applicationId: number,
  candidateId: number
) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    throw new ApplicationNotFoundError(
      `Application with id ${applicationId} does not exist`
    );
  }

  if (application.userId !== candidateId) {
    throw new ApplicationForbiddenError(
      "You can only withdraw your own applications"
    );
  }

  return prisma.application.update({
    where: { id: applicationId },
    data: {
      status: "WITHDRAWN",
    },
    include: {
      user: {
        select: safeUserSelect,
      },
      job: {
        include: {
          company: true,
        },
      },
    },
  });
}

export function getApplicationsByEmployerId(employerId: number) {
  return prisma.application.findMany({
    where: {
      job: {
        company: {
          employerId,
        },
      },
    },
    include: {
      user: {
        select: safeUserSelect,
      },
      job: {
        include: {
          company: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateApplicationStatusForEmployer(
  applicationId: number,
  employerId: number,
  data: UpdateApplicationStatusInput
) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      job: {
        include: {
          company: true,
        },
      },
    },
  });

  if (!application) {
    throw new ApplicationNotFoundError(
      `Application with id ${applicationId} does not exist`
    );
  }

  if (application.job.company.employerId !== employerId) {
    throw new ApplicationForbiddenError(
      "You can only update applications for jobs owned by your companies"
    );
  }

  return prisma.application.update({
    where: { id: applicationId },
    data: {
      status: data.status,
    },
    include: {
      user: {
        select: safeUserSelect,
      },
      job: {
        include: {
          company: true,
        },
      },
    },
  });
}
