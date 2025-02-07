/**
 *
 * TomoWallet - Welcome Page - Reducer
 *
 */
// ===== IMPORTS =====
// Modules
import { fromJS } from 'immutable';
// Utilities & Constants
import {
  RESET_STATE,
  TOGGLE_PASSWORD_FORM,
  UPDATE_PASSWORD_ERRORS,
  UPDATE_PASSWORD_INPUT,
} from './constants';
// ===================

// ===== PRE-DEFINED VARIABLES =====
const initialState = fromJS({
  passwordForm: {
    errors: {},
    input: {},
    isOpen: null,
  },
});
// =================================

export default (state = initialState, action) => {
  switch (action.type) {
    case RESET_STATE:
      return initialState;
    case TOGGLE_PASSWORD_FORM:
      return state.setIn(['passwordForm', 'isOpen'], action.bool);
    case UPDATE_PASSWORD_ERRORS:
      return state
        .setIn(['passwordForm', 'errors'], action.errors)
        .setIn(['passwordForm', 'input'], {});
    case UPDATE_PASSWORD_INPUT:
      return state
        .updateIn(['passwordForm', 'input'], values => ({
          ...values,
          [action.name]: action.value,
        }))
        .setIn(['passwordForm', 'errors'], {});
    default:
      return state;
  }
};
