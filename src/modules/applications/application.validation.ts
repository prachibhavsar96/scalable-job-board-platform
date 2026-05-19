import { z } from "zod";

export const createApplicationSchema = z.object({
  userId: z.number().int("User id must be a whole number").positive().optional(),
  jobId: z.coerce.number().int("Job id must be a whole number").positive(),
  coverLetter: z.string().min(1, "Cover letter is required"),
  status: z
    .enum([
      "APPLIED",
      "REVIEWED",
      "SHORTLISTED",
      "REJECTED",
      "WITHDRAWN",
      "ACCEPTED",
    ])
    .optional(),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;

export const updateApplicationStatusSchema = z.object({
  status: z.enum([
    "APPLIED",
    "REVIEWED",
    "SHORTLISTED",
    "REJECTED",
    "WITHDRAWN",
    "ACCEPTED",
  ]),
});

export type UpdateApplicationStatusInput = z.infer<
  typeof updateApplicationStatusSchema
>;
