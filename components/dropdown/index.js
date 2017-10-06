import { themr } from 'react-css-themr';
import { DROPDOWN } from 'react-toolbox/lib/identifiers';
import { Input } from 'react-toolbox/lib/input';
import { dropdownFactory } from './Dropdown';
import theme from './theme.css';

const Dropdown = dropdownFactory(Input);
const ThemedDropdown = themr(DROPDOWN, theme)(Dropdown);

export default ThemedDropdown;
export { ThemedDropdown as Dropdown };
