/**
 *
 * TomoWallet - Global Selectors
 *
 */
// ===== IMPORTS =====
// Utilities
import { createDeepEqualSelector } from '../../utils';
// ===================

// ===== SELECTORS =====
const selectGlobalDomain = state => state.global;

const selectClipboardPopup = createDeepEqualSelector(
  selectGlobalDomain,
  obj => obj.toJS().clipboardPopup,
);
const selectLanguage = createDeepEqualSelector(
  selectGlobalDomain,
  obj => obj.toJS().language,
);
const selectLoading = createDeepEqualSelector(
  selectGlobalDomain,
  obj => obj.toJS().loading,
);
const selectNetworkConfirmationPopup = createDeepEqualSelector(
  selectGlobalDomain,
  obj => obj.toJS().networkConfirmationPopup,
);
const selectNetworkData = createDeepEqualSelector(
  selectGlobalDomain,
  obj => obj.toJS().network,
);
const selectWallet = createDeepEqualSelector(
  selectGlobalDomain,
  obj => obj.toJS().wallet,
);
const selectWalletPopup = createDeepEqualSelector(
  selectGlobalDomain,
  obj => obj.toJS().walletPopup,
);
const selectMode = createDeepEqualSelector(
  selectGlobalDomain,
  obj => obj.toJS().mode,
);
// =====================

export {
  selectClipboardPopup,
  selectLanguage,
  selectLoading,
  selectNetworkConfirmationPopup,
  selectNetworkData,
  selectWallet,
  selectWalletPopup,
  selectMode
};
