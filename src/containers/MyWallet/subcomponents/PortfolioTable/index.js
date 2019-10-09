/**
 *
 * TomoWallet - My Wallet Page - Portfolio Table
 *
 * This component defines a table of tokens which current account owns,
 * including actions to send/receive with other accounts
 */
// ===== IMPORTS =====
// Modules
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect, dispatch } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import _get from 'lodash.get';
import _isEqual from 'lodash.isequal';
import _isEmpty from 'lodash.isempty';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import {
  TextYellowPointer,
} from '../../../../styles';

// Custom Components
import CommonTable from '../../../../components/Table';
import { BoxPortfolio } from './style';
// Utilities, Constants & Style
import { loadTokenOptions, toggleSuccessPopup } from '../../actions';
import {
  selectTokenOptions,
  selectSuccessPopup,
  selectTableType,
  selectCoinData,
} from '../../selectors';
import { withIntl } from '../../../../components/IntlProvider';
import portfolioConfig from './configuration';
import privacyPortfolioConfig from './privacy-portfolio-conf';
import { PORTFOLIO_COLUMNS } from '../../constants';
import { selectWallet } from '../../../Global/selectors';
import { LIST, ENUM } from '../../../../constants';
import tomoIcon from '../../../../assets/images/logo-tomo.png';
import { getNetwork } from '../../../../utils';
import { selectMode, selectLoadingPrivacyState, selectPrivacyAccount, selectPrivacyToken } from '../../../Global/selectors';
import { toggleLoading } from '../../../Global/actions';
// ===================


// Privacy - for demo purpose - dont use for production code
import BN from 'bn.js';
import toBN from 'number-to-bn';
import Web3 from 'web3';
import TestConfig from '../../config.json';
import HDWalletProvider from "truffle-hdwallet-provider";
import { UTXO, Stealth, Commitment, Crypto, Address } from 'tomoprivacyjs';
import * as _ from 'lodash';
const BigInteger = Crypto.BigInteger;

const ecurve = require('ecurve');
const ecparams = ecurve.getCurveByName('secp256k1');
const { Point } = ecurve;

var EC = require('elliptic').ec;
var ec = new EC('secp256k1');

const MySwal = withReactContent(Swal)
const TOMO = 1000000000000000000;

