// src/content.config.ts
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const writeups = defineCollection({
  loader: glob({ pattern: "**/index.md", base: "./src/content/writeups" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      platform: z.string().optional(),
      difficulty: z.enum(["Easy", "Medium", "Hard", "Insane"]).optional(),
      os: z.enum(["Linux", "Windows"]).optional(),
      publishedAt: z.coerce.date().optional(),
      releaseDate: z.coerce.date().optional(),
      date: z.coerce.date().optional(),
      userRank: z.union([z.number(), z.string()]).optional(),
      rating: z.number().min(0).max(5).optional(),
      tags: z.array(z.string()).optional(),
      image: image().optional(),
      imageShape: z.enum(["round", "square"]).optional().default("round"),
    }),
});

const vault = defineCollection({
  loader: glob({ pattern: "**/index.md", base: "./src/content/vault" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      category: z.string().optional(),
      date: z.coerce.date().optional(),
      tags: z.array(z.string()).optional(),
      image: image().optional(),
    }),
});

export const collections = { writeups, vault };