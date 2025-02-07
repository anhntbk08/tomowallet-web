/**
 *
 * TomoWallet - Utility - Blockchain supported methods
 *
 */
// ===== IMPORTS =====
// Modules
import Web3 from 'web3';
import HDWalletProvider from 'truffle-hdwallet-provider';
// import { stealth as Stealth, address as Address } from 'tomoprivacyjs';
import _get from 'lodash.get';
import _isEmpty from 'lodash.isempty';
import _isEqual from 'lodash.isequal';
// Utilities & Constants
import { trimMnemonic } from './miscellaneous';
import { getNetwork } from './storage';
import { ENUM, RPC_SERVER } from '../constants';
import trc20 from '../contractABIs/trc20.json';
import trc21 from '../contractABIs/trc21.json';
import trc21Issuer from '../contractABIs/trc21Issuer.json';
// ===================

// ===== SUPPORTED VARIABLES =====
const DEFAULT_GAS_PRICE = '250000000';
const DEFAULT_GAS_TOKEN = '500000';
const DEFAULT_GAS_CURRENCY = '21000';
const DEFAULT_CURRENCY_DECIMALS = 18;
const TOMO_Z_CONTRACT_ADDRESS = {
  TOMOCHAIN_MAINNET: '0x8c0faeb5c6bed2129b8674f262fd45c4e9468bee',
  TOMOCHAIN_TESTNET: '0x7081c72c9dc44686c7b7eab1d338ea137fa9f0d3',
};
// ===============================

// ===== METHODS =====
/**
 * mnemonicToPrivateKey
 *
 * Get private key from mnemonic and RPC server's HD path
 * @param {String} mnemonic A string of 12 words
 * @param {Object} serverConfig Current RPC server configurations
 */
const mnemonicToPrivateKey = (mnemonic = '', serverConfig = {}) => {
  const web3 = generateWeb3(mnemonic, serverConfig);
  if (web3) {
    const pkInBytes =
      web3.currentProvider.wallets[web3.currentProvider.addresses[0]]._privKey;

    return web3.utils.bytesToHex(pkInBytes).replace(/^0x/, '');
  }
  return '';
};

/**
 * generateWeb3
 *
 * Create a new Web3 object with provided mnemonic & RPC server configurations
 * @param {String} mnemonic A string of 12 words
 * @param {Object} serverConfig Current RPC server configurations
 * @param {function} callback Action to handle error cases
 */
const generateWeb3 = (
  mnemonic = '',
  serverConfig = {},
  callback = () => {},
) => {
  const { host, hdPath } = serverConfig;
  let provider;
  try {
    provider = new HDWalletProvider(mnemonic, host, 0, 1, true, hdPath);
    return new Web3(provider);
  } catch (error) {
    callback(error);
    return null;
  }
};

/**
 * getWalletInfo
 *
 * Retrieve some wallet's basic information from a Web3 object
 * @param {Web3} web3 A Web3 object with supported APIs
 */
const getWalletInfo = web3 => {
  if (web3) {
    const address =
      web3.currentProvider.selectedAddress ||
      (web3.currentProvider.addresses && web3.currentProvider.addresses[0]);
    if (address) {
      return web3.eth.getBalance(address).then(balance => ({
        address,
        balance,
      }));
    }
  }
  return new Promise(r => r());
};

/**
 * getBalance
 *
 * Retrieve account balance by its address
 * @param {String} address A valid hex-string address
 */
const getBalance = address => {
  const networkKey = getNetwork() || ENUM.NETWORK_TYPE.TOMOCHAIN_MAINNET;
  const networkURL = _get(RPC_SERVER, [networkKey, 'host']);
  const web3 = new Web3(networkURL);

  if (web3.utils.isAddress(address)) {
    return web3.eth.getBalance(address);
  }
  return new Promise(r => r());
};

/**
 * initiateWallet
 *
 * Initiate Web3 & wallet information when refreshing page
 * @param {String} mnemonic A string of recovery phrase for wallet access
 * @param {Object} serverConfig RPC server configuration properties
 * @param {Function} callback Method to catch exception
 */
