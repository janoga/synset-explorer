import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { SearchResult, SearchResponse } from '@synset-explorer/shared';

const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query cannot be empty').trim(),
});

type SearchQuerystring = z.infer<typeof searchQuerySchema>;

interface ErrorResponse {
  error: string;
}

interface SynsetSelect {
  path: string;
  size: number;
}

export const searchRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<{
    Querystring: SearchQuerystring;
    Reply: SearchResponse | ErrorResponse;
  }>(
    '/',
    async (
      request: FastifyRequest<{ Querystring: SearchQuerystring }>,
      reply: FastifyReply
    ): Promise<SearchResponse | ErrorResponse> => {
      // Validate query parameters
      const validation = searchQuerySchema.safeParse(request.query);

      if (!validation.success) {
        return reply.code(400).send({
          error: validation.error.issues[0]?.message || 'Invalid query parameters',
        });
      }

      const { q } = validation.data;
      const searchTerm = q;

      // Use PostgreSQL full-text search for better performance and relevance
      // Search for nodes where any part of the path matches the search term
      const synsets = await fastify.prisma.synset.findMany({
        where: {
          deleted: false,
          OR: [
            // Exact phrase match (highest priority)
            {
              path: {
                contains: searchTerm,
                mode: 'insensitive' as const,
              },
            },
            // Word-level match (individual words)
            ...searchTerm.split(/\s+/).map((word) => ({
              path: {
                contains: word,
                mode: 'insensitive' as const,
              },
            })),
          ],
        },
        select: { path: true, size: true },
        orderBy: [
          // Prioritize matches at the end of the path (leaf nodes)
          { path: 'asc' },
        ],
        take: 100, // Limit results for performance
      });

      // Transform results to include path expansion info
      const results: SearchResult[] = synsets.map((synset: SynsetSelect) => {
        const pathParts = synset.path.split(' > ');
        const name = pathParts[pathParts.length - 1];

        return {
          path: synset.path,
          size: synset.size,
          name,
          pathParts,
        };
      });

      return {
        query: searchTerm,
        count: results.length,
        results,
      };
    }
  );
};
