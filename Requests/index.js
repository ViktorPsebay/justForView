import React, { Component } from 'react';
import moment from 'moment';
import { toast } from 'react-toastify';

import { newRequestRequest } from 'api/userRequestApi';
import { connectGlobalUser } from 'store/connections';

import {
  Grid,
  Typography
} from '@material-ui/core';
import { RequestModal } from 'ui';
import RequestChoose from './components/RequestChoose';
import TillDate from './components/TillDate';
import DayOff from './components/DayOff';
import Vacation from './components/Vacation';
import Medical from './components/Medical';
import { UserType } from 'utils/types';

class Requests extends Component {
  getInitialStateData = () => ({
    showModal: false,
    data: {},
    timeFrom: new Date(),
    timeTo: moment(new Date()).add(1, 'hour').toDate(),
    stateData: {},
    title: '',
    type: null,
    date: null,
    dates: [],
    dateTo: null,
    comment: '',
    datesWeek: {},
    notActiveDays: [{ before: new Date() }],
    isUnpaid: false,
  });

  constructor(props) {
    super(props);
    this.state = {
      ...this.getInitialStateData(),
      chosenRequest: '',
    };
  }

  updateState = (state) => {
    this.setState(state);
  };

  onClick = (value) => this.setState({ chosenRequest: value });

  formattedData = () => {
    const {
      type: subTypeOfDayOff,
      chosenRequest: type,
      isUnpaid,
      title,
      date,
      comment,
      timeFrom,
      timeTo,
      datesWeek
    } = this.state;

    const stateData = {
      data: {
        from: this.props.user,
        isUnpaid,
        title,
        type,
        date,
        comment,
      },
      showModal: true
    };

    if (['technical', 'common', 'documents'].includes(type)) {
      stateData.data.dateTo = moment(date).format();
      stateData.data.dateFrom = null;
      stateData.dates = null;
    }

    if (['medical', 'vacation'].includes(type)) {
      stateData.data.dateFrom = moment(datesWeek.from).format();
      stateData.data.dateTo = moment(datesWeek.to).format();
      stateData.dates = null;
    }

    const [hourFrom, minuteFrom] = [moment(timeFrom).get('hour'), moment(timeFrom).get('minute')];
    const [hourTo, minuteTo] = [moment(timeTo).get('hour'), moment(timeTo).get('minute')];

    if (type === 'dayOff') {
      switch (subTypeOfDayOff) {
        case 'dayOff':
          stateData.data.dateFrom = moment(date).startOf('day');
          stateData.data.dateTo = moment(date).endOf('day');
          break;
        case 'timeOff':
          stateData.data.dateFrom = moment(date).set({ hour: hourFrom, minute: minuteFrom });
          stateData.data.dateTo = moment(date).set({ hour: hourTo, minute: minuteTo });
          stateData.data.type = 'timeOff';
          break;
        default:
          break;
      }
    }

    this.setState(stateData);
  };

  onHide = () => {
    this.setState({
      showModal: false
    });
  };

  submit = async (e) => {
    e.preventDefault();
    this.setState({
      showModal: false
    });
    const { data } = this.state;
    let emptyData = this.getInitialStateData();

    try {
      await newRequestRequest(data);
      toast.success('Заявка успешно отправлена');
    } catch (err) {
      console.log(err);
      toast.error(`Ошибка! Заявка не отправлена, по причине ${err}`);
      emptyData = {};
    }
    this.setState(emptyData);
  };

  createNormalDate = (field) => {
    if (Array.isArray(field)) {
      return field ? [...field] : undefined;
    }
    return field;
  };

  render() {
    const { data, chosenRequest } = this.state;
    data.dates = this.createNormalDate(data.dates);
    data.date = this.createNormalDate(data.date);
    const Form = forms[chosenRequest];

    return (
      <Grid container direction="column" alignItems="center">
        <Typography paragraph variant="h4" className="page-title">
          Выберите тип заявки
        </Typography>

        <RequestChoose onChoose={this.onClick} />

        {
          Form &&
          <Form
            send={this.formattedData}
            update={this.updateState}
            user={this.props.user}
            {...this.state}
          />
        }

        <RequestModal
          show={this.state.showModal}
          onHide={this.onHide}
          data={data}
          submit={this.submit}
          type="send"
        />
      </Grid>
    );
  }
}

const forms = {
  technical: TillDate,
  documents: TillDate,
  common: TillDate,
  dayOff: DayOff,
  vacation: Vacation,
  medical: Medical
};

Requests.propTypes = {
  user: UserType.isRequired,
};

export default connectGlobalUser(Requests);