const initiateWallet = (mnemonic, serverConfig, callback = () => {}) => {
  const web3 = generateWeb3(mnemonic, serverConfig, callback);
  return getWalletInfo(web3).then(walletInfo => ({
    web3,
    walletInfo,
  }));
};

/**
 * encryptKeystore
 *
 * Encrypt plain wallet information into keystore by password
 * @param {Web3} web3 A Web3 object with supported APIs
 * @param {Wallet} rawInfo Plain wallet information
 */
const encryptKeystore = (web3, rawInfo, password) => {
  if (web3 && rawInfo) {
    return web3.eth.accounts.encrypt(rawInfo, password);
  }
  return [];
};

/**
 * decryptKeystore
 *
 * Decrypt a keystore into wallet information by password
 * @param {Web3} web3 A Web3 object with supported APIs
 * @param {Wallet} rawInfo Encrypted Wallet object
 */
const decryptKeystore = (web3, encryptedInfo, password) => {
  if (web3 && encryptedInfo) {
    return web3.eth.accounts.decrypt(encryptedInfo, password);
  }
  return {};
};

/**
 * isAppliedTomoZ
 *
 * Check if the given token is applied TomoZ (has its own transaction fee)
 * @param {Web3} web3 A Web3 object with supported APIs
 * @param {String} tokenAddress Address of token to verify
 */
const isAppliedTomoZ = (web3, txData) => {
  const { contractAddress, from } = txData;
  const networkKey = getNetwork();
  const tomoZContract = new web3.eth.Contract(
    trc21Issuer,
    TOMO_Z_CONTRACT_ADDRESS[networkKey],
  );
  return tomoZContract.methods
    .getTokenCapacity(contractAddress)
    .call({ from })
    .then(cap => {
      if (Number(cap)) {
        return true;
      }
      return false;
    })
    .catch(() => false);
};

const estimateTRC21Fee = (web3, txData) => {
  const { amount, contractAddress, decimals, from, to } = txData;
  const contract = new web3.eth.Contract(trc21, contractAddress, from);
  const weiAmount = decimalsToBN(amount, decimals);

  return isAppliedTomoZ(web3, txData).then(isApplied => {
    if (isApplied) {
      return contract.methods
        .estimateFee(weiAmount)
        .call({ from, to })
        .then(fee => {
          return {
            type: ENUM.TOKEN_TYPE.TRC21,
            amount: bnToDecimals(fee, decimals),
            gas: DEFAULT_GAS_TOKEN,
            gasPrice: DEFAULT_GAS_PRICE,
          };
        });
    }
    return estimateTRC20Fee(web3, txData);
  });
};

const estimateTRC20Fee = (web3, txData) => {
  const { amount, contractAddress, decimals, from, to } = txData;
  const contract = new web3.eth.Contract(trc20, contractAddress || from);
  const weiAmount = decimalsToBN(amount, decimals);

  return contract.methods
    .transfer(to, weiAmount)
    .estimateGas({ from })
    .then(gas =>
      web3.eth.getGasPrice().then(price => {
        const feeObj = web3.utils
          .toBN(gas)
          .mul(web3.utils.toBN(price))
          .divmod(web3.utils.toBN(10 ** DEFAULT_CURRENCY_DECIMALS));
        return {
          type: ENUM.TOKEN_TYPE.TRC20,
          amount: `${feeObj.div}.${feeObj.mod.toString(
            10,
            DEFAULT_CURRENCY_DECIMALS,
          )}`,
          gas,
          gasPrice: price,
        };
      }),
    );
};

const estimateCurrencyFee = (web3, txData) => {
  const { decimals, type } = txData;
  const feeObj = web3.utils
    .toBN(DEFAULT_GAS_PRICE)
    .mul(web3.utils.toBN(DEFAULT_GAS_CURRENCY))
    .divmod(web3.utils.toBN(10 ** decimals));
  const stringFee = `${feeObj.div}.${feeObj.mod.toString(10, decimals)}`;
  return new Promise(r =>
    r({
      type,
      amount: stringFee,
      gas: DEFAULT_GAS_CURRENCY,
      gasPrice: DEFAULT_GAS_PRICE,
    }),
  );
};

