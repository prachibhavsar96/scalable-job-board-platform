import { z } from "zod";

export const createJobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  salaryMin: z.number().int().nonnegative(),
  salaryMax: z.number().int().nonnegative(),
  jobType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"]),
  companyId: z.number().int().positive(),
}).refine((data) => data.salaryMax >= data.salaryMin, {
  message: "salaryMax must be greater than or equal to salaryMin",
  path: ["salaryMax"],
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export const updateJobSchema = createJobSchema;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;

export const getJobsQuerySchema = z.object({
  title: z.string().trim().min(1).optional(),
  location: z.string().trim().min(1).optional(),
  jobType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"]).optional(),
  minSalary: z.coerce.number().int().nonnegative().optional(),
  maxSalary: z.coerce.number().int().nonnegative().optional(),
  remoteOnly: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(["newest", "salaryHigh", "salaryLow"]).default("newest"),
});

export type GetJobsQueryInput = z.infer<typeof getJobsQuerySchema>;
