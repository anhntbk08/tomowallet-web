/**
 *
 * TomoWallet - My Wallet Page - Send Token Popup - Form
 *
 */
// ===== IMPORTS =====
// Modules
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import _get from 'lodash.get';
import {
  Form,
  FormGroup,
  Input,
  Label,
  InputGroup,
  InputGroupAddon,
  Button,
  Container,
  Row,
  Col,
  FormFeedback,
  Nav,
  NavItem,
} from 'reactstrap';
import Select, { components } from 'react-select';
// Custom Components
import Image from '../../../../../components/Image';
// Utilities & Constants
import { convertLocaleNumber } from '../../../../../utils';
import { SEND_TOKEN_FIELDS, PORTFOLIO_COLUMNS } from '../../../constants';
import { MSG } from '../../../../../constants';
import { convertAmountWithDecimals } from '../../../../../utils/blockchain';
// ===================

// ===== MAIN COMPONENT =====
class FormContent extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      formdata: {}
    };
    this.handleMarkFieldInvalid = this.handleMarkFieldInvalid.bind(this);
    this.handleRenderErrorList = this.handleRenderErrorList.bind(this);
  }

  handleMarkFieldInvalid(field) {
    const { errors } = this.props;
    return Object.keys(errors).includes(field);
  }

  handleRenderErrorList(field) {
    const { errors } = this.props;
    return (
      <FormFeedback className='d-block'>
        <Nav>
          {_get(errors, [field], []).map((err, errIdx) => (
            <NavItem
              key={`error_${field}_${errIdx + 1}`}
              className='text-danger'
            >
              {`* ${err}`}
            </NavItem>
          ))}
        </Nav>
      </FormFeedback>
    );
  }

  updateInput = (field, value) => {
    this.state.formdata[field] = value;
    this.props.updateFields(this.state.formdata);
    this.setState({
      formdata: this.state.formdata
    });
  }

  render() {
    const {
      formatMessage,
    } = this.props;

    console.log("this.state.formdata[SEND_TOKEN_FIELDS.RECIPIENT]  ",this.state.formdata);
    return (
      <Form onSubmit={this.submitForm} className='cm_form'>
        <FormGroup>
          <Label>
            {formatMessage(
              MSG.MY_WALLET_POPUP_SEND_TOKEN_INPUT_RECIPIENT_LABEL,
            )}
          </Label>
          <Input
            name={SEND_TOKEN_FIELDS.RECIPIENT}
            value={this.state.formdata[SEND_TOKEN_FIELDS.RECIPIENT]}
            placeholder={formatMessage(
              MSG.MY_WALLET_POPUP_SEND_TOKEN_INPUT_RECIPIENT_PLACEHOLDER,
            )}
            onChange={e =>
              this.updateInput(SEND_TOKEN_FIELDS.RECIPIENT, e.target.value)
            }
          />
          {this.handleRenderErrorList(SEND_TOKEN_FIELDS.RECIPIENT)}
        </FormGroup>
        <FormGroup>
          <Label>
            {formatMessage(
              MSG.MY_WALLET_POPUP_SEND_TOKEN_INPUT_TRANSFER_AMOUNT_LABEL,
            )}
          </Label>
          <InputGroup>
            <Input
              type='number'
              name={SEND_TOKEN_FIELDS.TRANSFER_AMOUNT}
              value={this.state.formdata[SEND_TOKEN_FIELDS.TRANSFER_AMOUNT]}
              placeholder={formatMessage(
                MSG.MY_WALLET_POPUP_SEND_TOKEN_INPUT_TRANSFER_AMOUNT_PLACEHOLDER,
              )}
              onChange={e =>
                this.updateInput(SEND_TOKEN_FIELDS.TRANSFER_AMOUNT, e.target.value)
              }
            />
          </InputGroup>
        </FormGroup>
      </Form>
    );
  }
}
// ==========================
// ======================

export default FormContent;
