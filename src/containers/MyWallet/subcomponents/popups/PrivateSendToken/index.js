/**
 *
 * TomoWallet - My Wallet Page - Send Token Popup
 *
 */
// ===== IMPORTS =====
// Modules
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import _get from 'lodash.get';
import _isEqual from 'lodash.isequal';
// Custom Components
import FormContent from './form';
import ConfirmationContent from './confirmation';
import { SendTokenPopupStyler as PrivateSendPopupStyler } from './style';
// Utilities & Constants
import { withIntl } from '../../../../../components/IntlProvider';
import { MSG } from '../../../../../constants';
import { SEND_TOKEN_STAGES } from '../../../constants';
import { selectWallet, selectPrivacyAccount, selectLoadingPrivacyState } from '../../../../Global/selectors';
import { selectPrivateForm } from '../../../../MyWallet/selectors';


// ===================

// ===== MAIN COMPONENT =====
class PrivateSendTokenPopup extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isRequested: false,
    };

    this.handleClosePopup = this.handleClosePopup.bind(this);
    this.handleGetButtonConfig = this.handleGetButtonConfig.bind(this);
    this.handleGetContentConfig = this.handleGetContentConfig.bind(this);
    this.handleSendRequest = this.handleSendRequest.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (
      !_isEqual(
        _get(prevProps, 'popupData.stage'),
        _get(this.props, 'popupData.stage'),
      ) &&
      _isEqual(_get(this.props, 'popupData.stage'), SEND_TOKEN_STAGES.FORM)
    ) {
      this.handleSendRequest(false);
    }
  }

  handleClosePopup() {
    this.props.dispatch({
      type: 'TOGGLE_PRIVATE_SEND_TOKEN_POPUP',
      bool: false
    })
  }

  updateFields = (value) => {

    this.setState({
      form: value
    });
  }

  privateSend = () => {

  }

  handleGetButtonConfig() {
    const {
      intl: { formatMessage },
      popupData,
      submitSendToken,
      updatePrivateSendTokenPopupStage,
    } = this.props;
    const { isRequested } = this.state;

    const _self = this;

    return (
      (_get(popupData, 'stage') === SEND_TOKEN_STAGES.FORM && {
        primary: {
          action: () => {
            _self.privateSend()
          },
          btnYellow: true,
          label: formatMessage(MSG.COMMON_BUTTON_SEND),
        },
        secondary: {
          action: this.handleClosePopup,
          label: formatMessage(MSG.COMMON_BUTTON_BACK),
        },
      }) ||
      (_get(popupData, 'stage') === SEND_TOKEN_STAGES.CONFIRMATION && {
        primary: {
          action: () => {
            this.handleSendRequest(true);
            submitSendToken();
          },
          btnYellow: true,
          label: formatMessage(MSG.COMMON_BUTTON_CONFIRM),
          disabled: isRequested,
        },
        secondary: {
          action: () => updatePrivateSendTokenPopupStage(SEND_TOKEN_STAGES.FORM),
          label: formatMessage(MSG.COMMON_BUTTON_BACK),
        },
      }) ||
      {}
    );
  }

  handleGetContentConfig() {
    const {
      addFullAmount,
      formValues,
      intl: { formatMessage },
      popupData,
      tokenOptions,
      updateInput,
      wallet,
    } = this.props;
    return (
      (_get(popupData, 'stage') === SEND_TOKEN_STAGES.FORM && {
        Content: FormContent,
        getContentProps: {
          updateFields: this.updateFields,
          addFullAmount,
          errors: _get(popupData, 'errors', {}),
          formatMessage,
          formValues,
          tokenOptions: tokenOptions.data,
          updateInput,
        },
      }) ||
      (_get(popupData, 'stage') === SEND_TOKEN_STAGES.CONFIRMATION && {
        Content: ConfirmationContent,
        getContentProps: {
          errors: _get(popupData, 'errors', {}),
          formValues,
          wallet,
        },
      })
    );
  }

  handleSendRequest(bool) {
    this.setState({
      isRequested: bool,
    });
  }

  render() {
    const {
      popupData,
    } = this.props;
    
    return (
      <PrivateSendPopupStyler
        button={this.handleGetButtonConfig()}
        {...this.handleGetContentConfig()}
        isOpen={_get(popupData, 'isOpen', false)}
        title={'Private Send'}
        toggle={this.handleClosePopup}
      />
    );
  }
}
// ==========================

// ===== PROP TYPES =====
PrivateSendTokenPopup.propTypes = {
  /** Action to add full amount of token into form */
  addFullAmount: PropTypes.func,
  /** Action to hide popup */
  closePopup: PropTypes.func,
  /** Action to validate form before send */
  confirmBeforeSend: PropTypes.func,
  /** Send token form's values object */
  formValues: PropTypes.object,
  /** React Intl's instance object */
  intl: PropTypes.object,
  /** Popup's object data */
  popupData: PropTypes.object,
  /** Action to submit send token's form */
  submitSendToken: PropTypes.func,
  /** List of token's data */
  tokenOptions: PropTypes.arrayOf(PropTypes.object),
  /** Action to handle input change in send token form */
  updateInput: PropTypes.func,
  /** Action to update send token popup's stage of content */
  updatePrivateSendTokenPopupStage: PropTypes.func,
  /** Wallet's information */
  wallet: PropTypes.object,
};

PrivateSendTokenPopup.defaultProps = {
  addFullAmount: () => {},
  closePopup: () => {},
  confirmBeforeSend: () => {},
  formValues: {},
  intl: {},
  popupData: {},
  submitSendToken: () => {},
  tokenOptions: [],
  updateInput: () => {},
  updatePrivateSendTokenPopupStage: () => {},
  wallet: {},
};
// ======================

// ===== INJECTIONS =====
const mapStateToProps = () =>
  createStructuredSelector({
    wallet: selectWallet,
    form: selectPrivateForm,
    tokenOptions: selectPrivacyAccount,
    needReload: selectLoadingPrivacyState
  });
const withConnect = connect(mapStateToProps);
// ======================

export default compose(
  withIntl,
  withConnect,
)(PrivateSendTokenPopup);
