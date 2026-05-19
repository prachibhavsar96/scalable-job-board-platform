import { z } from "zod";

export const createCompanySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export const updateCompanySchema = createCompanySchema;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
