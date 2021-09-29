import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import {
  ToggleButton,
  ToggleButtonGroup
} from '@material-ui/lab';
import { Paper } from '@material-ui/core';

class RequestChoose extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chosenRequest: ''
    };
  }

  onClick = (value) => {
    if (value === this.state.chosenRequest) {
      this.setState({
        chosenRequest: ''
      });
      this.props.onChoose('');
      return;
    }
    this.setState({
      chosenRequest: value
    });
    this.props.onChoose(value);
  };

  render() {
    return (
      <Paper style={{ width: '80%' }}>
        <StyledButtonGroup value={this.state.chosenRequest} exclusive>
          <ToggleButton
            value="technical"
            className="request-picker tech-btn"
            onClick={() => this.onClick('technical')}
          >
            Технический
          </ToggleButton>
          <ToggleButton
            value="dayOff"
            onClick={() => this.onClick('dayOff')}
            className="request-picker dayoff-btn"
          >
            Отгул
          </ToggleButton>
          <ToggleButton
            value="vacation"
            className="request-picker vac-btn"
            onClick={() => this.onClick('vacation')}
          >
            Отпуск
          </ToggleButton>
          <ToggleButton
            value="medical"
            className="request-picker med-btn"
            onClick={() => this.onClick('medical')}
          >
            Больничный
          </ToggleButton>

          <ToggleButton
            value="common"
            className="request-picker common-btn"
            onClick={() => this.onClick('common')}
          >
            Бытовой
          </ToggleButton>

          <ToggleButton
            value="documents"
            className="request-picker documents-btn"
            onClick={() => this.onClick('documents')}
          >
            Документы
          </ToggleButton>
        </StyledButtonGroup>
      </Paper>
    );
  }
}

const StyledButtonGroup = styled(ToggleButtonGroup)`
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-around;

  & button {
    margin: 0;
    width: calc(100% / 6);
  }

  @media (max-width: 1150px) {
    & button {
      font-size: .8em;
    }
  }

  @media (max-width: 990px) {
    & button {
      font-size: .5em;
    }
  }
 
  @media (max-width: 768px) {
    & button {
      font-size: .7em;
    }
  }
  
  @media (max-width: 610px) {
    flex-direction: column;
  }

  @media (max-width: 1024px) {
    & button {
      width: auto;
    }
  }
`;

RequestChoose.propTypes = {
  onChoose: PropTypes.func.isRequired
};

export default RequestChoose;
