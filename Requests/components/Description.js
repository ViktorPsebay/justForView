import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import styled from 'styled-components';

import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  Checkbox
} from '@material-ui/core';
import Warning from './Warning';

class Description extends Component {
  topicSelector = createSelector(
    [
      (data) => data.type,
    ],
    (type) => {
      let text = `Причина взять ${type}.`;
      let verticalStyle = { height: '100%' };

      if (type === 'technical') {
        text = 'Описание технической заявки.';
      }

      if (type === 'common') {
        text = 'Описание бытовой заявки.';
      }

      if (type === 'documents') {
        text = 'Описание документов.';
      }

      const dateRangeTypes = [
        'отпуск',
        'больничный',
        'vacation',
        'medical'
      ];

      if (dateRangeTypes.includes(type)) {
        verticalStyle = { margin: '50px auto 0 auto', height: '100%' };
      }
      return { text, verticalStyle };
    }
  );

  onTextAreaChange = (e) => this.props.update({ comment: e.target.value });

  vacationTypeChangeHandler = () => {
    this.props.update({ isUnpaid: !this.props.isUnpaid });
  };

  titleChange = (e) => this.props.update({ title: e.target.value });

  render() {
    const { text, verticalStyle } = this.topicSelector(this.props);
    const { title, comment, error } = this.props;
    return (
      <StyledForm style={verticalStyle}>
        {this.props.type === 'vacation' && (
          <InputLabel className="checkbox-label">
            <Checkbox
              checked={this.props.isUnpaid}
              onClick={this.vacationTypeChangeHandler}
              color="primary"
            />
            Неоплачиваемый
          </InputLabel>
        )}
        <FormControl>
          <TextField
            onChange={this.titleChange}
            value={title}
            fullWidth
            label="Заголовок"
            type="text"
            maxLength="40"
            required
            placeholder="Краткий заголовок"
          />
        </FormControl>

        <FormControl>
          <TextField
            label="Комментарий"
            fullWidth
            multiline
            onChange={this.onTextAreaChange}
            value={comment}
            required
            placeholder={text}
          />
        </FormControl>

        <Button
          onClick={this.props.submit}
          className="accept-btn"
          style={{ float: 'right' }}
        >
          Отправить
        </Button>

        <Warning
          show={error}
          text="Опишите запрос"
          display="inline-block"
        />
      </StyledForm>
    );
  }
}

const StyledForm = styled.div`
  margin: 50px auto 0 20px;
  height: 80%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  & input {
    text-align: left;
  }

  & button {
    margin: 0 0 20px 0;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
  }

  @media (max-width: 599px) {
    margin: 50px auto 0 0px;
  }
`;

Description.propTypes = {
  submit: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  title: PropTypes.string,
  comment: PropTypes.string,
  error: PropTypes.bool,
  update: PropTypes.func,
  isUnpaid: PropTypes.bool,
};

Description.defaultProps = {
  title: '',
  comment: '',
  error: false,
  update: () => null,
};

export default Description;
