import { themr } from 'react-css-themr';
import { AUTOCOMPLETE } from 'react-toolbox/src/components/identifiers';
import { Chip } from 'react-toolbox/lib/chip';
import { Input } from 'react-toolbox/lib/input';
import { autocompleteFactory } from './Autocomplete';
import theme from './theme.css';

const Autocomplete = autocompleteFactory(Chip, Input);
const ThemedAutocomplete = themr(AUTOCOMPLETE, theme, { withRef: true })(Autocomplete);

export default ThemedAutocomplete;
export { ThemedAutocomplete as Autocomplete };
