import React from 'react';
import { styled, useStyletron } from 'baseui';
import { KIND, SIZE as buttonSize } from 'baseui/button';
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader } from 'baseui/modal';
import { useSnackbar } from 'baseui/snackbar';
import { SIZE, Spinner } from 'baseui/spinner';
import { HeadingMedium, ParagraphMedium } from 'baseui/typography';
import compare from 'just-compare';

import { BASEUI_MODAL_ZINDEX } from '../../../constants/app';
import {
  useBulkPageStatus,
  useBulkUpdatePageStatus,
} from '../../../hooks/page-edit/use-update-page-status';
import { useUnpublishedComponentContent } from '../../../hooks/use-unpublished-component-content';
import { PAGE_STATUS_MODAL_SUCCESS } from '../../common/notifications';
import { PageStatusToggle } from '../../common/page-status-toggle';

type RootPageStatusModalT = {
  countryOpts: Array<{ id: string; label: string }>;
  disabled: boolean;
  pageStatusParams: {
    url: string;
    supportedLocalesByCountry: { key: string; value: Array<string> };
    pageNamespace: string;
  };
  isOpen: boolean;
  setIsOpen: (a: boolean) => void;
  onConfirm: () => void;
};

type RootPageStatusUIDataT = {
  header: string;
  bodyText: string;
  selectAllCountriesLabel: string;
  cancelText: string;
  confirmText: string;
  negativeToggleText: string;
  positiveToggleText: string;
};

export const formatCountryDataResponse = (queryPagesData, countryOpts) => {
  let countryData = {};
  queryPagesData.forEach((page) => {
    const { id: pageId, countryCode, isLive, isLiveIsSet, isError, errorMessage } = page;
    const { label: countryLabel } = countryOpts?.find((opt) => opt.id === countryCode);
    countryData[countryCode] = {
      pageId,
      countryCode,
      countryLabel,
      errorMessage,
      isError,
      isLiveIsSet,
      isLive,
      nextIsLive: isLive,
    };
  });
  return countryData;
};

