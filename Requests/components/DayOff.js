import React from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { Grid } from '@material-ui/core';
import styled from 'styled-components';
import { RadioTwoPicker, SingleDate } from 'ui';
import {
  MuiPickersUtilsProvider,
  TimePicker
} from 'material-ui-pickers';
import DateFnsUtils from '@date-io/moment';

import Description from './Description';
import { UserType } from 'utils/types';

const DayOff = ({
  date,
  timeFrom,
  timeTo,
  update,
  user,
  send,
  title,
  comment,
  errorDesc,
  chosenRequest
}) => {
  const [typeOfDayOff, setTypeOfDayOff] = React.useState('dayOff');

  const handleHourFromChange = (date) => {
    if (new Date(date) > new Date(timeTo)) {
      toast.warning('Время начала не может быть больше времени конца');
      return;
    }

    const newHourFrom = new Date(date);
    update({ timeFrom: newHourFrom, type: typeOfDayOff });
  };

  const handleHourToChange = (date) => {
    if (new Date(date) < new Date(timeFrom)) {
      toast.warning('Время конца не может быть меньше времени начала');
      return;
    }

    const newHourTo = new Date(date);
    update({ timeTo: newHourTo, type: typeOfDayOff });
  };

  const changeSee = (event) => {
    setTypeOfDayOff(event.target.value);
    update({ timeFrom, timeTo, type: event.target.value });
  };

  const onDateChoose = (date) => {
    const isBefore = date.setHours(0, 0, 0, 0) < disabledDays.before.setHours(0, 0, 0, 0);
    if (user.role !== 'admin' && isBefore) return;
    update({ date, type: typeOfDayOff });
  };

  const onSubmit = async () => {
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

    await send();
  };

  return (
    <StyledGrid container>
      <Grid item lg={6} md={4} xs={12} >
        <SingleDate
          onDateChoose={onDateChoose}
          disabledDays={disabledDays}
          selectedDate={date}
        />
      </Grid>
      <Grid item sm={6} xs={12}>
        <Description
          submit={onSubmit}
          type={chosenRequest}
          title={title}
          comment={comment}
          error={errorDesc}
          update={update} />
      </Grid>
      <Grid item sm={6} xs={12}>
          <RadioTwoPicker
            value={typeOfDayOff}
            onChange={changeSee}
            firstValue="dayOff"
            firstLabel="Отгул на день"
            secondValue="timeOff"
            secondLabel="Отгул в течение дня"
          />
          {typeOfDayOff === 'timeOff'
            ? (<StyledPickersContainer>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <TimePicker
                    ampm={false}
                    margin="normal"
                    label="Начало"
                    value={timeFrom}
                    onChange={handleHourFromChange}
                    autoOk
                  />
                  <TimePicker
                    ampm={false}
                    margin="normal"
                    label="Конец"
                    value={timeTo}
                    onChange={handleHourToChange}
                    autoOk
                  />
                </MuiPickersUtilsProvider>
              </StyledPickersContainer>)
            : ('')}
      </Grid>
    </StyledGrid>
  );
};


const disabledDays = {
  before: new Date()
};

const StyledGrid = styled(Grid)`
  && {
    width: 80%;
    margin: 30px auto 0;
    justify-content: space-between;
  }
`;

const StyledPickersContainer = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;

  & > div:first-child {
    margin-right: 10px;
  }
`;

DayOff.propTypes = {
  send: PropTypes.func.isRequired,
  user: UserType.isRequired,
  update: PropTypes.func.isRequired,
  date: PropTypes.any,
  error: PropTypes.bool,
  errorDesc: PropTypes.bool,
  timeFrom: PropTypes.instanceOf(Date),
  timeTo: PropTypes.instanceOf(Date),
  title: PropTypes.string,
  comment: PropTypes.string,
  chosenRequest: PropTypes.string,
};

DayOff.defaultProps = {
  date: null,
  user: {},
  timeFrom: null,
  timeTo: null,
  title: '',
  comment: '',
  errorDesc: false,
  error: false,
  chosenRequest: 'technical',
};

export default DayOff;
