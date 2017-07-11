import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import styleShape from 'react-style-proptype';
import { themr } from 'react-css-themr';
import { round, range } from 'react-toolbox/lib/utils/utils';
import { SLIDER } from 'react-toolbox/lib/identifiers';
import events from 'react-toolbox/lib/utils/events';
import InjectProgressBar from 'react-toolbox/lib/progress_bar/ProgressBar';
import InjectInput from 'react-toolbox/lib/input/Input';

const factory = (ProgressBar, Input) => {
  class Range extends Component {
    static propTypes = {
      className: PropTypes.string,
      disabled: PropTypes.bool,
      editable: PropTypes.bool,
      mapValueOnPin: PropTypes.func,
      max: PropTypes.number,
      min: PropTypes.number,
      onChange: PropTypes.func,
      onDragStart: PropTypes.func,
      onDragStop: PropTypes.func,
      pinned: PropTypes.bool,
      snaps: PropTypes.bool,
      step: PropTypes.number,
      style: styleShape,
      theme: PropTypes.shape({
        container: PropTypes.string,
        editable: PropTypes.string,
        innerknob: PropTypes.string,
        innerprogress: PropTypes.string,
        input: PropTypes.string,
        knob: PropTypes.string,
        pinned: PropTypes.string,
        pressed: PropTypes.string,
        progress: PropTypes.string,
        ring: PropTypes.string,
        slider: PropTypes.string,
        snap: PropTypes.string,
        snaps: PropTypes.string,
      }),
      value: PropTypes.shape({
        first: PropTypes.number,
        second: PropTypes.number,
      }),
    };

    static defaultProps = {
      buffer: 0,
      className: '',
      editable: false,
      mapValueOnPin: x => x,
      max: 100,
      min: 0,
      onDragStart: () => {},
      onDragStop: () => {},
      pinned: false,
      snaps: false,
      step: 0.01,
      value: {
        first: 0,
        second: 0,
      },
    };

    state = {
      inputFocused: {
        first: false,
        second: false,
      },
      inputValue: {
        first: null,
        second: null,
      },
      rangeLength: 0,
      rangeStart: 0,
    };

    componentDidMount() {
      window.addEventListener('resize', this.handleResize);
      this.handleResize();
    }

    componentWillReceiveProps(nextProps) {
      if (this.state.inputFocused.first && this.props.value.first !== nextProps.value.first) {
        this.setState({
          inputValue: {
            ...this.state.inputValue,
            first: this.valueForInput(nextProps.value.first),
          },
        });
      }
      if (this.state.inputFocused.second && this.props.value.second !== nextProps.value.second) {
        this.setState({
          inputValue: {
            ...this.state.inputValue,
            second: this.valueForInput(nextProps.value.second),
          },
        });
      }
    }

    shouldComponentUpdate(nextProps, nextState) {
      return this.state.inputFocused.first
        || !nextState.inputFocused.first
        || this.state.inputFocused.second
        || !nextState.inputFocused.second;
    }

    componentWillUpdate(nextProps, nextState) {
      if (nextState.pressed !== this.state.pressed) {
        if (nextState.pressed) {
          this.props.onDragStart();
        } else {
          this.props.onDragStop();
        }
      }
    }

    componentWillUnmount() {
      window.removeEventListener('resize', this.handleResize);
      events.removeEventsFromDocument(this.getMouseEventMap());
      events.removeEventsFromDocument(this.getTouchEventMap());
      events.removeEventsFromDocument(this.getKeyboardEvents());
    }

    getInput(type) {
      return this[`${type}InputNode`] && this[`${type}InputNode`].getWrappedInstance
        ? this[`${type}InputNode`].getWrappedInstance()
        : this[`${type}InputNode`];
    }

    getKeyboardEvents() {
      return {
        keydown: this.handleKeyDown,
      };
    }

    getMouseEventMap() {
      return {
        mousemove: this.handleMouseMove,
        mouseup: this.handleMouseUp,
      };
    }

    getTouchEventMap() {
      return {
        touchmove: this.handleTouchMove,
        touchend: this.handleTouchEnd,
      };
    }

    grabbedKnob = null;

    addToValue(type, increment) {
      let value = this.state.inputFocused[type]
        ? parseFloat(this.state.inputValue[type])
        : this.props.value[type];
      value = this.trimValue(value + increment);
      if (value !== this.props.value[type]) {
        const newValue = { ...this.props.value, [type]: value };
        this.props.onChange(newValue);
      }
    }

    handleInputFocus = (type) => {
      this.setState({
        inputFocused: {
          ...this.state.inputValue,
          [type]: true,
        },
        inputValue: {
          ...this.state.inputValue,
          [type]: this.valueForInput(this.props.value[type]),
        },
      });
    };

    handleInputChange = (type, value) => {
      this.setState({
        inputValue: {
          ...this.state.inputValue,
          [type]: value,
        },
      });
    };

    handleInputBlur = (type, event) => {
      const value = this.state.inputValue[type] || 0;
      this.setState({
        inputFocused: false,
        inputValue: { ...this.state.inputValue, [type]: null },
      }, () => {
        const newValue = { ...this.props.value, [type]: this.trimValue(value) };
        this.props.onChange(newValue, event);
      });
    };

    handleKeyDown = (event) => {
      const type = this.state.inputFocused.first ? 'first' : (this.state.inputFocused.second ? 'second' : null); // eslint-disable-line no-nested-ternary
      if (type) {
        if ([13, 27].indexOf(event.keyCode) !== -1) this.getInput(type).blur();
        if (event.keyCode === 38) this.addToValue(type, this.props.step);
        if (event.keyCode === 40) this.addToValue(type, -this.props.step);
      }
    };

    handleMouseDown = (type, event) => {
      if (this.state.inputFocused[type]) this.getInput(type).blur();
      this.grabbedKnob = type;
      events.addEventsToDocument(this.getMouseEventMap());
      this.start(events.getMousePosition(event));
      events.pauseEvent(event);
    };

    handleMouseMove = (event) => {
      events.pauseEvent(event);
      this.move(events.getMousePosition(event));
    };

    handleMouseUp = () => {
      this.end(this.getMouseEventMap());
    };

    handleResize = (event, callback) => {
      const { left, right } = ReactDOM.findDOMNode(this.progressbarNode).getBoundingClientRect();
      const cb = (callback) || (() => {});
      this.setState({ rangeStart: left, rangeLength: right - left }, cb);
    };

    handleRangeBlur = () => {
      events.removeEventsFromDocument(this.getKeyboardEvents());
    };

    handleRangeFocus = () => {
      events.addEventsToDocument(this.getKeyboardEvents());
    };

    handleTouchEnd = () => {
      this.end(this.getTouchEventMap());
    };

    handleTouchMove = (event) => {
      this.move(events.getTouchPosition(event));
    };

    handleTouchStart = (event) => {
      if (this.state.inputFocused) this.getInput().blur();
      this.start(events.getTouchPosition(event));
      events.addEventsToDocument(this.getTouchEventMap());
      events.pauseEvent(event);
    };

    end(revents) {
      events.removeEventsFromDocument(revents);
      this.setState({ pressed: false });
    }

    knobOffset(value) {
      const { max, min } = this.props;
      return 100 * ((value - min) / (max - min));
    }

    move(position) {
      const newKnobValue = this.positionToValue(position);
      if (newKnobValue !== this.props.value[this.grabbedKnob]) {
        const newValue = { ...this.props.value, [this.grabbedKnob]: newKnobValue };
        this.props.onChange(newValue);
      }
    }

    positionToValue(position) {
      const { rangeStart: start, rangeLength: length } = this.state;
      const { max, min, step } = this.props;
      const pos = ((position.x - start) / length) * (max - min);
      return this.trimValue((Math.round(pos / step) * step) + min);
    }

    start(position) {
      this.handleResize(null, () => {
        this.setState({ pressed: true });
        const newKnobValue = this.positionToValue(position);
        const newValue = { ...this.props.value, [this.grabbedKnob]: newKnobValue };
        this.props.onChange(newValue);
      });
    }

    stepDecimals() {
      return (this.props.step.toString().split('.')[1] || []).length;
    }

    trimValue(value) {
      if (value < this.props.min) return this.props.min;
      if (value > this.props.max) return this.props.max;
      return round(value, this.stepDecimals());
    }

    valueForInput(value) {
      const decimals = this.stepDecimals();
      return decimals > 0 ? value.toFixed(decimals) : value.toString();
    }

    renderSnaps() {
      if (!this.props.snaps) return undefined;
      return (
        <div className={this.props.theme.snaps}>
          {range(0, (this.props.max - this.props.min) / this.props.step).map(i =>
            <div key={`span-${i}`} className={this.props.theme.snap} />,
          )}
        </div>
      );
    }

    renderInput() {
      if (!this.props.editable) return undefined;
      return (
        <div style={{ display: 'flex' }}>
          <Input
            ref={(node) => { this.firstInputNode = node; }}
            className={this.props.theme.input}
            disabled={this.props.disabled}
            onFocus={() => this.handleInputFocus('first')}
            onChange={value => this.handleInputChange('first', value)}
            onBlur={event => this.handleInputBlur('first', event)}
            value={this.state.inputFocused.first
              ? this.state.inputValue.first
              : this.valueForInput(this.props.value.first)}
          />
          <Input
            ref={(node) => { this.secondInputNode = node; }}
            className={this.props.theme.input}
            disabled={this.props.disabled}
            onFocus={() => this.handleInputFocus('second')}
            onChange={value => this.handleInputChange('second', value)}
            onBlur={event => this.handleInputBlur('second', event)}
            value={this.state.inputFocused.second
              ? this.state.inputValue.second
              : this.valueForInput(this.props.value.second)}
          />
        </div>
      );
    }

    renderPinnedValue = (value) => {
      const intValue = parseInt(value, 10);
      return this.props.mapValueOnPin(intValue);
    }

    render() {
      const { theme } = this.props;
      const knobStyles = { left: `${this.knobOffset(this.props.value.first)}%` };
      const otherKnobStyles = { left: `${this.knobOffset(this.props.value.second)}%` };
      const className = classnames(theme.range, {
        [theme.editable]: this.props.editable,
        [theme.disabled]: this.props.disabled,
        [theme.pinned]: this.props.pinned,
        [theme.pressed]: this.state.pressed,
        [theme.ring]: this.props.value.first === this.props.value.second,
      }, this.props.className);

      return (
        <div
          className={className}
          disabled={this.props.disabled}
          data-react-toolbox="range"
          onBlur={this.handleRangeBlur}
          onFocus={this.handleRangeFocus}
          style={this.props.style}
          tabIndex="0"
        >
          <div
            ref={(node) => { this.rangeNode = node; }}
            className={theme.container}
            onMouseDown={(event) => { event.preventDefault(); event.stopPropagation(); }}
            onTouchStart={this.handleTouchStart}
          >
            <div
              ref={(node) => { this.minKnobNode = node; }}
              className={theme.knob}
              onMouseDown={(event) => { this.handleMouseDown('first', event); }}
              onTouchStart={this.handleTouchStart}
              style={knobStyles}
            >
              <div
                className={theme.innerknob}
                data-value={this.renderPinnedValue(this.props.value.first)}
              />
            </div>

            <div
              ref={(node) => { this.maxKnobNode = node; }}
              className={theme.knob}
              onMouseDown={(event) => { this.handleMouseDown('second', event); }}
              onTouchStart={this.handleTouchStart}
              style={otherKnobStyles}
            >
              <div
                className={theme.innerknob}
                data-value={this.renderPinnedValue(this.props.value.second)}
              />
            </div>

            <div className={theme.progress}>
              <ProgressBar
                disabled={this.props.disabled}
                ref={(node) => { this.progressbarNode = node; }}
                className={theme.innerprogress}
                theme={this.props.theme}
                max={this.props.max}
                min={this.props.min}
                mode="determinate"
                value={Math.min(this.props.value.first, this.props.value.second)}
                buffer={Math.max(this.props.value.first, this.props.value.second)}
              />
              {this.renderSnaps()}
            </div>
          </div>

          {this.renderInput()}
        </div>
      );
    }
  }

  return Range;
};

const Range = factory(InjectProgressBar, InjectInput);
export default themr(SLIDER)(Range);
export { factory as rangeFactory };
export { Range };
