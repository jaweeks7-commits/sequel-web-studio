import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const insights = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/insights' }),
  schema: z.object({
    title:                  z.string(),
    description:            z.string(),
    category:               z.enum(['methodology', 'pricing', 'findings', 'myths', 'deliverable']),
    length:                 z.enum(['short', 'medium', 'long']),
    publishOrder:           z.number(),
    linkedinReleaseOrder:   z.number().optional(),
    publishDate:            z.coerce.date(),
    featured:               z.boolean().optional(),
  }),
});

export const collections = { insights };