/**
 * getLedgerTokenTransferData
 *
 * Convert token transfer params for Ledger address into hex-string data
 * @param {Web3} web3 A Web3 object with supported APIs
 * @param {*} contractData An object which contains contract data
 */
const getLedgerTokenTransferData = (web3, contractData) => {
  const { amount, contractAddress, decimals, to, type } = contractData;
  const contract = new web3.eth.Contract(
    _isEqual(type, ENUM.TOKEN_TYPE.TRC21) ? trc21 : trc20,
    contractAddress,
  );
  const weiAmount = decimalsToBN(amount, decimals);

  return contract.methods.transfer(to, weiAmount).encodeABI();
};

/**
 * sendToken
 *
 * Execute token transfer contract
 * @param {Web3} web3 A Web3 object with supported APIs
 * @param {*} contractData An object which contains contract data
 */
const sendToken = (web3, contractData) => {
  const { amount, contractAddress, decimals, from, to, type } = contractData;
  const contract = new web3.eth.Contract(
    _isEqual(type, ENUM.TOKEN_TYPE.TRC21) ? trc21 : trc20,
    contractAddress,
  );
  const weiAmount = decimalsToBN(amount, decimals);

  return new Promise(resolve => {
    if (type === ENUM.TOKEN_TYPE.TRC20) {
      resolve(estimateTRC20Fee(web3, contractData));
    } else if (type === ENUM.TOKEN_TYPE.TRC21) {
      resolve(estimateTRC21Fee(web3, contractData));
    }
  }).then(priceObj =>
    contract.methods
      .transfer(to, weiAmount)
      .send({
        from,
        gasPrice: (priceObj.type = ENUM.TOKEN_TYPE.TRC21
          ? DEFAULT_GAS_PRICE
          : priceObj.gasPrice),
        gas: priceObj.gas,
      })
      .on('transactionHash', hash => {
        repeatCall({
          interval: 2000,
          timeout: 10000,
          action: () => web3.eth.getTransactionReceipt(hash),
        });
      }),
  );
};

/**
 * sendMoney
 *
 * Execute token transfer contract
 * @param {Web3} web3 A Web3 object with supported APIs
 * @param {*} contractData An object which contains contract data
 */
const sendMoney = (web3, transactionData) => {
  const { amount, decimals, from, to } = transactionData;
  // const weiAmount = (amount * 10 ** decimals).toString();
  const remainDecimals =
    amount.indexOf('.') !== -1
      ? decimals - (amount.length - 1 - amount.indexOf('.'))
      : decimals;
  const weiAmount = web3.utils
    .toBN(`${amount}`.replace('.', ''))
    .mul(web3.utils.toBN(10 ** remainDecimals))
    .toString(10);

  return web3.eth.sendTransaction({
    from,
    to,
    value: weiAmount,
    gasPrice: DEFAULT_GAS_PRICE,
    gas: DEFAULT_GAS_CURRENCY,
  });
};

/**
 * repeatCall
 *
 * Execute a Promise action repeatly until there's a result
 * @param {Object} params Set of parameters (interval, timeout, action)
 */
const repeatCall = ({ interval = 1000, timeout = 1000, action = () => {} }) => {
  let intervalId = 0;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const repeat = (ms, func) =>
    new Promise(r => {
      intervalId = setInterval(func, ms);
      wait(ms).then(r);
    });
  const stopAfter10Seconds = () =>
    new Promise(r => r(setTimeout(() => clearInterval(intervalId)), timeout));
  return repeat(
    interval,
    action().then(trans => {
      if (!_isEmpty(trans)) {
        clearInterval(intervalId);
      }
    }),
  ).then(stopAfter10Seconds());
};

/**
 * fromWei
 *
 * Convert a Wei-format number into a decimal number
 * @param {Number} amount An amount of TOMO in Wei format
 */
