// Modules
import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { createStructuredSelector } from 'reselect';
import _get from 'lodash.get';
import ToggleButton from 'react-toggle-button';
import _isEmpty from 'lodash.isempty';
import _isEqual from 'lodash.isequal';
import {
  NavbarBrand,
  Collapse,
  Nav,
  UncontrolledDropdown,
  CardImg,
} from 'reactstrap';
// Custom Components
import WalletPopup from './subcomponents/WalletPopup';
import NetworkConfirmationPopup from './subcomponents/NetworkConfirmationPopup';
import {
  NavBarStyler,
  DropdownToggleHeader,
  DropdownMenuStyler,
  DropdownItemStyler,
} from './style';
// Utilities & Constants
import { withWeb3 } from '../Web3';
import { withIntl } from '../IntlProvider';
import {
  releaseWallet,
  toggleWalletPopup,
  setNetwork,
  toggleNetworkConfirmationPopup,
  togglePrivacyMode
} from '../../containers/Global/actions';
import { ROUTE, LIST, MSG } from '../../constants';
import {
  removeWeb3Info,
  setLocale,
  getLocale,
  getNetwork,
  removeLedger,
  getWeb3Info,
} from '../../utils';
import {
  selectNetworkData,
  selectNetworkConfirmationPopup,
  selectMode
} from '../../containers/Global/selectors';
import logo_tomochain from '../../assets/images/logo-tomochain.png';

// ===== MAIN COMPONENT =====
class NavigationBar extends PureComponent {
  constructor(props) {
    super(props);

    this.handleChangeLocale = this.handleChangeLocale.bind(this);
    this.handleChangeNetwork = this.handleChangeNetwork.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.handleRedirectToHomepage = this.handleRedirectToHomepage.bind(this);
    this.handleRenderPrivateBar = this.handleRenderPrivateBar.bind(this);
    this.handleRenderPublicBar = this.handleRenderPublicBar.bind(this);
    this.isActiveNetwork = this.isActiveNetwork.bind(this);
  }

  componentDidMount() {
    const { changeLocale, onSetNetwork } = this.props;
    const storedNetwork = LIST.NETWORKS.find(opt => opt.value === getNetwork());
    const storedLocale = getLocale();

    if (!_isEmpty(storedNetwork)) {
      onSetNetwork(storedNetwork);
    }
    if (!_isEmpty(storedLocale)) {
      changeLocale(storedLocale);
    }
  }

  handleChangeLocale(locale) {
    const { changeLocale } = this.props;
    setLocale(locale);
    changeLocale(locale);
  }

  handleChangeNetwork(newNetwork) {
    const { onSetNetwork, switchRPCServer } = this.props;
    onSetNetwork(newNetwork);
    switchRPCServer(newNetwork.value);
    this.handleLogout();
  }

  handleLogout() {
    const { onReleaseWallet, removeMetaMaskProvider } = this.props;

    Promise.all([
      onReleaseWallet(),
      removeWeb3Info(),
      removeLedger(),
      removeMetaMaskProvider(),
    ]).then(() => this.handleRedirectToHomepage());
  }

  handleRedirectToHomepage() {
    const { history } = this.props;
    history.push(ROUTE.LOGIN);
  }

  handleRenderPublicBar() {
    const { language } = this.props;

    return (
      <UncontrolledDropdown nav inNavbar>
        <DropdownToggleHeader nav>
          {(LIST.LANGUAGES.find(opt => opt.value === language) || {}).label}
          <i className='font-chevron-down' />
        </DropdownToggleHeader>
        <DropdownMenuStyler right className='shadow-lg'>
          {LIST.LANGUAGES.map((opt, optIdx) => (
            <DropdownItemStyler
              key={`language_${optIdx + 1}`}
              onClick={() => this.handleChangeLocale(opt.value)}
            >
              {opt.label}
            </DropdownItemStyler>
          ))}
        </DropdownMenuStyler>
      </UncontrolledDropdown>
    );
  }

  handleRenderPrivateBar() {
    const {
      intl: { formatMessage },
      network,
      onToggleNetworkConfirmationPopup,
      onToggleWalletPopup,
    } = this.props;
    const hasPrivateKey = _get(getWeb3Info(), 'recoveryPhrase', false);

    return (
      <Fragment>
        <UncontrolledDropdown nav inNavbar>
          <DropdownToggleHeader nav className='onl'>
            {_get(network, 'data.label')}
            <i className='font-chevron-down' />
          </DropdownToggleHeader>
          <DropdownMenuStyler right className='box_onl shadow'>
            {LIST.NETWORKS.map((opt, optIdx) => (
              <DropdownItemStyler
                key={`network_${optIdx + 1}`}
                onClick={() => onToggleNetworkConfirmationPopup(true, opt)}
                active={this.isActiveNetwork(opt)}
                disabled={this.isActiveNetwork(opt)}
              >
                {opt.label}
              </DropdownItemStyler>
            ))}
          </DropdownMenuStyler>
        </UncontrolledDropdown>
        <UncontrolledDropdown nav inNavbar>
          <DropdownToggleHeader nav>
            {formatMessage(MSG.HEADER_NAVBAR_OPTION_MY_WALLET)}
            <i className='font-chevron-down' />
          </DropdownToggleHeader>
          <DropdownMenuStyler right className='shadow-lg'>
            {hasPrivateKey && (
              <DropdownItemStyler onClick={() => onToggleWalletPopup(true)}>
                {formatMessage(
                  MSG.HEADER_NAVBAR_OPTION_MY_WALLET_OPTION_SHOW_WALLET,
                )}
              </DropdownItemStyler>
            )}
            <DropdownItemStyler>
              {formatMessage(MSG.HEADER_NAVBAR_OPTION_MY_WALLET_OPTION_HELP)}
            </DropdownItemStyler>
            <DropdownItemStyler onClick={this.handleLogout}>
              {formatMessage(MSG.HEADER_NAVBAR_OPTION_MY_WALLET_OPTION_LOG_OUT)}
            </DropdownItemStyler>
          </DropdownMenuStyler>
        </UncontrolledDropdown>
      </Fragment>
    );
  }