// ===== MAIN COMPONENT =====
class PortfolioTable extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleGetNativeCurrency = this.handleGetNativeCurrency.bind(this);
    this.handleLoadTokenOptions = this.handleLoadTokenOptions.bind(this);
  }

  componentDidMount() {
    const { wallet } = this.props;
    if (!_isEmpty(wallet)) {
      this.handleLoadTokenOptions();
    }
  }

  componentDidUpdate(prevProps) {
    if (
      !_isEqual(_get(prevProps, 'wallet'), _get(this.props, 'wallet')) ||
      (!_get(prevProps, 'successPopup.isOpen') &&
        _get(this.props, 'successPopup.isOpen')) ||
      (!_isEqual(_get(prevProps, 'tableType'), _get(this.props, 'tableType')) &&
        _isEqual(
          _get(this.props, 'tableType'),
          _get(LIST, ['MY_WALLET_TABLE_TYPES', 0, 'value']),
        ))
    ) {
      this.handleLoadTokenOptions();
    }
  }

  handleGetNativeCurrency() {
    const { coinData, wallet } = this.props;
    return [
      {
        [PORTFOLIO_COLUMNS.TOKEN_NAME]: 'TOMO',
        [PORTFOLIO_COLUMNS.SYMBOL]: 'TOMO',
        [PORTFOLIO_COLUMNS.ICON]: tomoIcon,
        [PORTFOLIO_COLUMNS.BALANCE]: _get(wallet, 'balance', 0),
        [PORTFOLIO_COLUMNS.DECIMALS]: 18,
        [PORTFOLIO_COLUMNS.PRICE]: _get(coinData, 'data.quotes.USD.price', 0),
        [PORTFOLIO_COLUMNS.TYPE]: ENUM.TOKEN_TYPE.CURRENCY,
        [PORTFOLIO_COLUMNS.TRANSACTION_FEE]: 0.03,
        [PORTFOLIO_COLUMNS.PUBLISHER]: 'TomoChain',
      },
    ];
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.walletMode !== nextProps.walletMode) {
      this.handleLoadTokenOptions(nextProps.walletMode);
    }
    return nextProps;
  }

  handleLoadTokenOptions(mode) {
    const { onLoadTokenOptions, wallet } = this.props;
    const walletMode = mode || this.props.walletMode;
    if (walletMode === 'normal') {
      return onLoadTokenOptions(
        {
          address: _get(wallet, 'address', ''),
        },
        this.handleGetNativeCurrency(),
      );
    } else {
      this.loadTomoPrivacyToken(wallet)
    }

    // if (this.state.data === undefined || needReload ){
    //   console.log("needReload ", needReload);
    //   this.loadTomoPrivacyToken(wallet)
    // }
  }

  loadTomoPrivacyToken = (privacyAddrs) => {
    let provider = new HDWalletProvider(privacyAddrs.privSpendKey, TestConfig.RPC_END_POINT);
    const web3 = new Web3(provider);
    var privacyContract = new web3.eth.Contract(TestConfig.PRIVACY_ABI, TestConfig.PRIVACY_SMART_CONTRACT_ADDRESS, {
      from: privacyAddrs.address, // default from address
      gasPrice: '250000000', 
      gas: '1000000'
    });

    // this.props.onToggleLoading(true);
    this.scanAllUTXO(privacyContract, privacyAddrs).then((result) => {
      this.props.updatePrivacyBalance({
        utxos: result.utxos,
        data: [{
          "tokenName": "TOMO-DARK",
          "symbol": "TOMO-DARK",
          "icon": "/0ed90bcc1a46c7aa7e05f3042141068b.png",
          "balance": result.balance,
          "decimals": 18,
          "price": 0.3079502542,
          "type": "CURRENCY",
          "txFee": 0.03,
          "publisher": "TomoChain"
        }]
      });
      this.props.dispatch({
        type: "FINISH_RELOAD_PRIVACY_BLANCE"
      });
    }).catch(() => {
      this.props.dispatch({
        type: "FINISH_RELOAD_PRIVACY_BLANCE"
      });
    });
    // this.props.onToggleLoading(false);

  }
  // todo - move to util
  getUTXO(index, privacyContract, address) {
    return new Promise((resolve, reject) => {
      privacyContract.methods.getUTXO(index)
        .call({
          from: address
        })
        .then(function (utxo) {
          return resolve({
            ...utxo,
            _index: index
          });
        }).catch(exception => {
          reject(exception);
        })
    });
  }

  scanAllUTXO = async (privacyContract, privacyAddrs) => {
    let index = 0;
    var utxo = {};
    var balance = new BN('0', 2);
    var utxos = [];
    do {
      try {
        utxo = await this.getUTXO(index, privacyContract, privacyAddrs.address);
        let utxoInstance1 = new UTXO({
          ...utxo,
          "3": index
        });
        let isMine1 = utxoInstance1.checkOwnership(privacyAddrs.privSpendKey);
        console.log(isMine1);

        if (utxo["3"] === false) {
          utxo["3"] = index; // tricky 
          let utxoInstance = new UTXO(utxo);
          let isMine = utxoInstance.checkOwnership(privacyAddrs.privSpendKey);
          // console.log(isMine);
          if (isMine && parseFloat(isMine.amount).toString() == isMine.amount) {
            balance = balance.add(toBN(isMine.amount));
            utxos.push({
              ...utxo,
              balance: isMine.amount
            });
          }
        }
        index++;
      } catch (exception) {
        console.log(exception);
        utxo = null;
        break;
      }
    } while (utxo);

    return {
      utxos,
      balance: balance.toString(10)
    };
  }

  openPrivateSendPopup = (token) => {
    this.props.onPrivateSend(token);
  }
  registerPrivacyAddress = (privateKey) => {
    const { wallet } = this.props;
    let provider = new HDWalletProvider(wallet.privSpendKey, TestConfig.RPC_END_POINT);
    const web3 = new Web3(provider);

    var privacyAddressContract = new web3.eth.Contract(TestConfig.PRIVACYADD_MAPPING_ABI, TestConfig.PRIVACYADD_MAPPING_SMART_CONTRACT, {
      from: wallet.address, // default from address
      gasPrice: '250000000', 
      gas: '2000000'
    });

    return new Promise((resolve, reject) => {
      let privacyAddress = wallet.pubAddr;
      privacyAddressContract.methods.register(
        common.hextobin(web3.utils.toHex(privacyAddress))
      )
        .send({
          from: wallet.address,
        })
        .on('error', function (error) {
          reject(error);
        })
        .then(function (receipt) {
          console.log("receipt after register ", receipt);
          try {
            resolve(receipt);
          } catch (error) {
            reject(error);
          }
        });
    });
  }

  onWithdraw = async () => {
    const { wallet } = this.props;
    let provider = new HDWalletProvider(wallet.privSpendKey, TestConfig.RPC_END_POINT);
    const web3 = new Web3(provider);
    var privacyContract = new web3.eth.Contract(TestConfig.PRIVACY_ABI, TestConfig.PRIVACY_SMART_CONTRACT_ADDRESS, {
      from: wallet.address, // default from address
    });
    let sender = new Stealth(wallet);

    let utxo = _.find(this.props.privacyAcc.utxos, (utxo) => {
      return utxo.balance === '15000000000000000000';
    });

    console.log(utxo);

    let UTXOIns = new UTXO(utxo);
    let utxoIndex = utxo._index
    let signature = UTXOIns.sign(wallet.privSpendKey, wallet.address);
    let amount = '15000000000000000000';

    // let proof = sender.genTransactionProof(amount, sender.pubSpendKey, sender.pubViewKey, '0');

    console.log(toBN(utxo.balance).sub(toBN('15000000000000000000')).toString(10));

    // let remainCommitment = Commitment.genCommitmentFromTxPub(
    //   0
    //   , {
    //     X: UTXOIns.txPubX,
    //     YBit: UTXOIns.txPubYBit
    // }, sender.privViewKey, false);
  // encrypted left amount 
    const PEDERSON_COMMITMENT_H = [
      '50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0',
      '31d3c6863973926e049e637cb1b5f40a36dac28af1766968c30c2313f3a38904',
   ];
    const basePointH = new Point.fromAffine(ecparams,
      new BigInteger(PEDERSON_COMMITMENT_H[0], 16),
      new BigInteger(PEDERSON_COMMITMENT_H[1], 16));

    let inputCommitments = Commitment.sumCommitmentsFromUTXOs([UTXOIns], wallet.privSpendKey);

    const remainCommitment = inputCommitments.add(
      basePointH.multiply(
            BigInteger.fromHex(
                common.numberToHex(amount)
            )).negate()
    );

    await this.registerPrivacyAddress(wallet.privSpendKey);

    
    console.log(basePointH.multiply(
        BigInteger.fromHex(
            common.numberToHex(amount),
        ),
    ).getEncoded(false).toString('hex'));
    
    console.log(basePointH.multiply(
      BigInteger.fromHex(
          common.numberToHex(amount)
      )).add(remainCommitment).getEncoded(false).toString('hex'));

   console.log("inputCommitments ", inputCommitments.getEncoded(false).toString('hex'));
    
   console.log(
    utxoIndex,
    amount, '0x00',
    [[...signature.r.toArray()], [...signature.s.toArray()]],
    wallet.address,
    [
      '0x' + remainCommitment.getEncoded(false).toString('hex').substr(2, 64), // the X part of curve 
      '0x' + remainCommitment.getEncoded(false).toString('hex').substr(-64), // the Y part of curve
    ]
   );
   
    privacyContract.methods.withdrawFunds(
      utxoIndex,
      amount, '0x00',
      [[...signature.r.toArray()], [...signature.s.toArray()]],
      wallet.address,
      [
        '0x' + remainCommitment.getEncoded(false).toString('hex').substr(2, 64), // the X part of curve 
        '0x' + remainCommitment.getEncoded(false).toString('hex').substr(-64), // the Y part of curve
      ]
    )
      .send({
        from: wallet.address,
        gasPrice: '300000000', 
        gas: '10000000'
      })
      .then((receipt) => {
        this.props.updatePrivacyBalance({
          utxos: _.remove(this.props.privacyAcc.utxos, (txo) => {
            return txo._index === utxo._index;
          }),
          data: [{
            "tokenName": "TOMO-DARK",
            "symbol": "TOMO-DARK",
            "icon": "/0ed90bcc1a46c7aa7e05f3042141068b.png",
            "balance": toBN(this.props.privacyAcc.data[0].balance).sub(toBN('15000000000000000000')).toString(10),
            "decimals": 18,
            "price": 0.3079502542,
            "type": "CURRENCY",
            "txFee": 0.03,
            "publisher": "TomoChain"
          }]
        });
        MySwal.fire({
          title: 'Withdraw sucessfully',
          type: 'success',
        })
      })
      .catch(function (error) {
        MySwal.fire({
          title: 'Withdraw failed',
          text: error.toString(),
          type: 'error',
        })
      });
  }

  privateSend = () => {
    let receiverAddress = Address.generateKeys(TestConfig.WALLETS["1"].privateKey);
    let receiver = new Stealth(receiverAddress);

    let utxos = [_.find(this.props.privacyAcc.utxos, (utxo) => {
      return utxo.balance === '15000000000000000000';
    })];

    // if (utxos.length > 2) {
    //   utxos = utxos.slice(0, 1);
    // }

    console.log('utxos ', utxos);

    const { wallet } = this.props;
    let provider = new HDWalletProvider(wallet.privSpendKey, TestConfig.RPC_END_POINT);
    const web3 = new Web3(provider);
    var privacyContract = new web3.eth.Contract(TestConfig.PRIVACY_ABI, TestConfig.PRIVACY_SMART_CONTRACT_ADDRESS, {
      from: wallet.address, // default from address
    });
    let sender = new Stealth(wallet);

    let UTXOs = [];
    const spendingUtxosIndex = utxos.map(utxo => {
      var UTXOIns = new UTXO(utxo); 
      UTXOs.push(UTXOIns);
      return UTXOIns.index;
    });

    let randomMask = ec.genKeyPair().getPrivate('hex');
    const proofOfReceiver = sender.genTransactionProof('15000000000000000000', receiver.pubSpendKey, receiver.pubViewKey, randomMask);

    const myRemainMask = ec.genKeyPair().getPrivate('hex'); // dont check by now

    let proofOfMe = sender.genTransactionProof(
      0, sender.pubSpendKey, sender.pubViewKey, myRemainMask);

    // sum up commitment to make sure input utxo commitments = output utxos commitment
    let inputCommitments = Commitment.sumCommitmentsFromUTXOs(UTXOs, wallet.privSpendKey);

    const pfm = inputCommitments.add(
        Point.decodeFrom(ecparams, proofOfReceiver.commitment).negate()
    ).getEncoded(false);

    privacyContract.methods.privateSend(
        spendingUtxosIndex,
        [
            '0x' + pfm.toString('hex').substr(2, 64), // the X part of curve 
            '0x' + pfm.toString('hex').substr(-64), // the Y part of curve
            '0x' + proofOfReceiver.commitment.toString('hex').substr(2, 64), // the X part of curve 
            '0x' + proofOfReceiver.commitment.toString('hex').substr(-64), // the Y part of curve
            '0x' + proofOfMe.onetimeAddress.toString('hex').substr(2, 64), // the X part of curve 
            '0x' + proofOfMe.onetimeAddress.toString('hex').substr(-64), // the Y part of curve
            '0x' + proofOfReceiver.onetimeAddress.toString('hex').substr(2, 64), // the X part of curve 
            '0x' + proofOfReceiver.onetimeAddress.toString('hex').substr(-64), // the Y part of curve
            '0x' + proofOfMe.txPublicKey.toString('hex').substr(2, 64), // the X part of curve 
            '0x' + proofOfMe.txPublicKey.toString('hex').substr(-64), // the Y part of curve
            '0x' + proofOfReceiver.txPublicKey.toString('hex').substr(2, 64), // the X part of curve 
            '0x' + proofOfReceiver.txPublicKey.toString('hex').substr(-64), // the Y part of curve
        ],
        [
            '0x' + proofOfMe.encryptedAmount, // encrypt of amount using ECDH],
            '0x' + proofOfReceiver.encryptedAmount, // encrypt of amount using ECDH],
            '0x' + proofOfMe.encryptedMask, // encrypt of amount using ECDH],
            '0x' + proofOfReceiver.encryptedMask,// encrypt of amount using ECDH],
        ]
    )
    .send({
      from: wallet.address, // in real case, generate an dynamic account to put here
      gasPrice: '300000000', 
      gas: '10000000'
    })
    .then(function (receipt) {
      console.log("receipt ", receipt);
      MySwal.fire({
        title: 'Private Send sucessfully to ' + receiverAddress.pubAddr,
        type: 'success',
      })
    })
    .catch(function (error) {
        MySwal.fire({
          title: 'Private Send failed',
          text: error.toString(),
          type: 'error',
        })
    });
  }

  render() {
    const {
      data,
      intl: { formatMessage },
      openSendTokenPopup,
      walletMode
    } = this.props;

    return (
      <BoxPortfolio>
        {walletMode === 'normal' ?
          <CommonTable
            data={data}
            setConfig={portfolioConfig}
            getConfigProps={{
              formatMessage,
              openSendTokenPopup: walletMode === 'normal' ? openSendTokenPopup : this.openPrivateSendPopup,
            }}
            getTableProps={{
              minRows: 3,
              showPagination: false,
              defaultPageSize: undefined,
              TheadComponent: props =>
                props.className !== '-header' && props.children,
            }}
          /> :
          <CommonTable
            data={this.props.privacyToken}
            setConfig={privacyPortfolioConfig}
            getConfigProps={{
              formatMessage,
              onWithdraw: this.onWithdraw,
              openSendTokenPopup: this.privateSend
            }}
            getTableProps={{
              minRows: 3,
              showPagination: false,
              defaultPageSize: undefined,
              TheadComponent: props =>
                props.className !== '-header' && props.children,
            }}
          />
        }
      </BoxPortfolio>
    );
  }
}
// ==========================

