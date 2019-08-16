/**
 *
 * TomoWallet - My Wallet Page - Success Popup
 *
 */
// ===== IMPORTS =====
// Modules
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { get as _get } from 'lodash';
// Custom Component
import SuccessContent from './content';
// Styles
// -- TO-DO: Add style for Success Popup
import { SuccessPopupStyler } from './style';
// ===================

// ===== MAIN COMPONENT =====
class SuccessPopup extends PureComponent {
  render() {
    const { amount, closePopup, successPopup, symbol } = this.props;
    return (
      <SuccessPopupStyler
        backdrop
        isOpen={_get(successPopup, 'isOpen', false)}
        toggle={closePopup}
        Content={SuccessContent}
        getContentProps={{
          amount,
          symbol,
          txHash: _get(successPopup, 'txHash', ''),
        }}
        button={{}}
      />
    );
  }
}
// ==========================

// ===== PROP TYPES =====
SuccessPopup.propTypes = {
  /** Amount of sent token */
  amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Action to close popup */
  closePopup: PropTypes.func,
  /** Success popup's data */
  successPopup: PropTypes.object,
  /** Token symbol */
  symbol: PropTypes.string,
};

SuccessPopup.defaultProps = {
  amount: 0,
  closePopup: () => {},
  successPopup: {},
  symbol: '',
};
// ======================

export default SuccessPopup;