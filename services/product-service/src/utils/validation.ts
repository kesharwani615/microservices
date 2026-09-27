import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  price: z.number().positive("Price must be greater than 0"),
  category: z.string().min(2, "Category is required"),
  imageUrl: z.string().url("Invalid image URL").optional(),
  isActive: z.boolean().optional(),
});

export const updateProductSchema = z
  .object({
    name: z.string().min(2).optional(),
    description: z.string().min(5).optional(),
    price: z.number().positive().optional(),
    category: z.string().min(2).optional(),
    imageUrl: z.string().url().nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update",
  });