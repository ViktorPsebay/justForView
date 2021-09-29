import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _get from 'lodash/get';
import styled from 'styled-components';
import moment from 'moment';

import DayPicker, { DateUtils } from 'react-day-picker';

class DateRange extends Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }

  getInitialState = () => {
    return {
      from: null,
      to: null,
      enteredTo: null, // Keep track of the last day for mouseEnter.
      notActiveDays: [],
      dataFromProps: false,
    };
  };

  componentDidMount() {
    const { dates } = this.props;
    this.setState({ dataFromProps: !!dates });
  }

  isSelectingFirstDay = (from, to, day) => {
    const isBeforeFirstDay = from && DateUtils.isDayBefore(day, from);
    const isRangeSelected = from && to;
    return !from || isBeforeFirstDay || isRangeSelected;
  };

  handleClickForAdmin = (day) => {
    const { from, to, dataFromProps } = this.state;
    const { dates } = this.props;
    const dateFrom = _get(dates, 'from', null);
    const dateTo = _get(dates, 'to', null);

    if (dateFrom && dateTo && dataFromProps) {
      this.handleResetClick();
      return;
    }

    if (from && to && !dataFromProps) {
      this.handleResetClick();
      return;
    }

    if (dateFrom && dataFromProps) {
      this.props.sendRequest({ to: day, enteredTo: day });
      return;
    }

    if (from && !dataFromProps) {
      this.setState({ to: day, enteredTo: day });
      this.props.sendRequest({ from, to: day, enteredTo: day });
      return;
    }

    if (dataFromProps) {
      this.props.sendRequest({ from: day });
      return;
    }

    this.setState({ from: day });
  }

  handleDayClick = (day) => {
    const { dates, userRole, notActiveDays } = this.props;
    const dateFrom = _get(dates, 'from', null);
    const dateTo = _get(dates, 'to', null);
    const { from, to, dataFromProps } = this.state;

    if (
      this.props.type === 'vacation' &&
      userRole !== 'admin' &&
      dates.from &&
      dates.from.setHours(0, 0, 0, 0) === dates.enteredTo.setHours(0, 0, 0, 0)
    ) {
      return;
    }

    if (userRole === 'admin') {
      this.handleClickForAdmin(day);
      return;
    }
    if (!moment(day).isSameOrAfter(new Date(), 'days')) {
      return;
    }
    if (!dataFromProps && (from && to && day >= from && day <= to)) {
      this.handleResetClick();
      return;
    }

    if (dataFromProps && (dateFrom && dateTo && day >= dateFrom && day <= dateTo)) {
      this.props.sendRequest(null);
      return;
    }
    if ((!dataFromProps) && (this.isSelectingFirstDay(from, to, day))) {
      this.setState({
        from: day,
        to: null,
        enteredTo: null
      });
      return;
    }
    if (dataFromProps && (this.isSelectingFirstDay(dateFrom, dateTo, day))) {
      this.props.sendRequest({
        from: day,
        to: null,
        enteredTo: null
      });
      return;
    }
    let correctDay = notActiveDays.some(({ after, before } = {}) => {
      if (!before || !after) return false;

      return (
        (moment(day).isSame(after) && !moment(from).isSame(after)) ||
        moment(day).isSame(before)
      );
    });
    if (this.props.type !== 'vacation') {
      correctDay = true;
    }
    if (correctDay && dataFromProps) {
      this.setState({
        to: day,
        enteredTo: day
      });
      this.props.sendRequest({ from: this.state.from, to: day });
    }
    if (correctDay && dataFromProps) this.props.sendRequest({ from, to: day });
  };

  handleDayMouseEnter = (enteredTo) => {
    const { from, to } = this.state;
    const { dates } = this.props;
    if (!this.isSelectingFirstDay(from, to, enteredTo) && dates) {
      this.setState({ enteredTo });
      return;
    }

    const dateFrom = _get(dates, 'from', null);
    const dateTo = _get(dates, 'to', null);

    if (!this.isSelectingFirstDay(dateFrom, dateTo, enteredTo) && dates) {
      this.props.sendRequest({ enteredTo });
    }
  };

  handleResetClick = () => {
    this.setState(this.getInitialState());
  };

  render() {
    const { from, enteredTo, dataFromProps } = this.state;
    const { dates, notActiveDays, userRole } = this.props;
    // const disabledDays = userRole !== 'admin' ? notActiveDays : [];

    const enteredToDates = _get(dates, 'enteredTo', null);
    const fromDates = _get(dates, 'from', null);

    const end = dataFromProps ? enteredToDates : enteredTo;
    const start = dataFromProps ? fromDates : from;

    const modifiers = { start, end };
    const selectedDays = [start, { from: start, to: end }];

    return (
      <>
        {/* <ResetButton
          onClick={this.handleResetClick}
          bsSize='xsmall'
        >
          Сброс
        </ResetButton> */}

        <StyledDatePicker
          firstDayOfWeek={1}
          numberOfMonths={2}
          fromMonth={from}
          disabledDays={notActiveDays}
          selectedDays={selectedDays}
          modifiers={modifiers}
          onDayClick={this.handleDayClick}
          onDayMouseEnter={this.handleDayMouseEnter}
        />
      </>
    );
  }
}

const StyledDatePicker = styled(DayPicker)`
  && {
    display: block;
    margin: 30px auto 0 auto;
    max-width: 600px;
  }

  .DayPicker-NavButton {
    margin-top: 0;
    top: 0 !important;
    width: 1.3em !important;
    height: 1.3em !important;
  }

  &&
    .DayPicker-Day--selected:not(.DayPicker-Day--start):not(.DayPicker-Day--end):not(.DayPicker-Day--outside) {
    background-color: #f0f8ff;
    color: #4a90e2;
  }

  && .DayPicker-Day {
    border-radius: 0;
  }

  && .DayPicker-Month {
    width: 250px;
    max-width: 80%;
    font-size: 15px;
    margin: 0 20px 0px 20px;
  }

  & .DayPicker-TodayButton {
    display: block;
    margin: -20px auto 0 auto;
  }

  @media (max-width: 609px) {
    && {
      max-width: 315px;
    }

    && .DayPicker-Month {
      margin: 0 20px 30px 20px;
    }
  }
`;

// const ResetButton = styled(Button)`
//   display: block;
//   margin: 30px auto 5px auto;
// `;

DateRange.propTypes = {
  sendRequest: PropTypes.func.isRequired,
  userRole: PropTypes.string,
  type: PropTypes.string,
  dates: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  notActiveDays: PropTypes.array,
};

DateRange.defaultProps = {
  userRole: 'user',
  type: 'default',
  dates: null,
  notActiveDays: [],
};

export default DateRange;
