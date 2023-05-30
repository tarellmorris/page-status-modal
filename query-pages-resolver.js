// @flow
import type { GraphQLResolveInfo } from 'graphql';
import type { Context, ExtractDepsType } from 'fusion-core';
import type { DepsType } from '../camopress-resolver.js';
import type {
  QueryPagesArgsType,
  QueryPagesResponse,
} from '../__generated__/camopress-schema-types.js';

export default function getQueryPagesResolver({ logger, Camopress }: ExtractDepsType<DepsType>) {
  return async function queryPages(
    parent: void,
    args: QueryPagesArgsType,
    context: Context,
    info: GraphQLResolveInfo
  ): Promise<QueryPagesResponse> {
    const results = await Promise.all(
      (args.request.countryCodes || []).map(async (countryCode) => {
        const { url, theNamespace, locale } = args.request;
        try {
          const result = await Camopress.queryPage(
            { request: { url, theNamespace, countryCode, locale, bypassCache: true } },
            context,
            info
          );
          return {
            page: result?.page,
            countryCode,
            isError: false,
            errorMessage: '',
          };
        } catch (error) {
          logger.error('queryPage_error', error);
          return { page: null, countryCode, isError: true, errorMessage: error.message };
        }
      })
    );
    return { pages: results };
  };
}
