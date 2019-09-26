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
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import _get from 'lodash.get';
import _isEqual from 'lodash.isequal';
import _isEmpty from 'lodash.isempty';

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
import { PORTFOLIO_COLUMNS } from '../../constants';
import { selectWallet } from '../../../Global/selectors';
import { LIST, ENUM } from '../../../../constants';
import tomoIcon from '../../../../assets/images/logo-tomo.png';
import { getNetwork } from '../../../../utils';
import { selectMode } from '../../../Global/selectors';
import { toggleLoading } from '../../../Global/actions';
// ===================


// Privacy - for demo purpose - dont use for production code
import BN from 'bn.js';
import toBN from 'number-to-bn';
import Web3 from 'web3';
import TestConfig from './config.json';
import HDWalletProvider from "truffle-hdwallet-provider";
import {address as Address, crypto as Crypto, utxo as UTXO} from 'tomoprivacyjs';


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
    console.log("nextProps ", nextProps.walletMode);
    if (this.props.walletMode !== nextProps.walletMode) {
      this.handleLoadTokenOptions(nextProps.walletMode);
    }
    return true;
  }

  handleLoadTokenOptions(mode) {
    const { onLoadTokenOptions, wallet } = this.props;
    const walletMode = mode || this.props.walletMode;
    if (walletMode === 'normal') {
      onLoadTokenOptions(
        {
          address: _get(wallet, 'address', ''),
        },
        this.handleGetNativeCurrency(),
      );
    } else {
      this.loadTomoPrivacyToken(wallet)
    }
  }

  loadTomoPrivacyToken = (privacyAddrs) => {
    let provider = new HDWalletProvider(privacyAddrs.privSpendKey, TestConfig.RPC_END_POINT);
    const web3 = new Web3(provider);
    var privacyContract = new web3.eth.Contract(TestConfig.PRIVACY_ABI, TestConfig.PRIVACY_SMART_CONTRACT_ADDRESS, {
        from: privacyAddrs.address, // default from address
        gasPrice: '250000000', // default gas price in wei, 20 gwei in this case,
        gas: '1000000'
    });
    // this.props.onToggleLoading(true);
    this.scanAllUTXO(privacyContract, privacyAddrs).then((result) => {
      this.setState({
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
      })
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
          return resolve(utxo);
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
        let utxoInstance = new UTXO(utxo);
        let isMine = utxoInstance.isMineUTXO(privacyAddrs.privSpendKey);

        if (isMine) {
          utxos.push(utxo);
        }
        if (isMine && parseFloat(isMine.amount).toString() == isMine.amount) {
          balance = balance.add(toBN(isMine.amount));
        }
        index++;
      } catch (exception) {
        utxo = null;
        break;
      }
    } while (utxo);

    return {
      utxos,
      balance: balance.toString(10)
    };
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
        <CommonTable
          data={walletMode === 'normal' ? data : this.state.data}
          setConfig={portfolioConfig}
          getConfigProps={{
            formatMessage,
            openSendTokenPopup,
          }}
          getTableProps={{
            minRows: 3,
            showPagination: false,
            defaultPageSize: undefined,
            TheadComponent: props =>
              props.className !== '-header' && props.children,
          }}
        />
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
  onLoadTokenOptions: () => {},
  openSendTokenPopup: () => {},
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
    walletMode: selectMode
  });
const mapDispatchToProps = dispatch => ({
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
