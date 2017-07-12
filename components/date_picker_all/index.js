import { themr } from 'react-css-themr';
import { IconButton, Input, Dialog } from 'react-toolbox';
import { DATE_PICKER, DIALOG } from 'react-toolbox/src/components/identifiers';
import { datePickerFactory } from './DatePicker';
import datePickerDialogFactory from './DatePickerDialog';
import calendarFactory from './Calendar';

import theme from './theme.css';

const Calendar = calendarFactory(IconButton);
const DatePickerDialog = datePickerDialogFactory(Dialog, Calendar);
const DatePicker = datePickerFactory(Input, DatePickerDialog);

const ThemedDatePicker = themr(DATE_PICKER, theme)(DatePicker);
export default ThemedDatePicker;
export { ThemedDatePicker as DatePickerAll };

const ThemedDatePickerDialog = themr(DIALOG, theme)(DatePickerDialog);
export { ThemedDatePickerDialog as DatePickerDialogAll };