const fromWei = amount => {
  const web3 = new Web3();
  return web3.utils.fromWei(amount);
};

/**
 * repeatGetTransaction
 *
 * Repeatly call to get transaction data with provided hash
 * @param {Web3} web3 A Web3 object with supported APIs
 * @param {String} txHash A hex string of transaction hash
 */
const repeatGetTransaction = (web3, txHash) => {
  repeatCall({
    interval: 2000,
    timeout: 10000,
    action: () => {
      return web3.eth.getTransactionReceipt(txHash);
    },
  });
};

const bnToDecimals = (numberToConvert, decimals) => {
  if (!numberToConvert) {
    return '0';
  }
  const web3 = new Web3();
  const numberObj = web3.utils
    .toBN(numberToConvert)
    .divmod(web3.utils.toBN(10 ** decimals));

  return `${numberObj.div}.${numberObj.mod.toString(10, decimals)}`;
};

const decimalsToBN = (numberToConvert, decimals) => {
  if (!numberToConvert) {
    return '0';
  }

  const web3 = new Web3();
  const rawDecimals =
    numberToConvert.indexOf('.') !== -1
      ? numberToConvert.length - 1 - numberToConvert.indexOf('.')
      : 0;
  let remainDecimals;
  if (rawDecimals) {
    if (decimals >= rawDecimals) {
      remainDecimals = decimals - rawDecimals;
      return web3.utils
        .toBN(`${numberToConvert}`.replace('.', ''))
        .mul(web3.utils.toBN(remainDecimals === 0 ? 1 : 10 ** remainDecimals))
        .toString(10);
    } else {
      remainDecimals = rawDecimals - decimals;
      return web3.utils
        .toBN(`${numberToConvert}`.replace('.', ''))
        .div(web3.utils.toBN(10 ** remainDecimals))
        .toString(10);
    }
  }
  remainDecimals = decimals;
  return web3.utils
    .toBN(`${numberToConvert}`.replace('.', ''))
    .mul(web3.utils.toBN(10 ** remainDecimals))
    .toString(10);
};

/**
 * isRecoveryPhrase
 *
 * Check if the input string is a valid recovery phrase
 * @param {String} rawData recovery phrase input's value
 */
const isRecoveryPhrase = rawData => {
  if (rawData) {
    const trimData = trimMnemonic(rawData);

    return trimData.split(' ').length === 12;
  }
  return false;
};

/**
 * isPrivateKey
 *
 * Check if the input string is a valid private key
 * @param {String} rawData private key input's value
 */
const isPrivateKey = rawData => {
  if (rawData) {
    const web3 = new Web3();
    const trimData = rawData.trim().replace(/^0x/, '');

    return web3.utils.isHex(trimData) && trimData.length === 64;
  }
  return false;
};

/**
 * isAddress
 *
 * Check if the input string is a valid private key
 * @param {String} rawData address input's value
 */
const isAddress = rawData => {
  if (rawData) {
    const web3 = new Web3();

    return web3.utils.isAddress(rawData);
  }
  return false;
};
// ===================

// ===== EXPERIMENTING METHODS =====
// const setSenderCommitment = (sender, receiverPrivateAddr, amountInDecimals) => {
//   const receiver = Stealth.fromString(receiverPrivateAddr);
//   const proof = sender.genTransactionProof(
//     amountInDecimals,
//     receiver.pubSpendKey,
//     receiver.pubViewKey,
//   );

//   return sender.genCommiment(receiver.pubSpendKey, receiver.pubViewKey);
// };

// const getPaymentResult = (privKey, proof) => {
//   const receiver = new Stealth({
//     ...Address.generateKeys(privKey),
//   });

//   return receiver.checkTransactionProof(
//     proof.txPublicKey,
//     proof.onetimeAddress,
//     proof.mask,
//   );
// };

// =================================

export {
  bnToDecimals,
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
  initiateWallet,
  isAddress,
  isPrivateKey,
  isRecoveryPhrase,
  mnemonicToPrivateKey,
  repeatGetTransaction,
  sendMoney,
  sendToken,
};
