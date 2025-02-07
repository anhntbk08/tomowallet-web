/**
 *
 * TomoWallet - My Wallet Page - Actions
 *
 */
// ===== IMPORTS =====
// Constants
import {
  LOAD_COIN_DATA,
  LOAD_COIN_DATA_FAILED,
  LOAD_COIN_DATA_SUCCESS,
  LOAD_TOKEN_OPTIONS,
  LOAD_TOKEN_OPTIONS_SUCCESS,
  LOAD_TRANSACTION_DATA,
  LOAD_TRANSACTION_DATA_SUCCESS,
  RESET_SEND_TOKEN_FORM,
  RESET_STATE,
  SET_TABLE_TYPE,
  SUBMIT_SEND_TOKEN,
  TOGGLE_RECEIVE_TOKEN_POPUP,
  TOGGLE_SEND_TOKEN_POPUP,
  TOGGLE_SUCCESS_POPUP,
  UPDATE_SEND_TOKEN_ERRORS,
  UPDATE_SEND_TOKEN_INPUT,
  UPDATE_SEND_TOKEN_POPUP_STAGE,
} from './constants';
// ===================

// ===== ACTIONS =====
export const loadCoinData = () => ({
  type: LOAD_COIN_DATA,
});

export const loadCoinDataFailed = message => ({
  type: LOAD_COIN_DATA_FAILED,
  message,
});

export const loadCoinDataSuccess = data => ({
  type: LOAD_COIN_DATA_SUCCESS,
  data,
});

export const loadTokenOptions = (params, initialTokens) => ({
  type: LOAD_TOKEN_OPTIONS,
  params,
  initialTokens,
});

export const loadTokenOptionsSuccess = tokens => ({
  type: LOAD_TOKEN_OPTIONS_SUCCESS,
  tokens,
});

export const loadTransactionData = params => ({
  type: LOAD_TRANSACTION_DATA,
  params,
});

export const loadTransactionDataSuccess = tableData => ({
  type: LOAD_TRANSACTION_DATA_SUCCESS,
  tableData,
});

export const resetSendTokenForm = () => ({
  type: RESET_SEND_TOKEN_FORM,
});

export const resetState = () => ({
  type: RESET_STATE,
});

export const setTableType = tableType => ({
  type: SET_TABLE_TYPE,
  tableType,
});

export const submitSendToken = (amount, successMsg) => ({
  type: SUBMIT_SEND_TOKEN,
  amount,
  successMsg,
});

export const toggleReceiveTokenPopup = bool => ({
  type: TOGGLE_RECEIVE_TOKEN_POPUP,
  bool,
});

export const toggleSendTokenPopup = (bool, initialValues) => ({
  type: TOGGLE_SEND_TOKEN_POPUP,
  bool,
  initialValues,
});

export const toggleSuccessPopup = (bool, hash) => ({
  type: TOGGLE_SUCCESS_POPUP,
  bool,
  hash,
});

export const updateSendTokenErrors = errors => ({
  type: UPDATE_SEND_TOKEN_ERRORS,
  errors,
});

export const updateSendTokenInput = (name, value) => ({
  type: UPDATE_SEND_TOKEN_INPUT,
  name,
  value,
});

export const updateSendTokenPopupStage = stage => ({
  type: UPDATE_SEND_TOKEN_POPUP_STAGE,
  stage,
});
// ===================
