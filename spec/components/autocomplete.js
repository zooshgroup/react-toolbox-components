import React from 'react';
import Autocomplete from '../../components/autocomplete';
import {Avatar, Chip} from "react-toolbox";

const source = [
  {id:1, name:'England', flag:'GB'},
  {id:2, name:'Finland', flag:'FI'},
  {id:3, name:'Hungary', flag:'HU'},
  {id:4, name:'Germany', flag:'DE'},
  {id:5, name:'Switzerland', flag:'CH'}
];

class AutocompleteTest extends React.Component {
    state = { values: [] };

    handleChange = (value) => {
      this.setState({values: value});
    };

    selectedTemplate(item, callback){
      return (
        <Chip
          key={item.id}
          deletable
          onDeleteClick={callback}
        >
          <Avatar cover><img src={`http://www.geognos.com/api/en/countries/flag/${item.flag}.png`}/></Avatar>
          <span>{item.name}</span>
        </Chip>
      )
    }

    itemTemplate(item){
      return (
        <div>
          <img  src={`http://www.geognos.com/api/en/countries/flag/${item.flag}.png`} height="12"/>
          <span style={{margin:'10px'}}>{item.name}</span>
        </div>
      )
    }

  render() {
    return (
      <section id="Autocomplete">
        <h5>Autocomplete</h5>
        <Autocomplete
          direction="down"
          selectedPosition="above"
          label="Choose countries"
          onChange={this.handleChange}
          source={source}
          value={this.state.values}
          selectedTemplate={this.selectedTemplate}
          itemTemplate={this.itemTemplate}
        />
      </section>
    );
  }
}

export default AutocompleteTest;
