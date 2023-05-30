import { useMutation, useQuery } from '@apollo/react-hooks';
import { useLocation, useParams } from 'fusion-plugin-react-router';

import {
  QUERY_PAGE_STATUS,
  QUERY_PAGES,
  QUERY_TEMPLATE_STATUS,
  UPDATE_PAGES,
  UPDATE_PAGES_STATUS,
  UPDATE_TEMPLATE_STATUS,
} from '../../graphql/page-edit-tags';
import { getQueryParamsFromLocation, isParamNonZero } from '../../utils/routing';
import { useFindListRoutePattern } from '../page-settings/use-find-list-route-pattern';

export const useBulkPageStatus = (countryCodes: Array<string>) => {
  // @ts-expect-error todo(ts-migration) TS2339 Property 'namespace' does not exist on type '{}'.
  const { templateId, namespace } = useParams();
  const location = useLocation();
  const { locale: localeName } = getQueryParamsFromLocation(location, ['locale']);
  const countryCodesFormatted = countryCodes?.map((code) => code.toUpperCase());

  const {
    data: templateData,
    loading: queryTemplateStatusLoading,
    refetch: queryTemplateStatusRefetch,
  } = useQuery(QUERY_TEMPLATE_STATUS, {
    variables: {
      id: templateId,
    },
    skip: !templateId,
  });

  const { routePattern, loading: listRoutePatternsLoading } = useFindListRoutePattern();

  const {
    data: initialQueryPagesData,
    error: queryPagesError,
    loading: queryPagesLoading,
    refetch: queryPagesRefetch,
  } = useQuery(QUERY_PAGES, {
    variables: {
      url: routePattern?.pattern,
      theNamespace: namespace,
      countryCodes: countryCodesFormatted,
      locale: localeName || 'en',
    },
    fetchPolicy: 'no-cache',
    skip: !templateData || !namespace || !routePattern || !countryCodes,
  });

  const queryPagesData = initialQueryPagesData?.queryPages?.pages?.map((result) => {
    const { page, countryCode, isError, errorMessage } = result;
    const isLiveIsSet = page?.isLiveIsSet;
    const isLive = isLiveIsSet ? page?.isLive : templateData?.queryTemplate?.defaultsPageIsLive;
    return { ...page, countryCode, isError, errorMessage, isLive };
  });

  const loading = queryPagesLoading || listRoutePatternsLoading || queryTemplateStatusLoading;

  return {
    queryPagesData,
    queryPagesError,
    queryTemplateStatusRefetch,
    queryPagesRefetch,
    loading,
  };
};

export const useBulkUpdatePageStatus = (
  url: string,
  supportedLocalesByCountry: Array<{
    key: string;
    value: Array<string>;
  }>,
  namespace: string,
  refetchTemplateData: () => unknown,
  refetchPageData: () => unknown,
  onDone?: () => void
): ReturnType<typeof useBulkUpdatePageStatus> => {
  const [
    bulkUpdateLocaleStatuses,
    { data: bulkUpdateLocaleData, loading: bulkUpdateLocaleLoading, error: bulkUpdateLocaleError },
  ] = useMutation(UPDATE_PAGES_STATUS, {
    onCompleted: () => {
      refetchTemplateData();
      refetchPageData();
    },
  });

  const [
    bulkUpdatePageStatus,
    {
      data: bulkUpdatePageStatusData,
      loading: bulkUpdatePageStatusLoading,
      error: bulkUpdatePageStatusError,
    },
  ] = useMutation(UPDATE_PAGES, {
    onCompleted: () => {
      refetchPageData();
      if (onDone) {
        onDone();
      }
    },
  });

  const updatePageStatuses = (
    countryStatusUpdateData: Array<{ countryCode: string; pageId: string; isLive: boolean }>
  ) => {
    supportedLocalesByCountry?.forEach((country) => {
      const countryData = countryStatusUpdateData?.find(
        (update) => update?.countryCode === country?.key
      );
      const { countryCode, isLive } = countryData;
      const locales = supportedLocalesByCountry.find((locale) => locale.key === countryCode);

      bulkUpdateLocaleStatuses({
        variables: {
          url,
          countryCode,
          theNamespace: namespace,
          supportedLocalesByCountry: locales,
          status: isLive,
        },
      });
    });

    bulkUpdatePageStatus({
      variables: {
        pages: countryStatusUpdateData?.map((update) => ({
          pageId: update.pageId,
          isLive: update.isLive,
        })),
      },
    });
  };

  return [
    updatePageStatuses,
    {
      pageStatus: {
        bulkUpdatePageStatusData,
        bulkUpdatePageStatusLoading,
        bulkUpdatePageStatusError,
      },
      localeStatus: {
        bulkUpdateLocaleData,
        bulkUpdateLocaleLoading,
        bulkUpdateLocaleError,
      },
    },
  ];
};