  isActiveNetwork(networkOpt) {
    const { network } = this.props;
    const { value } = networkOpt;

    return _isEqual(_get(network, 'data.value'), value);
  }

  render() {
    const {
      intl: { formatMessage },
      isLoggedIn,
      networkConfirmationPopup,
      onToggleNetworkConfirmationPopup,
    } = this.props;
    console.log(this.props.walletMode);
    return (
      <Fragment>
        <NavBarStyler light expand='md'>
          <NavbarBrand onClick={this.handleRedirectToHomepage}>
            <CardImg
              src={logo_tomochain}
              alt={formatMessage(MSG.HEADER_NAVBAR_LOGO_ALT)}
            />
          </NavbarBrand>
          <ToggleButton
            value={ this.props.walletMode === 'privacy' }
            onToggle={(value) => {
              this.props.onTogglePrivacyMode();
            }} />
          <Collapse navbar>
            <Nav className='ml-auto' navbar>
              {isLoggedIn && this.handleRenderPrivateBar()}
              {this.handleRenderPublicBar()}
            </Nav>
          </Collapse>
        </NavBarStyler>
        <WalletPopup />
        <NetworkConfirmationPopup
          popupData={networkConfirmationPopup}
          togglePopup={onToggleNetworkConfirmationPopup}
          changeNetwork={this.handleChangeNetwork}
        />
      </Fragment>
    );
  }
}
// ==========================

// ===== PROP TYPES =====
NavigationBar.propTypes = {
  /** Action to change locale */
  changeLocale: PropTypes.func,
  /** React Router's API object */
  history: PropTypes.object,
  /** React Intl's instance object */
  intl: PropTypes.object,
  /** Condition flag to check authentication state for proper option view */
  isLoggedIn: PropTypes.bool,
  /** Current chosen locale */
  language: PropTypes.string,
  /** Navigation bar's data */
  navbar: PropTypes.object,
  /** Network dropdown data */
  network: PropTypes.object,
  /** Network update confirmation popup's data */
  networkConfirmationPopup: PropTypes.object,
  /** Action to remove current wallet's data */
  onReleaseWallet: PropTypes.func,
  /** Action to update network options */
  onSetNetwork: PropTypes.func,
  /** Action to show/hide navigation bar options */
  onToggleNavbarOptions: PropTypes.func,
  /** Action to show/hide network update confirmation popup */
  onToggleNetworkConfirmationPopup: PropTypes.func,
  /** Action to show/hide show-wallet popup */
  onToggleWalletPopup: PropTypes.func,
  /** Action to remove MetaMask provider */
  removeMetaMaskProvider: PropTypes.func,
  /** Action to change current RPC Server */
  switchRPCServer: PropTypes.func,
};

NavigationBar.defaultProps = {
  changeLocaleL: () => {},
  history: {},
  intl: {},
  isLoggedIn: false,
  language: 'en',
  network: {},
  networkConfirmationPopup: {},
  onReleaseWallet: () => {},
  onSetNetwork: () => {},
  onToggleNavbarOptions: () => {},
  onToggleNetworkConfirmationPopup: () => {},
  onToggleWalletPopup: () => {},
  removeMetaMaskProvider: () => {},
  switchRPCServer: () => {},
};
// ======================

// ===== INJECTIONS =====
const mapStateToProps = (state) =>
  createStructuredSelector({
    network: selectNetworkData,
    networkConfirmationPopup: selectNetworkConfirmationPopup,
    walletMode: selectMode
  });
const mapDispatchToProps = dispatch => ({
  onReleaseWallet: () => dispatch(releaseWallet()),
  onSetNetwork: network => dispatch(setNetwork(network)),
  onToggleNetworkConfirmationPopup: (bool, networkOpt) =>
    dispatch(toggleNetworkConfirmationPopup(bool, networkOpt)),
  onToggleWalletPopup: bool => dispatch(toggleWalletPopup(bool)),
  onTogglePrivacyMode: () => dispatch(togglePrivacyMode())
});
const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);
// ======================

export default compose(
  withConnect,
  withRouter,
  withWeb3,
  withIntl,
)(NavigationBar);
