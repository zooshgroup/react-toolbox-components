import React from 'react';
import Autocomplete from '../../components/autocomplete';
import {Avatar, Chip} from "react-toolbox";

const source = [
  {id:1, name:'England', code:'GB'},
  {id:2, name:'Finland', code:'FI'},
  {id:3, name:'Hungary', code:'HU'},
  {id:4, name:'Germany', code:'DE'},
  {id:5, name:'Switzerland', code:'CH'}
];

const source2 = [
  {name:'England', code:'GB'},
  {name:'Finland', code:'FI'},
  {name:'Hungary', code:'HU'},
  {name:'Germany', code:'DE'},
  {name:'Switzerland', code:'CH'}
];

class AutocompleteTest extends React.Component {
  state = { values: [], singleValue: 'HU', singleValue2: '', };

  handleChange = (value, field) => {
    this.setState({[field]: value});
  };

  selectedTemplate(item, callback){
    return (
      <Chip
        key={item.id}
        deletable
        onDeleteClick={callback}
      >
        <Avatar cover><img src={`http://www.geognos.com/api/en/countries/flag/${item.code}.png`}/></Avatar>
        <span>{item.name}</span>
      </Chip>
    )
  }

  itemTemplate(item){
    return (
      <div>
        <img  src={`http://www.geognos.com/api/en/countries/flag/${item.code}.png`} height="12"/>
        <span style={{margin:'10px'}}>{item.name}</span>
      </div>
    )
  }

  render() {
    return (
      <section id="Autocomplete">
        <h5>Autocomplete</h5>
        <p>Multi select</p>
        <Autocomplete
          direction="down"
          selectedPosition="above"
          label="Choose countries"
          onChange={(value) => this.handleChange(value, 'values')}
          source={source}
          value={this.state.values}
          selectedTemplate={this.selectedTemplate}
          itemTemplate={this.itemTemplate}
        />
        <p>Multi select with singleLine</p>
        <Autocomplete
          direction="down"
          selectedPosition="above"
          onChange={(value) => this.handleChange(value, 'lineValues')}
          source={source}
          value={this.state.lineValues}
          selectedTemplate={this.selectedTemplate}
          itemTemplate={this.itemTemplate}
          singleLine
          label="Choose countries"
          logger
        />
        <p>Single select</p>
        <Autocomplete
          suggestionMatch="anywhere"
          showSuggestionsWhenValueIsSet
          direction="down"
          onChange={(value) => this.handleChange(value, 'singleValue')}
          label="Select a country"
          source={source2}
          idProperty="code"
          value={this.state.singleValue}
          multiple={false}
        />
        <p>Single select with selectedTemplate and singleLine</p>
        <Autocomplete
          suggestionMatch="anywhere"
          showSuggestionsWhenValueIsSet
          direction="down"
          onChange={(value) => this.handleChange(value, 'singleValue2')}
          source={source2}
          idProperty="code"
          value={this.state.singleValue2}
          selectedTemplate={this.selectedTemplate}
          multiple={false}
          singleLine
          label="Choose country"
        />
      </section>
    );
  }
}

export default AutocompleteTest;
