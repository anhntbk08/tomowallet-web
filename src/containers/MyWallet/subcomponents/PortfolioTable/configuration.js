/**
 *
 * TomoWallet - Table Configuration - Portfolio Table
 *
 */
// ===== IMPORTS =====
// Modules
import React from 'react';
import _get from 'lodash.get';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UncontrolledDropdown } from 'reactstrap';
// Custom Components
import TokenCell from './subcomponents/TokenCell';
import {
  TextYellowPointer,
  DropdownToggleMainStyle,
  DropdownMenuMainStyler,
} from '../../../../styles';
// Utilities & Constants
import {
  convertLocaleNumber,
  getNetwork,
  getWeb3Info,
} from '../../../../utils';
import { PORTFOLIO_COLUMNS, SEND_TOKEN_FIELDS } from '../../constants';
import { MSG, ENUM, API } from '../../../../constants';
import { bnToDecimals } from '../../../../utils';
// ===================

// ===== CONFIGURATION =====
export default ({ formatMessage, openSendTokenPopup }) => [
  {
    Header: formatMessage(MSG.MY_WALLET_TABLE_PORTFOLIO_HEADER_TOKEN_NAME),
    columns: [
      {
        headerClassName: 'd-none',
        accessor: PORTFOLIO_COLUMNS.TOKEN_NAME,
        Cell: ({ original }) => (
          <TokenCell formatMessage={formatMessage} values={original} />
        ),
      },
    ],
  },
  {
    Header: formatMessage(MSG.MY_WALLET_TABLE_PORTFOLIO_HEADER_BALANCE),
    columns: [
      {
        headerClassName: 'd-none',
        accessor: PORTFOLIO_COLUMNS.BALANCE,
        Cell: ({ original, value }) => {
          const decimals = _get(original, PORTFOLIO_COLUMNS.DECIMALS);
          return convertLocaleNumber(
            parseFloat(bnToDecimals(value, decimals)),
            3,
          );
        },
      },
    ],
  },
  {
    Header: formatMessage(MSG.MY_WALLET_TABLE_PORTFOLIO_HEADER_VALUE),
    columns: [
      {
        headerClassName: 'd-none',
        accessor: PORTFOLIO_COLUMNS.VALUE,
        Cell: ({ original }) => {
          const rawBalance = _get(original, PORTFOLIO_COLUMNS.BALANCE);
          const decimals = _get(original, PORTFOLIO_COLUMNS.DECIMALS);
          return convertLocaleNumber(
            parseFloat(bnToDecimals(rawBalance, decimals)) *
              _get(original, [PORTFOLIO_COLUMNS.PRICE]),
            3,
          );
        },
      },
    ],
  },
  {
    Header: formatMessage(MSG.MY_WALLET_TABLE_PORTFOLIO_HEADER_PRICE),
    columns: [
      {
        headerClassName: 'd-none',
        accessor: PORTFOLIO_COLUMNS.PRICE,
        Cell: ({ value }) => convertLocaleNumber(value, 3),
      },
    ],
  },
  {
    accessor: 'abc',
    columns: [
      {
        headerClassName: 'd-none',
        accessor: PORTFOLIO_COLUMNS.SEND,
        Cell: ({ original }) => (
          <TextYellowPointer
            role='presentation'
            onClick={() =>
              openSendTokenPopup({
                [SEND_TOKEN_FIELDS.TOKEN]: original,
                isTokenSpecific: true,
              })
            }
          >
            {formatMessage(MSG.COMMON_BUTTON_SEND)}
          </TextYellowPointer>
        ),
      },
      {
        Cell: ({ original }) => {
          const networkKey = getNetwork();
          const address = _get(getWeb3Info(), 'address', '');
          const baseUrl = _get(API, [networkKey, 'VIEW_TOKEN'], '');
          const tokenType = _get(original, [PORTFOLIO_COLUMNS.TYPE], '');
          const tokenAddress = _get(
            original,
            [PORTFOLIO_COLUMNS.TOKEN_ADDRESS],
            '',
          );
          let viewLink = '';

          if (tokenType === ENUM.TOKEN_TYPE.CURRENCY) {
            viewLink = `${_get(
              API,
              [networkKey, 'VIEW_ADDRESS'],
              '',
            )}/${address}`;
          } else {
            switch (networkKey) {
              case ENUM.NETWORK_TYPE.TOMOCHAIN_TESTNET:
                viewLink = `${baseUrl}/${tokenAddress}`;
                break;
              case ENUM.NETWORK_TYPE.TOMOCHAIN_MAINNET:
                viewLink = `${baseUrl}/${tokenAddress}/${tokenType.toLowerCase()}/${address}`;
                break;
              default:
                viewLink = `${baseUrl}/${tokenAddress}`;
            }
          }

          return (
            <UncontrolledDropdown>
              <DropdownToggleMainStyle>
                <div className='text-right'>
                  <FontAwesomeIcon icon='ellipsis-v' />
                </div>
              </DropdownToggleMainStyle>
              <DropdownMenuMainStyler right>
                <a href={viewLink} rel='noopener noreferrer' target='_blank'>
                  {formatMessage(
                    MSG.MY_WALLET_TABLE_PORTFOLIO_CELL_ACTION_VIEW_ON_TOMOSCAN,
                    {
                      token: _get(original, [PORTFOLIO_COLUMNS.TOKEN_NAME], ''),
                    },
                  )}
                </a>
              </DropdownMenuMainStyler>
            </UncontrolledDropdown>
          );
        },
      },
    ],
  },
];
// =========================
