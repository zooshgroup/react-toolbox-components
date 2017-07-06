import { themr } from 'react-css-themr';
import { Input, ProgressBar } from 'react-toolbox';
import { SLIDER } from 'react-toolbox/lib/identifiers';
import { rangeFactory } from './Range';
import theme from './theme.css';

const ThemedRange = themr(SLIDER, theme)(rangeFactory(ProgressBar, Input));
export default ThemedRange;
export { ThemedRange as Range };
