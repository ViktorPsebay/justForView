import React, { Component } from 'react';
import PropTypes from 'prop-types';
import style from 'styled-components';

class Warning extends Component {
  render() {
    if (!this.props.show) {
      return null;
    }
    return (
      <Text
        style={{
          display: this.props.display
        }}
      >
        {`! ${this.props.text} !`}
      </Text>
    );
  }
}

const Text = style.p`
  text-align: center;
  font-size: 18px;
  color: #eea236;
  text-decoration:'underline;
`;

Warning.propTypes = {
  text: PropTypes.string,
  display: PropTypes.string,
  show: PropTypes.bool
};

Warning.defaultProps = {
  text: 'Выберите даты, заголовок, комментарий',
  display: '',
  show: false
};

export default Warning;
