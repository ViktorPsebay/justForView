import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import _pickBy from 'lodash/pickBy';
import _identity from 'lodash/identity';

import { Grid } from '@material-ui/core';
import { DateRange } from 'ui';
import Description from './Description';
import { UserType } from 'utils/types';

class Medical extends Component {
  onDateSend = (newDates) => {
    const { datesWeek, update } = this.props;
    if (datesWeek.from && datesWeek.to) {
      update({ datesWeek: {}, error: false });
      return;
    }
    update({ datesWeek: { ...datesWeek, ..._pickBy(newDates, _identity) } });
  }

  submit = () => {
    const { datesWeek, update, title, comment } = this.props;

    const errs = [
      (!datesWeek.from || !datesWeek.to) && 'Заполните даты',
      !title && 'Заполните заголовок',
      !comment && 'Заполните комментарий',
    ].filter(fieldErr => fieldErr);

    if (errs.length) {
      errs.forEach(fieldErr => toast.warning(fieldErr));
      update({ error: true });
      return;
    }

    this.props.send();
  };

  render() {
    const {
      datesWeek: dates,
      chosenRequest,
      title,
      comment,
      errorDesc,
      update,
      notActiveDays,
      user,
    } = this.props;
    return (
      <StyledDiv>
        <StyledGrid container>
          <Grid item xs={12}>
            <DateRange
              notActiveDays={notActiveDays}
              dates={dates}
              userRole={user.role}
              type={chosenRequest}
              sendRequest={this.onDateSend}
            />
          </Grid>
          <Grid item xs={12}>
            <Description
              submit={this.submit}
              type={chosenRequest}
              title={title}
              comment={comment}
              error={errorDesc}
              update={update}
            />
          </Grid>
        </StyledGrid>
      </StyledDiv>
    );
  }
}

const StyledGrid = styled(Grid)`
  width: 80%;
  margin: 0 auto;
`;

const StyledDiv = styled.div`
  .DayPicker-Month {
    margin-bottom: 30px !important;
  }

  @media (max-width: 725px) and (min-width: 610px) {
    .DayPicker {
      width: 315px;
    }
  }
`;

Medical.propTypes = {
  send: PropTypes.func.isRequired,
  update: PropTypes.func.isRequired,
  user: UserType.isRequired,
  datesWeek: PropTypes.objectOf(PropTypes.any),
  error: PropTypes.bool,
  errorDesc: PropTypes.bool,
  title: PropTypes.string,
  comment: PropTypes.string,
  chosenRequest: PropTypes.string,
  notActiveDays: PropTypes.arrayOf(PropTypes.any)
};

Medical.defaultProps = {
  title: '',
  comment: '',
  errorDesc: false,
  error: false,
  user: {},
  chosenRequest: 'technical',
  notActiveDays: [{ before: new Date() }],
};

export default Medical;
