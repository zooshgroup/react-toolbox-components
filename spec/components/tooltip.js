import React from 'react';
import Tooltip from '../../components/tooltip';
import { Button, Card } from 'react-toolbox';

class Asd extends React.Component {
  render() {
    return (
      <div
        style={{
          backgroundColor: 'white',
          border: '1px solid black',
          fontSize: '2em',
          lineHeight: '1.5',
          padding: '1em'
        }}
      >
        STYLED TOOLTIP
      </div>
    )
  }
}



// const TooltipDiv = Tooltip(Button);
const TooltipDiv = Tooltip(Card);

class TooltipTest extends React.Component {

  renderTooltip = () => {
    return <Asd />;
  }

  render() {
    return (
      <section>
        <TooltipDiv tooltip="NORMAL TEXT TOOLTIP">NORMAL TEXT</TooltipDiv>
        <TooltipDiv tooltip={Asd} >STYLED</TooltipDiv>
      </section>
    );
  }
}

export default TooltipTest;