// ===== PROP TYPES =====
PortfolioTable.propTypes = {
  /** TomoChain coin data */
  coinData: PropTypes.object,
  /** Table data */
  data: PropTypes.arrayOf(PropTypes.object),
  /** React Intl's instance object */
  intl: PropTypes.object,
  /** Condition flag to trigger data reload */
  isActive: PropTypes.bool,
  /** Success popup's data */
  successPopup: PropTypes.object,
  /** Current table tab's type */
  tableType: PropTypes.string,
  /** Action to request for token list by address */
  onLoadTokenOptions: PropTypes.func,
  /** Action to show send token popup */
  openSendTokenPopup: PropTypes.func,
};

PortfolioTable.defaultProps = {
  coinData: {},
  data: [],
  intl: {},
  isActive: false,
  successPopup: {},
  tableType: '1',
  onLoadTokenOptions: () => { },
  openSendTokenPopup: () => { },
};
// ======================

// ===== INJECTIONS =====
const mapStateToProps = () =>
  createStructuredSelector({
    coinData: selectCoinData,
    data: selectTokenOptions,
    successPopup: selectSuccessPopup,
    tableType: selectTableType,
    wallet: selectWallet,
    walletMode: selectMode,
    needReload: selectLoadingPrivacyState,
    privacyAcc: selectPrivacyAccount,
    privacyToken: selectPrivacyToken
  });
const mapDispatchToProps = dispatch => ({
  dispatch,
  updatePrivacyBalance: (data) => dispatch({
    type: "UPDATE_PRIVACY_BALANCE",
    data
  }),
  onPrivateSend: (token) => dispatch({
    type: "TOGGLE_PRIVATE_SEND_TOKEN_POPUP",
    bool: true,
    token
  }),
  onLoadTokenOptions: (params, initialTokens) =>
    dispatch(loadTokenOptions(params, initialTokens)),
  onToggleLoading: () => dispatch(toggleLoading())
});
const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);
// ======================

export default compose(
  withConnect,
  withIntl,
)(PortfolioTable);
