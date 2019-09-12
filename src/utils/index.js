import injectReducer from './injectReducer';
import injectSaga from './injectSaga';
import history from './history';
import createDeepEqualSelector from './deepSelector';
import {
  changeInputWithSubmit,
  convertLocaleNumber,
  copyToClipboard,
  detectSubmit,
  downloadFile,
  removeTrailingZero,
  shuffleArray,
  trimMnemonic,
} from './miscellaneous';
import {
  bnToDecimals,
  convertAmountWithDecimals,
  decimalsToBN,
  decryptKeystore,
  encryptKeystore,
  estimateCurrencyFee,
  estimateTRC20Fee,
  estimateTRC21Fee,
  fromWei,
  generateWeb3,
  getBalance,
  getLedgerTokenTransferData,
  getWalletInfo,
  mnemonicToPrivateKey,
  repeatGetTransaction,
  sendMoney,
  sendToken,
} from './blockchain';
import getValidations, { mergeErrors } from './validations';
import { withLoading } from './injectLoading';
import {
  getLedger,
  getLocale,
  getNetwork,
  getWeb3Info,
  removeLedger,
  removeLocale,
  removeNetwork,
  removeWeb3Info,
  setLedger,
  setNetwork,
  setLocale,
  setWeb3Info,
} from './storage';

export {
  bnToDecimals,
  changeInputWithSubmit,
  convertLocaleNumber,
  convertAmountWithDecimals,
  copyToClipboard,
  createDeepEqualSelector,
  decimalsToBN,
  decryptKeystore,
  detectSubmit,
  downloadFile,
  encryptKeystore,
  estimateCurrencyFee,
  estimateTRC20Fee,
  estimateTRC21Fee,
  fromWei,
  generateWeb3,
  getBalance,
  getLedger,
  getLedgerTokenTransferData,
  getLocale,
  getNetwork,
  getValidations,
  getWalletInfo,
  getWeb3Info,
  history,
  injectReducer,
  injectSaga,
  mergeErrors,
  mnemonicToPrivateKey,
  removeLedger,
  removeLocale,
  removeNetwork,
  removeTrailingZero,
  removeWeb3Info,
  repeatGetTransaction,
  sendMoney,
  sendToken,
  setLedger,
  setLocale,
  setNetwork,
  setWeb3Info,
  shuffleArray,
  trimMnemonic,
  withLoading,
};
