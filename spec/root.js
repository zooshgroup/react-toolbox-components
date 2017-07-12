/* global VERSION */
import 'normalize.css';
import React, { Component } from 'react';

import { Layout, Panel, NavDrawer } from 'react-toolbox/lib/layout';
import {AppBar, Avatar, Chip} from 'react-toolbox';
import ButtonToolbox from 'react-toolbox/lib/button';

import Autocomplete from './components/autocomplete';
import DatePickerAll from './components/date_picker_all';
import Range from './components/range';
import style from './style.css';

const source = [
  {id:1, name:'England', flag:'GB'},
  {id:2, name:'Finland', flag:'FI'},
  {id:3, name:'Hungary', flag:'HU'},
  {id:4, name:'Germany', flag:'DE'},
  {id:5, name:'Switzerland', flag:'CH'}
];

class Root extends Component {
  state = { pinned: false, values: [] };

  render() {
    console.log(this.state.values);
    return (
      <Layout>
        <AppBar
          title={`React Toolbox Spec ${VERSION}`}
          onLeftIconClick={this.handleSideBarToggle}
          className={style.appbar}
          leftIcon="menu"
          fixed
          flat
        >
          <ButtonToolbox
            className={style.github}
            href="http://react-toolbox.com/#/"
            target="_blank"
            icon="web"
            floating
            accent
          />
        </AppBar>

        <NavDrawer
          active={this.state.pinned}
          onEscKeyDown={this.handleSideBarToggle}
          onOverlayClick={this.handleSideBarToggle}
          permanentAt="lg"
        >
          This will content filter and indexes for examples
        </NavDrawer>

        <Panel className={style.app}>
          <Range />
          <Autocomplete />
          <DatePickerAll />
        </Panel>
      </Layout>
    );
  }
}

export default Root;
