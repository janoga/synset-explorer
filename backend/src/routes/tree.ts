import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { TreeNode, TreeResponse } from '@synset-explorer/shared';

const childrenQuerySchema = z.object({
  path: z.string().min(1, 'Path parameter is required'),
});

type TreeQuerystring = z.infer<typeof childrenQuerySchema>;

type ChildrenResponse = TreeNode[];

interface ErrorResponse {
  error: string;
}

export const treeRoutes: FastifyPluginAsync = async (fastify) => {
  // Get root node only (lazy loading - don't load entire tree)
  fastify.get<{ Reply: TreeResponse }>('/', async (): Promise<TreeResponse> => {
    // Get total count for stats
    const totalSynsets = await fastify.prisma.synset.count({
      where: { deleted: false },
    });

    if (totalSynsets === 0) {
      return { tree: { name: 'No data', size: 0, children: [] }, totalSynsets: 0 };
    }

    // Find root node(s) - paths without ' > ' separator
    const rootSynsets = await fastify.prisma.synset.findMany({
      where: {
        deleted: false,
        NOT: { path: { contains: ' > ' } },
      },
      select: { path: true, size: true },
      orderBy: { path: 'asc' },
    });

    if (rootSynsets.length === 0) {
      return { tree: { name: 'No data', size: 0, children: [] }, totalSynsets };
    }

    // For now, assuming single root node (ImageNet 2011 Fall Release)
    const rootSynset = rootSynsets[0];

    // Check if root has children
    const hasChildren = await fastify.prisma.synset.findFirst({
      where: {
        deleted: false,
        path: { startsWith: `${rootSynset.path} > ` },
      },
    });

    const tree: TreeNode = {
      name: rootSynset.path,
      size: rootSynset.size,
      path: rootSynset.path,
      children: hasChildren ? [] : undefined, // Empty array indicates "has children but not loaded"
    };

    return { tree, totalSynsets };
  });

  // Get children of a specific node (lazy loading)
  fastify.get<{
    Querystring: TreeQuerystring;
    Reply: ChildrenResponse | ErrorResponse;
  }>(
    '/children',
    async (
      request: FastifyRequest<{ Querystring: TreeQuerystring }>,
      reply: FastifyReply
    ): Promise<ChildrenResponse | ErrorResponse> => {
      // Validate query parameters
      const validation = childrenQuerySchema.safeParse(request.query);

      if (!validation.success) {
        return reply.code(400).send({
          error: validation.error.issues[0]?.message || 'Invalid query parameters',
        });
      }

      const { path } = validation.data;

      // Use SQL pattern matching to avoid fetching all descendants
      const pathPrefix = `${path} > `;

      const directChildren = await fastify.prisma.$queryRaw<Array<{ path: string; size: number }>>`
        SELECT path, size
        FROM synsets
        WHERE deleted = false
          AND path LIKE ${pathPrefix + '%'}
          AND path NOT LIKE ${pathPrefix + '%' + ' > ' + '%'}
        ORDER BY path ASC
      `;

      // Transform to TreeNode format
      // Use the 'size' field which represents number of descendants
      // If size > 0, the node has children
      const children: TreeNode[] = directChildren.map((synset) => {
        const name = synset.path.split(' > ').pop() || synset.path;
        const hasChildren = synset.size > 0;

        return {
          name,
          size: synset.size,
          path: synset.path,
          children: hasChildren ? [] : undefined,
        };
      });

      return children;
    }
  );
};
