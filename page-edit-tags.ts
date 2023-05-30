import gql from 'graphql-tag';

export const QUERY_TEMPLATE = gql`
  query QueryTemplate($id: String) {
    queryTemplate(request: { id: $id }) {
      id
      name
      slug
      theNamespace
      isCountryVariant
      draftTemplateVariables
      publishedTemplateVariables
      pageElements {
        pageElementType
        louvreBlock {
          blockId
          metadata
        }
        associatedTemplate {
          templateId
        }
        extension {
          extensionId
        }
      }
      isAssociatedTemplate
      isDynamicTemplate
      supportedLocalesByCountry {
        key
        value
      }
    }
  }
`;

export const GET_PAGE_INFO = gql`
  query GetPageInfo($id: String, $namespace: String) {
    queryTemplate(request: { id: $id }) {
      id
      name
      slug
      isDynamicTemplate
      draftTemplateVariables
      publishedTemplateVariables
    }
    listRoutePatterns(request: { theNamespace: $namespace }) {
      templateId
      pattern
    }
    getNamespace(request: { key: $namespace }) {
      domain
      namespaceSlug
    }
  }
`;

export const UPDATE_BLOCK = gql`
  mutation updateBlock($id: String!, $contentMap: ContentMapNode__Input!) {
    updateBlock(block: { id: $id, contentMap: $contentMap }) {
      id
      contentMap {
        data {
          hidden
          overrides {
            key
            value {
              data {
                hidden
                overrides {
                  key
                  value {
                    data {
                      hidden
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const UPDATE_TEMPLATE = gql`
  mutation updateTemplate(
    $templateId: String!
    $pageElements: [PageElement__Input!]!
    $supportedLocalesByCountry: [SupportedLocalesByCountryInputMapItems!]
  ) {
    updateTemplate(
      request: {
        templateId: $templateId
        pageElements: $pageElements
        supportedLocalesByCountry: $supportedLocalesByCountry
      }
    ) {
      id
    }
  }
`;

export const QUERY_TEMPLATE_STATUS = gql`
  query queryTemplateStatus($id: String) {
    queryTemplate(request: { id: $id }) {
      id
      slug
      defaultsPageIsLive
      supportedLocalesByCountry {
        key
        value
      }
    }
  }
`;

export const QUERY_PAGES = gql`
  query queryPages($url: String, $theNamespace: String, $countryCodes: [String], $locale: String) {
    queryPages(
      request: {
        url: $url
        theNamespace: $theNamespace
        countryCodes: $countryCodes
        locale: $locale
      }
    ) {
      pages {
        page {
          id
          isLive
          isLiveIsSet
        }
        countryCode
        isError
        errorMessage
      }
    }
  }
`;

export const QUERY_PAGE_STATUS = gql`
  query queryPageStatus(
    $url: String
    $theNamespace: String
    $countryCode: String
    $locale: String
  ) {
    queryPage(
      request: {
        url: $url
        theNamespace: $theNamespace
        countryCode: $countryCode
        locale: $locale
      }
    ) {
      page {
        id
        isLive
        isLiveIsSet
      }
    }
  }
`;

export const UPDATE_TEMPLATE_STATUS = gql`
  mutation updateTemplateStatus($templateId: String, $status: Boolean) {
    updateTemplate(request: { templateId: $templateId, defaultsPageIsLive: $status }) {
      id
      defaultsPageIsLive
    }
  }
`;

export const UPDATE_TEMPLATE_NAME = gql`
  mutation updateTemplateStatus($templateId: String, $name: String) {
    updateTemplate(request: { templateId: $templateId, name: $name }) {
      id
      name
    }
  }
`;

export const UPDATE_DRAFT_TEMPLATE_VARIABLES = gql`
  mutation updateTemplateStatus($templateId: String, $draftTemplateVariables: String) {
    updateTemplate(
      request: { templateId: $templateId, draftTemplateVariables: $draftTemplateVariables }
    ) {
      id
      draftTemplateVariables
    }
  }
`;

export const UPDATE_PAGES = gql`
  mutation updatePages($pages: [UpdatePagesRequest__Input!]!) {
    updatePages(request: $pages) {
      id
      isLive
      countryCode
    }
  }
`;

export const UPDATE_PAGE_STATUS = gql`
  mutation updatePageStatus($pageId: String, $status: Boolean) {
    updatePage(request: { pageId: $pageId, isLive: $status, isLiveIsSet: true }) {
      id
      isLive
      isLiveIsSet
    }
  }
`;

export const UPDATE_PAGES_STATUS = gql`
  mutation updatePagesStatus(
    $url: String
    $theNamespace: String
    $countryCode: String
    $supportedLocalesByCountry: [SupportedLocalesByCountry__Input!]!
    $status: Boolean
  ) {
    updateAllPageLocales(
      request: {
        url: $url
        theNamespace: $theNamespace
        countryCode: $countryCode
        supportedLocalesByCountry: $supportedLocalesByCountry
        pageUpdates: { isLive: $status, isLiveIsSet: true }
      }
    ) {
      id
      isLive
    }
  }
`;

export const CREATE_BLOCK_WITH_CONTENT = gql`
  mutation createBlockWithContent($blockWithContent: CreateBlockWithContentRequest__Input!) {
    createBlockWithContent(blockWithContent: $blockWithContent) {
      block {
        id
        key
        louvreNamespace
        isLive
        owner
        title
        description
        collaborators
        tags
      }
      blockContent {
        id
        draftContent
        stagedContent
        publishedContent
      }
    }
  }
`;

export const GET_BULK_PAGES_JOB = gql`
  query GetBulkPagesJob($id: String) {
    getBulkPagesJob(request: { id: $id }) {
      type
      status
      error {
        message
      }
    }
  }
`;

export const IMPORT_PAGES = gql`
  mutation ImportPages($templateId: String, $sources: [Source__Input!]!) {
    importPages(request: { templateId: $templateId, sources: $sources }) {
      jobId
    }
  }
`;

export const GET_BLOCK_BY_ID = gql`
  query getBlock($id: String) {
    getBlock(request: { query: { id: $id } }) {
      id
      contentMap {
        data {
          blockContentId
          hidden
          overrides {
            key
            value {
              data {
                blockContentId
                hidden
                overrides {
                  key
                  value {
                    data {
                      blockContentId
                      hidden
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const SEARCH_TERRITORIES = gql`
  query searchTerritories {
    searchTerritories {
      id
      name
    }
  }
`;

export const DUPLICATE_BLOCK_OVERRIDES = gql`
  mutation duplicateBlockOverrides(
    $blockKey: String!
    $destinationBlockKey: String!
    $namespace: String!
    $destinationNamespace: String!
    $supportedLocales: [SupportedLocalesByCountryMapItems__Input!]!
  ) {
    duplicateBlockOverrides(
      request: {
        blockKey: $blockKey
        destinationBlockKey: $destinationBlockKey
        namespace: $namespace
        destinationNamespace: $destinationNamespace
        supportedLocales: $supportedLocales
      }
    )
  }
`;
