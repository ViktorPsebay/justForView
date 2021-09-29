import React from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

import {
  Grid,
  Typography
} from '@material-ui/core';
import styled from 'styled-components';
import { SingleDate } from 'ui';
import Description from './Description';
import { UserType } from 'utils/types';

const TillDate = (props) => {
  const {
    date,
    update,
    send,
    title,
    comment,
    errorDesc,
    chosenRequest,
    user,
  } = props;

  const onDateChoose = (date) => {
    const isBefore = date.setHours(0, 0, 0, 0) < disabledDays.before.setHours(0, 0, 0, 0);
    if (user.role !== 'admin' && isBefore) return;
    update({ date });
  };

  const onSubmit = () => {
    const errs = [
      !date && 'Заполните дату',
      !title && 'Заполните заголовок',
      !comment && 'Заполните комментарий',
    ].filter(fieldErr => fieldErr);

    if (errs.length) {
      errs.forEach(fieldErr => toast.warning(fieldErr));
      update({ error: true });
      return;
    }

    send();
  };
  return <>
    <StyledGrid container>
      <Grid item xs={12}>
        <Typography className="tillDate__title" variant="h6">
          До какого числа необходимо выполнить заявку
        </Typography>
      </Grid>
      <Grid item lg={6} md={4} xs={12}>
        <SingleDate
          onDateChoose={onDateChoose}
          disabledDays={disabledDays}
          selectedDate={date}
        />

      </Grid>
      <Grid item lg={6} md={5} xs={12}>
        <Description
          submit={onSubmit}
          type={chosenRequest}
          title={title}
          comment={comment}
          error={errorDesc}
          update={update}
        />
      </Grid>
    </StyledGrid>
  </>;
};

const StyledGrid = styled(Grid)`
  && {
    width: 80%;
    margin: 0 auto;
    justify-content: space-between;
  }

  .tillDate {
    &__title {
      text-align: center;
      margin-top: 30px;
      margin-bottom: 30px;
    }
  }
`;

const disabledDays = {
  before: new Date()
};

TillDate.propTypes = {
  user: UserType.isRequired,
  send: PropTypes.func.isRequired,
  update: PropTypes.func.isRequired,
  date: PropTypes.instanceOf(Date),
  error: PropTypes.bool,
  errorDesc: PropTypes.bool,
  title: PropTypes.string,
  comment: PropTypes.string,
  chosenRequest: PropTypes.string,
};

TillDate.defaultProps = {
  date: new Date(),
  user: {},
  title: '',
  comment: '',
  errorDesc: false,
  error: false,
  chosenRequest: 'technical',
};

export default TillDate;
