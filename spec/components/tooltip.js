import React from 'react';
import { Tooltip } from '../../components';
import { Button, Card } from 'react-toolbox';

class Asd extends React.Component {
  render() {
    return (
      <div>
        <h1>Hello</h1>
        <h2>{this.props.tooltip.name}</h2>
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
      <section style={{display: 'flex', flexDirection: 'row'}}>
        <TooltipDiv style={{ padding: '2em', width: '10em', marginRight: '5em' }} tooltip="NORMAL TEXT TOOLTIP">NORMAL</TooltipDiv>
        <TooltipDiv style={{ padding: '2em', width: '10em' }} tooltip={{name: 'world'}} tooltipTemplate={Asd} >TEMPLATED</TooltipDiv>
      </section>
    );
  }
}

export default TooltipTest;
