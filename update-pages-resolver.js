// @flow
import type { GraphQLResolveInfo } from 'graphql';
import type { Context, ExtractDepsType } from 'fusion-core';
import type { DepsType } from '../camopress-resolver.js';
import type { UpdatePagesArgsType, Page } from '../__generated__/camopress-schema-types.js';

export default function getUpdatePagesResolver({ logger, Camopress }: ExtractDepsType<DepsType>) {
  return async function updatePages(
    parent: void,
    args: UpdatePagesArgsType,
    context: Context,
    info: GraphQLResolveInfo
  ): Promise<Page[]> {
    const results = await Promise.all(
      (args.request || []).map(async (page) => {
        const { pageId, isLive } = page;
        const result = await Camopress.updatePage(
          { request: { pageId, isLive, isLiveIsSet: true } },
          context,
          info
        );
        return result;
      })
    );
    return results;
  };
}
