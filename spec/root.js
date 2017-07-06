/* global VERSION */
import 'normalize.css';
import React, { Component } from 'react';

import { Layout, Panel, NavDrawer } from 'react-toolbox/lib/layout';
import { AppBar } from 'react-toolbox';
import ButtonToolbox from 'react-toolbox/lib/button';

import Range from './components/range';
import style from './style.css';

class Root extends Component {
  state = { pinned: false };

  handleSideBarToggle = () => {
    this.setState({ pinned: !this.state.pinned });
  };

  render() {
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
        </Panel>
      </Layout>
    );
  }
}

export default Root;
