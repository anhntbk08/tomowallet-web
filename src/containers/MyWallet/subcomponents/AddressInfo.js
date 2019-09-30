/**
 *
 * TomoWallet - My Wallet Page - Address Information
 *
 * This component shows basic information of current account address,
 * including options to send/receive tokens.
 */
// ===== IMPORTS =====
// Modules
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import _get from 'lodash.get';
import { Row, Col } from 'reactstrap';
import QRCode from 'qrcode.react';
import { selectMode } from '../../Global/selectors';
import { createStructuredSelector } from 'reselect';
// Custom Components
import ExchangeInfo from './ExchangeInfo';
import { MediumButtonStyler, HeadingSmall } from '../../../styles';
// Utilities & Constants
import { withWeb3 } from '../../../components/Web3';
import { withIntl } from '../../../components/IntlProvider';
import { MSG } from '../../../constants';
import { TextBlue } from '../../../styles';
import { toggleClipboardCopyState } from '../../Global/actions';
import { copyToClipboard } from '../../../utils';
import Web3 from 'web3';
import TestConfig from '../config.json';
import HDWalletProvider from "truffle-hdwallet-provider";
import { UTXO, Stealth } from 'tomoprivacyjs';
// ===================

const TOMO = 1000000000000000000;

// ===== MAIN COMPONENT =====
class AddressInfo extends PureComponent {
  constructor(props) {
    super(props);

    this.handleCopyToClipboard = this.handleCopyToClipboard.bind(this);
  }

  handleCopyToClipboard() {
    const { onToggleClipboardPopup, wallet } = this.props;
    copyToClipboard(_get(wallet, 'address', ''));
    onToggleClipboardPopup(true);
  }

  handleDeposit = () => {
    const { wallet } = this.props;
    let provider = new HDWalletProvider(wallet.privSpendKey, TestConfig.RPC_END_POINT);
    const web3 = new Web3(provider);

    try {
      var privacyContract = new web3.eth.Contract(TestConfig.PRIVACY_ABI, TestConfig.PRIVACY_SMART_CONTRACT_ADDRESS, {
        from: wallet.address, // default from address
        gasPrice: '250000000', // default gas price in wei, 20 gwei in this case,
        gas: '10000000'
      });
      let sender = new Stealth(this.props.wallet);
  
      // create proof for a transaction 
      let proof = sender.genTransactionProof(15*TOMO, sender.pubSpendKey, sender.pubViewKey);

      privacyContract.methods.deposit(
        '0x' + proof.onetimeAddress.toString('hex').substr(2, 64), // the X part of curve 
        '0x' + proof.onetimeAddress.toString('hex').substr(-64), // the Y part of curve
        '0x' + proof.txPublicKey.toString('hex').substr(2, 64), // the X part of curve
        '0x' + proof.txPublicKey.toString('hex').substr(-64), // the Y par of curve,
        '0x' + proof.mask,
        '0x' + proof.encryptedAmount,// encrypt of amount using ECDH,
        '0x' + proof.encryptedMask
      )
        .send({
          from: wallet.address, // should random
          // from: '0x28aedCeA19563B061b32a640C49725a69C5690d3', // should be random each time
          value: 15 * TOMO
        })
        .on('error', function (error) {
          alert(error);
        })
        .then((receipt) => {
          console.log('receipt.events.NewUTXO ', receipt.events.NewUTXO);
          this.props.dispatch({
            type: "RELOAD_PRIVACY_BLANCE"
          });
        });
    } catch (ex) {
      console.log(ex);
    }
  }

  render() {
    const {
      intl: { formatMessage },
      openReceiveTokenPopup,
      openSendTokenPopup,
      wallet,
    } = this.props;

    return (
      <div>
        <div className='box-address'>
          <Row>
            <Col
              xs={12}
              lg={{ size: 5, order: 12 }}
              className='mb-sm-3 mb-lg-0'
            >
              <div className='bg_gray'>
                <ExchangeInfo />
              </div>
            </Col>
            <Col xs={12} lg={{ size: 7, order: 1 }}>
              <div className='d-flex align-items-center bg_gray'>
                <Row className='fullwidth align-items-center'>
                  {this.props.walletMode === 'normal' ? <Col md={8}>
                    <HeadingSmall>
                      {formatMessage(MSG.MY_WALLET_SECTION_ADDRESS_TITLE)}
                    </HeadingSmall>
                    <TextBlue
                      role='presentation'
                      onClick={this.handleCopyToClipboard}
                      className='text-break'
                    >
                      {_get(wallet, 'address', '')}
                    </TextBlue>
                    <Row className='mt-4'>
                      <Col md={6} className='pr-2'>
                        <MediumButtonStyler onClick={openSendTokenPopup}>
                          {formatMessage(MSG.COMMON_BUTTON_SEND)}
                        </MediumButtonStyler>
                      </Col>
                      <Col md={6} className='pl-2'>
                        <MediumButtonStyler
                          btnBlue
                          onClick={openReceiveTokenPopup}
                        >
                          {formatMessage(MSG.COMMON_BUTTON_RECEIVE)}
                        </MediumButtonStyler>
                      </Col>
                    </Row>
                  </Col> :
                    <Col md={8}>
                      <br />
                      <HeadingSmall>
                        {'PRIVACY ADDRESS'}
                      </HeadingSmall>
                      <TextBlue
                        role='presentation'
                        onClick={this.handleCopyToClipboard}
                        className='text-break'
                      >
                        {_get(wallet, 'pubAddr', '')}
                      </TextBlue>
                      <Row className='mt-4'>
                        <Col md={12} className='pr-2'>
                          <MediumButtonStyler onClick={this.handleDeposit}>
                            Deposit 15 TOMO
                        </MediumButtonStyler>
                        </Col>
                      </Row>
                    </Col>
                  }
                  <Col md={4} className='d-flex justify-content-end'>
                    <div className='qrc_bd'>
                      {this.props.walletMode === 'normal' ?
                        <QRCode value={_get(wallet, 'address', '')} /> :
                        <QRCode value={_get(wallet, 'pubAddr', '')} />
                      }
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}
// ==========================

// ===== PROP TYPES =====
AddressInfo.propTypes = {
  /** React Intl's instance object */
  intl: PropTypes.object,
  /** Action to show/hide clipboard popup */
  onToggleClipboardPopup: PropTypes.func,
  /** Action to show receive token popup */
  openReceiveTokenPopup: PropTypes.func,
  /** Action to show send token popup */
  openSendTokenPopup: PropTypes.func,
  /** Wallet's data */
  wallet: PropTypes.object,
};

AddressInfo.defaultProps = {
  intl: {},
  onToggleClipboardPopup: () => { },
  openReceiveTokenPopup: () => { },
  openSendTokenPopup: () => { },
  wallet: {},
};
// ======================

// ===== INJECTIONS =====
const mapStateToProps = () =>
  createStructuredSelector({
    walletMode: selectMode
  });
const mapDispatchToProps = dispatch => ({
  dispatch: dispatch,
  onToggleClipboardPopup: bool => dispatch(toggleClipboardCopyState(bool)),
});
const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);
// ======================

export default compose(
  withIntl,
  withWeb3,
  withConnect,
)(AddressInfo);
