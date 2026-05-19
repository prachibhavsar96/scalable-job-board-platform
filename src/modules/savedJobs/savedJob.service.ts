import prisma from "../../db/prisma";

export class SavedJobNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SavedJobNotFoundError";
  }
}

export class SavedJobJobNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SavedJobJobNotFoundError";
  }
}

export async function saveJobForCandidate(userId: number, jobId: number) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
  });

  if (!job) {
    throw new SavedJobJobNotFoundError(`Job with id ${jobId} does not exist`);
  }

  return prisma.savedJob.upsert({
    where: {
      userId_jobId: {
        userId,
        jobId,
      },
    },
    update: {},
    create: {
      userId,
      jobId,
    },
    include: {
      job: {
        include: {
          company: true,
        },
      },
    },
  });
}

export function getSavedJobsForCandidate(userId: number) {
  return prisma.savedJob.findMany({
    where: {
      userId,
    },
    include: {
      job: {
        include: {
          company: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function removeSavedJobForCandidate(userId: number, jobId: number) {
  const savedJob = await prisma.savedJob.findUnique({
    where: {
      userId_jobId: {
        userId,
        jobId,
      },
    },
  });

  if (!savedJob) {
    throw new SavedJobNotFoundError("Saved job not found");
  }

  await prisma.savedJob.delete({
    where: {
      id: savedJob.id,
    },
  });
}
