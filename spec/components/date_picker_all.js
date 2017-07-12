import React from 'react';
import DatePickerAll from '../../components/date_picker_all';

class DatePickerAllTest extends React.Component {
  state = {
    date: new Date(),
  };

  handleChange = (value) => {
    this.setState({ ...this.state, date: value });
  };

  render() {
    return (
      <section id="DatePickerAll">
        <h5>Datepicker with all button</h5>
        <DatePickerAll onChange={this.handleChange} value={this.state.date} />
      </section>
    );
  }
}

export default DatePickerAllTest;
