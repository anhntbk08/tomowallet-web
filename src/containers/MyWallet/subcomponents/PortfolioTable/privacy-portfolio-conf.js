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
import { convertAmountWithDecimals } from '../../../../utils/blockchain';
// ===================

// ===== CONFIGURATION =====
export default ({ formatMessage, openSendTokenPopup, onWithdraw }) => [
  {
    Header: formatMessage(MSG.MY_WALLET_TABLE_PORTFOLIO_HEADER_TOKEN_NAME),
    columns: [
      {
        headerClassName: 'd-none',
        accessor: PORTFOLIO_COLUMNS.TOKEN_NAME,
        Cell: ({ value }) => (
          <TokenCell formatMessage={formatMessage} value={value} />
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
            parseFloat(convertAmountWithDecimals(value, decimals)),
            3,
          );
        },
      },
    ],
  },
  {
    accessor: 'abc',
    columns: [
      {
        headerClassName: 'd-none',
        accessor: PORTFOLIO_COLUMNS.SEND,
        Cell: ({ original }) => {
          return (
          <TextYellowPointer
            role='presentation'
            onClick={() =>
              onWithdraw({
                [SEND_TOKEN_FIELDS.TOKEN]: original,
                isTokenSpecific: true,
              })
            }
          >
            Withdraw 15 tomo
          </TextYellowPointer>
        )},
      },
      {
        headerClassName: 'd-none',
        accessor: PORTFOLIO_COLUMNS.SEND,
        Cell: ({ original }) => {
          return (
          <TextYellowPointer
            role='presentation'
            onClick={() =>
              openSendTokenPopup({
                [SEND_TOKEN_FIELDS.TOKEN]: original,
                isTokenSpecific: true,
              })
            }
          >
            Send 15 TOMO
          </TextYellowPointer>
        )},
      },
      
    ],
  },
];
// =========================