export const usePageStatus = () => {
  // @ts-expect-error todo(ts-migration) TS2339 Property 'templateId' does not exist on type '{}'.
  const { templateId, namespace } = useParams();
  const location = useLocation();
  const { country: countryName, locale: localeName } = getQueryParamsFromLocation(location, [
    'country',
    'locale',
  ]);
  const countryCode = (countryName || '').toUpperCase();

  const {
    data: templateData,
    loading: queryTemplateStatusLoading,
    refetch: refetchTemplateData,
  } = useQuery(QUERY_TEMPLATE_STATUS, {
    variables: {
      id: templateId,
    },
    skip: !templateId,
  });

  const { routePattern, loading: listRoutePatternsLoading } = useFindListRoutePattern();

  const {
    data: pageData,
    loading: queryPagesLoading,
    refetch: refetchPageData,
  } = useQuery(QUERY_PAGE_STATUS, {
    variables: {
      url: routePattern?.pattern,
      theNamespace: namespace,
      countryCode,
      locale: localeName || 'en',
      bypassCache: true,
    },
    fetchPolicy: 'no-cache',
    skip: !templateData || !namespace || !isParamNonZero(countryName) || !routePattern,
  });

  const isLiveIsSet = pageData?.queryPage?.page?.isLiveIsSet;
  const isLive = isLiveIsSet
    ? pageData?.queryPage?.page?.isLive
    : templateData?.queryTemplate?.defaultsPageIsLive;

  const loading = queryTemplateStatusLoading || queryPagesLoading || listRoutePatternsLoading;

  return {
    isLive,
    pageId: pageData?.queryPage?.page?.id,
    loading,
    url: routePattern?.pattern || '',
    supportedLocalesByCountry: templateData?.queryTemplate?.supportedLocalesByCountry || [],
    namespace,
    countryCode,
    refetchTemplateData,
    refetchPageData,
  };
};

export const useUpdatePageStatus = (
  url: string,
  supportedLocalesByCountry: Array<{
    key: string;
    value: Array<string>;
  }>,
  namespace: string,
  countryName: string,
  refetchTemplateData: () => unknown,
  refetchPageData: () => unknown,
  onDone?: () => void
) => {
  // @ts-expect-error todo(ts-migration) TS2339 Property 'templateId' does not exist on type '{}'.
  const { templateId } = useParams();

  const [updateTemplateStatus, updateTemplateStatusData] = useMutation(UPDATE_TEMPLATE_STATUS, {
    onCompleted: () => {
      refetchTemplateData();
      if (onDone) {
        onDone();
      }
    },
  });

  // Update page status needs to be called for each locale in the current country, use UPDATE_PAGES_STATUS
  const [updatePagesStatus, updatePagesStatusData] = useMutation(UPDATE_PAGES_STATUS, {
    onCompleted: () => {
      refetchPageData();
      if (onDone) {
        onDone();
      }
    },
  });

  const updateStatus = (nextStatus: boolean, pageId?: string) => {
    if (pageId) {
      updatePagesStatus({
        variables: {
          url,
          theNamespace: namespace,
          countryCode: countryName,
          supportedLocalesByCountry,
          status: nextStatus,
        },
      });
    } else {
      updateTemplateStatus({ variables: { templateId, status: nextStatus } });
    }
  };

  const loading = updatePagesStatusData.loading || updateTemplateStatusData.loading;

  return { updateStatus, loading };
};
