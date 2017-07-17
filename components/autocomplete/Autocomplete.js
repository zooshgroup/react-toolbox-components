/* eslint-disable */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import { themr } from 'react-css-themr';
import { AUTOCOMPLETE } from 'react-toolbox/src/components/identifiers';
import InjectChip from 'react-toolbox/lib/chip/Chip';
import InjectInput from 'react-toolbox/lib/input/Input';
import events from '../utils/events.js';

const POSITION = {
  AUTO: 'auto',
  DOWN: 'down',
  UP: 'up',
};

const factory = (Chip, Input) => {
  class Autocomplete extends Component {
    static propTypes = {
      allowCreate: PropTypes.bool,
      className: PropTypes.string,
      direction: PropTypes.oneOf(['auto', 'up', 'down']),
      disabled: PropTypes.bool,
      error: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.node,
      ]),
      idProperty: PropTypes.string,
      itemTemplate: PropTypes.func,
      keepFocusOnChange: PropTypes.bool,
      label: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.node,
      ]),
      multiple: PropTypes.bool,
      nameProperty: PropTypes.string,
      oneLiner: PropTypes.bool,
      onBlur: PropTypes.func,
      onChange: PropTypes.func,
      onFocus: PropTypes.func,
      onQueryChange: PropTypes.func,
      query: PropTypes.string,
      selectedPosition: PropTypes.oneOf(['above', 'below', 'none']),
      selectedTemplate: PropTypes.func,
      showSelectedWhenNotInSource: PropTypes.bool,
      showSuggestionsWhenValueIsSet: PropTypes.bool,
      source: PropTypes.any,
      suggestionMatch: PropTypes.oneOf(['disabled', 'start', 'anywhere', 'word', 'none']),
      theme: PropTypes.shape({
        active: PropTypes.string,
        autocomplete: PropTypes.string,
        focus: PropTypes.string,
        input: PropTypes.string,
        suggestion: PropTypes.string,
        suggestions: PropTypes.string,
        up: PropTypes.string,
        value: PropTypes.string,
        values: PropTypes.string,
      }),
      value: PropTypes.any,
    };

    static defaultProps = {
      allowCreate: false,
      className: '',
      direction: 'auto',
      idProperty: 'id',
      keepFocusOnChange: false,
      multiple: true,
      nameProperty: 'name',
      oneLiner: false,
      selectedPosition: 'above',
      showSelectedWhenNotInSource: false,
      showSuggestionsWhenValueIsSet: false,
      source: [],
      suggestionMatch: 'start',
    };

    state = {
      direction: this.props.direction,
      focus: false,
      showAllSuggestions: this.props.showSuggestionsWhenValueIsSet,
      query: this.initQuery(),
      isValueAnObject: false,
      source: [],
      selected: true,
    };

    initQuery(){
      if(this.props.query){
        return this.props.query;
      }
      if(!this.props.multiple && this.props.value){
        return this.query(this.props.value);
      }
      return '';
    }

    constructor(props){
      super(props);
      if(props.source){
        const map = new Map();
        props.source.map(item => map.set(item[this.props.idProperty], item));
        this.state.source = map;
      }
    }

    componentWillReceiveProps(nextProps) {
      if(nextProps.source){
        const map = new Map();
        nextProps.source.map(item => map.set(item[this.props.idProperty], item));
        this.setState({ source: map });
      }
      if (!this.props.multiple) {
        const query = nextProps.query ? nextProps.query : this.query(nextProps.value);
        this.updateQuery(query, false);
      }
    }

    shouldComponentUpdate(nextProps, nextState) {
      if (!this.state.focus && nextState.focus && this.props.direction === POSITION.AUTO) {
        const direction = this.calculateDirection();
        if (this.state.direction !== direction) {
          this.setState({ direction });
        }
      }
      return true;
    }

    handleChange = (values, event) => {
      const value = values;
      const { showSuggestionsWhenValueIsSet: showAllSuggestions } = this.props;
      const query = this.query(value);
      if (this.props.onChange) this.props.onChange(value, event);
      if (this.props.keepFocusOnChange) {
        this.setState({ query, showAllSuggestions });
      } else {
        this.setState({ focus: false, query, showAllSuggestions }, () => {
          ReactDOM.findDOMNode(this).querySelector('input').blur();
        });
      }
      this.updateQuery(query, this.props.query);
      if(!this.props.multiple) {
        this.setState({selected: true});
      }
    };

    handleMouseDown = (event) => {
      this.selectOrCreateActiveItem(event);
    };

    handleQueryBlur = (event) => {
      if (this.state.focus) this.setState({ focus: false });
      if (this.props.onBlur) this.props.onBlur(event, this.state.active);
    };

    updateQuery = (query, notify) => {
      if (notify && this.props.onQueryChange) this.props.onQueryChange(query);
      this.setState({ query });
    };

    handleQueryChange = (value) => {
      const query = this.clearQuery ? '' : value;
      this.clearQuery = false;

      this.updateQuery(query, true);
      this.setState({ showAllSuggestions: query ? false : this.props.showSuggestionsWhenValueIsSet, active: null, selected: false });
    };

    handleQueryFocus = (event) => {
      this.suggestionsNode.scrollTop = 0;
      this.setState({ active: '', focus: true });
      if (this.props.onFocus) this.props.onFocus(event);
    };

    handleQueryKeyDown = (event) => {
      // Mark query for clearing in handleQueryChange when pressing backspace and showing all suggestions.
      this.clearQuery = (
        event.which === 8
        && this.props.showSuggestionsWhenValueIsSet
        && this.state.showAllSuggestions
      );

      if (event.which === 13) {
        this.selectOrCreateActiveItem(event);
      }
    };

    handleQueryKeyUp = (event) => {
      if (event.which === 27) ReactDOM.findDOMNode(this).querySelector('input').blur();

      if ([40, 38].indexOf(event.which) !== -1) {
        const suggestionsKeys = [...this.suggestions().keys()];
        let index = suggestionsKeys.indexOf(this.state.active) + (event.which === 40 ? +1 : -1);
        if (index < 0) index = suggestionsKeys.length - 1;
        if (index >= suggestionsKeys.length) index = 0;
        this.setState({ active: suggestionsKeys[index] });
      }
    };

    handleSuggestionHover = (event, key) => {
      this.setState({ active: key });
    };

    calculateDirection() {
      if (this.props.direction === 'auto') {
        const client = ReactDOM.findDOMNode(this.inputNode).getBoundingClientRect();
        const screen_height = window.innerHeight || document.documentElement.offsetHeight;
        const up = client.top > ((screen_height / 2) + client.height);
        return up ? 'up' : 'down';
      }
      return this.props.direction;
    }

    query(key) {
      let query_value = '';
      if (!this.props.multiple && key) {
        const source_value = this.source().get(`${key}`);
        if(source_value){
          query_value = source_value[this.props.idProperty];
        }
        else {
          query_value = key;
        }
      }
      return query_value;
    }

    selectOrCreateActiveItem(event) {
      let target = this.state.active;
      if (!target) {
        target = this.props.allowCreate
          ? this.state.query
          : [...this.suggestions().keys()][0];
        this.setState({ active: target });
      }
      this.select(event, target);
    }

    normalise(value) {
      const sdiak = 'áâäąáâäąččććççĉĉďđďđééěëēėęéěëēėęĝĝğğġġģģĥĥħħíîíîĩĩīīĭĭįįi̇ıĵĵķķĸĺĺļļŀŀłłĺľĺľňńņŋŋņňńŉóöôőøōōóöőôøřřŕŕŗŗššśśŝŝşşţţťťŧŧũũūūŭŭůůűűúüúüűųųŵŵýyŷŷýyžžźźżżß';
      const bdiak = 'AAAAAAAACCCCCCCCDDDDEEEEEEEEEEEEEGGGGGGGGHHHHIIIIIIIIIIIIIIJJKKKLLLLLLLLLLLLNNNNNNNNNOOOOOOOOOOOORRRRRRSSSSSSSSTTTTTTUUUUUUUUUUUUUUUUUWWYYYYYYZZZZZZS';

      let normalised = '';
      for (let p = 0; p < value.length; p++) {
        if (sdiak.indexOf(value.charAt(p)) !== -1) {
          normalised += bdiak.charAt(sdiak.indexOf(value.charAt(p)));
        } else {
          normalised += value.charAt(p);
        }
      }

      return normalised.toLowerCase().trim();
    }

    suggestions() {
      let suggest = new Map();
      const rawQuery = this.state.query || (this.props.multiple ? '' : this.props.value);
      const query = this.normalise((`${rawQuery}`));
      const values = this.values();
      const source = this.source();

      // Suggest any non-set value which matches the query
      if (this.props.multiple) {
        for (const [key, value] of source) {
          if (!values.has(key) && this.matches(this.normalise(value[this.props.nameProperty]), query)) {
            suggest.set(key, value);
          }
        }

        // When multiple is false, suggest any value which matches the query if showAllSuggestions is false
      } else if (query && !this.state.showAllSuggestions) {
        for (const [key, value] of source) {
          if (this.matches(this.normalise(value[this.props.nameProperty]), query)) {
            suggest.set(key, value);
          }
        }

        // When multiple is false, suggest all values when showAllSuggestions is true
      } else {
        suggest = source;
      }

      return suggest;
    }

    matches(value, query) {
      const { suggestionMatch } = this.props;

      if (suggestionMatch === 'disabled') {
        return true;
      } else if (suggestionMatch === 'start') {
        return value.startsWith(query);
      } else if (suggestionMatch === 'anywhere') {
        return value.includes(query);
      } else if (suggestionMatch === 'word') {
        const re = new RegExp(`\\b${query}`, 'g');
        return re.test(value);
      }else if(suggestionMatch === 'none'){
        return value
      }

      return false;
    }

    source() {
      if (!this.state || !this.state.source) {
        return new Map();
      }
      return this.state.source;
    }

    values() {
      let vals = this.props.multiple ? this.props.value : [this.props.value];
      if (!vals) vals = [];

      if (this.props.showSelectedWhenNotInSource && this.isValueAnObject()) {
        return new Map(Object.entries(vals));
      }

      const valueMap = new Map();

      const stringVals = vals.map(v => `${v}`);
      for (const [k, v] of this.source()) {
        if (stringVals.indexOf(k.toString()) !== -1) valueMap.set(k, v);
      }
      return valueMap;
    }

    select = (event, target) => {
      events.pauseEvent(event);
      const values = this.values(this.props.value);
      const source = this.source();
      const newValue = target === void 0 ? event.target[this.props.idProperty] : target;
      if(!this.props.multiple){
        return this.handleChange(newValue);
      }
      if (this.isValueAnObject()) {
        const newItem = Array.from(source).reduce((obj, [k, value]) => {
          if (k === newValue) {
            obj[k] = value;
          }
          return obj;
        }, {});

        if (Object.keys(newItem).length === 0 && newValue) {
          newItem[newValue] = newValue;
        }

        return this.handleChange(Object.assign(this.mapToObject(values), newItem), event);
      }
      return this.handleChange([newValue, ...values.keys()], event);
    };

    unselect(key, event) {
      if (!this.props.disabled) {
        const values = this.values(this.props.value);

        values.delete(key);

        if (this.isValueAnObject()) {
          return this.handleChange(this.mapToObject(values), event);
        }

        this.handleChange([...values.keys()], event);
      }
    }

    isValueAnObject() {
      return !Array.isArray(this.props.value) && typeof this.props.value === 'object';
    }

    mapToObject(map) {
      return Array.from(map).reduce((obj, [k, value]) => {
        obj[k] = value;
        return obj;
      }, {});
    }

    renderSelected() {
      if (this.props.multiple) {
        const selectedItems = [...this.values()].map(([key, value]) =>
          this.props.selectedTemplate ?
            this.props.selectedTemplate(value, this.unselect.bind(this, key)) : (
            <Chip
              key={key}
              className={this.props.theme.value}
              deletable
              onDeleteClick={this.unselect.bind(this, key)}
            >
              {value[this.props.nameProperty]}
            </Chip>
          ));

        return <div className={this.props.theme.values}>{selectedItems}</div>;
      }
    }

    renderSuggestion(value){
      if(this.props.itemTemplate){
        return this.props.itemTemplate(value);
      }
      return value[this.props.nameProperty];
    }

    renderSuggestions() {
      const { theme } = this.props;
      const suggestions = [...this.suggestions()].map(([key, value]) => {
        const className = classnames(theme.suggestion, { [theme.active]: this.state.active === key });
        return (
          <li
            id={key}
            key={key}
            className={className}
            onMouseDown={this.handleMouseDown}
            onMouseOver={(event) => this.handleSuggestionHover(event, key)}
          >
            {this.renderSuggestion(value)}
          </li>
        );
      });

      return (
        <ul
          className={classnames(theme.suggestions, { [theme.up]: this.state.direction === 'up' })}
          ref={(node) => { this.suggestionsNode = node; }}
        >
          {suggestions}
        </ul>
      );
    }

    getInputValue = () => {
      if(this.state.selected && !this.props.multiple){
        if(this.state.query) {
          return this.state.source.get(this.state.query)[this.props.nameProperty];
        }
        return '';
      }
      return this.state.query;
    };

    render() {
      const {
        allowCreate, error, label, source, suggestionMatch, query, selectedTemplate, itemTemplate, idProperty, nameProperty, // eslint-disable-line no-unused-vars
        selectedPosition, keepFocusOnChange, showSuggestionsWhenValueIsSet, showSelectedWhenNotInSource, onQueryChange,   // eslint-disable-line no-unused-vars
        theme, ...other
      } = this.props;
      const className = classnames(theme.autocomplete, {
        [theme.focus]: this.state.focus,
        [theme.oneLiner]: this.props.oneLiner,
      }, this.props.className);

      return (
        <div data-react-toolbox="autocomplete" className={className}>
          {this.props.selectedPosition === 'above' ? this.renderSelected() : null}
          <Input
            {...other}
            ref={(node) => { this.inputNode = node; }}
            autoComplete="off"
            className={theme.input}
            error={error}
            label={label}
            onBlur={this.handleQueryBlur}
            onChange={this.handleQueryChange}
            onFocus={this.handleQueryFocus}
            onKeyDown={this.handleQueryKeyDown}
            onKeyUp={this.handleQueryKeyUp}
            theme={theme}
            themeNamespace="input"
            value={this.getInputValue()}
          />
          {this.renderSuggestions()}
          {this.props.selectedPosition === 'below' ? this.renderSelected() : null}
        </div>
      );
    }
  }

  return Autocomplete;
};

const Autocomplete = factory(InjectChip, InjectInput);
export default themr(AUTOCOMPLETE, null, { withRef: true })(Autocomplete);
export { factory as autocompleteFactory };
export { Autocomplete };