export const RootPageStatusModal = (props: RootPageStatusModalT) => {
  const [stagedCountryData, setStagedCountryData] = React.useState({});
  const [isConfirmed, setIsConfirmed] = React.useState(false);
  const { enqueue } = useSnackbar();
  const [css, theme] = useStyletron();
  const uiData: RootPageStatusUIDataT = useUnpublishedComponentContent(
    'chameleon_ui_page_edit',
    'rev1',
    'rootPageStatusModal'
  );

  const { countryOpts, disabled, pageStatusParams, isOpen, setIsOpen } = props;
  const { url, supportedLocalesByCountry, pageNamespace: namespace } = pageStatusParams;

  const countryCodes = countryOpts?.filter((opt) => opt.label !== 'Root').map((opt) => opt.id);

  const {
    queryPagesData,
    loading: bulkPageStatusLoading,
    queryTemplateStatusRefetch,
    queryPagesRefetch,
  } = useBulkPageStatus(countryCodes);

  const responseCountryData = React.useMemo(() => {
    return !bulkPageStatusLoading && queryPagesData
      ? formatCountryDataResponse(queryPagesData, countryOpts)
      : {};
  }, [bulkPageStatusLoading, countryOpts, queryPagesData]);

  React.useEffect(() => {
    if (queryPagesData && !Object.keys(stagedCountryData).length && !bulkPageStatusLoading) {
      setStagedCountryData(formatCountryDataResponse(queryPagesData, countryOpts));
    }
  }, [bulkPageStatusLoading, countryOpts, queryPagesData, stagedCountryData]);

  const [
    updatePageStatuses,
    {
      pageStatus: { bulkUpdatePageStatusLoading },
      localeStatus: { bulkUpdateLocaleLoading },
    },
  ] = useBulkUpdatePageStatus(
    url,
    supportedLocalesByCountry,
    namespace,
    () => queryTemplateStatusRefetch(),
    () => queryPagesRefetch(),
    function () {
      setIsConfirmed(true);
      enqueue({
        message: PAGE_STATUS_MODAL_SUCCESS,
      });
    }
  );

  const isDiverged = !compare(responseCountryData, stagedCountryData);
  const isLoading = bulkPageStatusLoading || bulkUpdatePageStatusLoading || bulkUpdateLocaleLoading;
  const isDisabled = isLoading || disabled;

  const countryDataKeys = Object.keys(responseCountryData);
  const allSelected = countryDataKeys
    ?.map((key) => stagedCountryData[key]?.nextIsLive)
    ?.every(Boolean);

  const handleSelectAll = () => {
    setIsConfirmed(false);
    let nextCountryData = {};
    countryDataKeys?.forEach((key) => {
      if (stagedCountryData[key].isError) return;
      nextCountryData[key] = {
        ...stagedCountryData[key],
        nextIsLive: !allSelected,
      };
    });
    setStagedCountryData({ ...stagedCountryData, ...nextCountryData });
  };

  const handleToggleCountryPageStatus = (countryCode: string) => {
    setIsConfirmed(false);
    setStagedCountryData({
      ...stagedCountryData,
      [countryCode]: {
        ...responseCountryData[countryCode],
        nextIsLive: !stagedCountryData[countryCode].nextIsLive,
      },
    });
  };

  const handleConfirm = () => {
    const bulkPageStatusUpdateInput = countryDataKeys.map((key) => ({
      countryCode: stagedCountryData[key].countryCode,
      pageId: stagedCountryData[key].pageId,
      isLive: stagedCountryData[key].nextIsLive,
    }));

    updatePageStatuses(bulkPageStatusUpdateInput);
  };

  const handleCancel = () => {
    setIsConfirmed(false);
    if (isDiverged) {
      setStagedCountryData(responseCountryData);
    }
    setIsOpen(false);
  };

  return (
    <Modal onClose={handleCancel} isOpen={isOpen} closeable animate overrides={modalOverrides}>
      <ModalHeader>
        <HeadingMedium margin={0}>{uiData?.header}</HeadingMedium>
      </ModalHeader>

      {/* @ts-expect-error TS2345: Argument of type '{ flex: string; marginTop: number; display: string; flexDirection: string; }' is not assignable to parameter of type 'StyleObject'. */}
      <ModalBody className={css(modalBodyStyles)}>
        {uiData?.bodyText && (
          <ParagraphMedium marginBottom={theme.sizing.scale700}>{uiData?.bodyText}</ParagraphMedium>
        )}

        {isLoading ? (
          <div
            className={css({
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
            })}
          >
            <Spinner $size={SIZE.large} />
          </div>
        ) : (
          <>
            <PageStatusToggle
              border
              checked={allSelected}
              disabled={isDisabled}
              handleChange={handleSelectAll}
              label={uiData?.selectAllCountriesLabel}
              negativeToggleText={uiData?.negativeToggleText}
              positiveToggleText={uiData?.positiveToggleText}
              textSize={'large'}
            />
            <Spacer />
            <GridContainer>
              {countryDataKeys.map((key, i) => {
                if (stagedCountryData[key]) {
                  const { nextIsLive, isError, countryCode, countryLabel } = stagedCountryData[key];
                  return (
                    <PageStatusToggle
                      key={i}
                      border
                      checked={nextIsLive}
                      disabled={isDisabled || isError}
                      handleChange={() => handleToggleCountryPageStatus(countryCode)}
                      label={countryLabel}
                      negativeToggleText={uiData?.negativeToggleText}
                      positiveToggleText={uiData?.positiveToggleText}
                      spaceBetween
                      textSize={'large'}
                    />
                  );
                }
              })}
            </GridContainer>
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <ModalButton onClick={handleCancel} size={buttonSize.large} kind={KIND.tertiary}>
          {uiData?.cancelText}
        </ModalButton>
        <ModalButton
          disabled={isLoading || !isDiverged || isConfirmed}
          onClick={handleConfirm}
          size={buttonSize.large}
        >
          {uiData?.confirmText}
        </ModalButton>
      </ModalFooter>
    </Modal>
  );
};

const Spacer = styled('div', ({ $theme }) => ({
  paddingBottom: $theme.sizing.scale900,
}));
const GridContainer = styled('div', ({ $theme }) => ({
  display: 'grid',
  gap: $theme.sizing.scale500,
  gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
  gridTemplateRows: 'auto',
}));

const modalOverrides = {
  Root: {
    style: {
      zIndex: BASEUI_MODAL_ZINDEX,
    },
  },
  Dialog: {
    style: {
      width: '80vw',
      maxWidth: '1600px',
      display: 'flex',
      flexDirection: 'column',
    },
  },
};
const modalBodyStyles = {
  flex: '1 1 0',
  marginTop: 0,
  display: 'flex',
  flexDirection: 'column',
};
