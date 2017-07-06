import React from 'react';
import Range from '../../components/range';

class RangeTest extends React.Component {
  state = {
    range2: { first: 0, second: 5 },
    range3: { first: 0, second: 1 },
  };

  handleChange = (range, value) => {
    this.setState({ ...this.state, [range]: value });
  };

  render() {
    return (
      <section id="Range">
        <h5>Ranges</h5>
        <p>Normal range</p>
        <Range value={this.state.range1} onChange={this.handleChange.bind(this, 'range1')} />
        <p>With steps, initial value and editable</p>
        <Range min={0} max={10} editable value={this.state.range2} onChange={this.handleChange.bind(this, 'range2')} />
        <p>Pinned and with snaps</p>
        <Range pinned snaps min={0} max={10} step={2} editable value={this.state.range3} onChange={this.handleChange.bind(this, 'range3')} />
        <p>Disabled status</p>
        <Range disabled pinned snaps min={0} max={10} step={2} editable value={this.state.range3} onChange={this.handleChange.bind(this, 'range3')} />
      </section>
    );
  }
}

export default RangeTest;
