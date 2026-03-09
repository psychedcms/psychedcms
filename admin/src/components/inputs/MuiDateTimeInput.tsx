import { useInput, type InputProps } from 'react-admin';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import dayjs, { type Dayjs } from 'dayjs';

interface MuiDateTimeInputProps extends Omit<InputProps, 'source'> {
  source: string;
  label?: string;
  helperText?: string;
  isRequired?: boolean;
  readOnly?: boolean;
}

export function MuiDateTimeInput({
  source,
  label,
  helperText,
  isRequired,
  readOnly,
  ...props
}: MuiDateTimeInputProps) {
  const {
    field,
    fieldState: { error },
  } = useInput({ source, ...props });

  const value = field.value ? dayjs(field.value) : null;

  const handleChange = (newValue: Dayjs | null) => {
    field.onChange(newValue ? newValue.toISOString() : null);
  };

  return (
    <DateTimePicker
      label={label}
      value={value}
      onChange={handleChange}
      readOnly={readOnly}
      viewRenderers={{
        hours: renderTimeViewClock,
        minutes: renderTimeViewClock,
        seconds: renderTimeViewClock,
      }}
      slotProps={{
        textField: {
          size: 'small',
          fullWidth: true,
          required: isRequired,
          error: !!error,
          helperText: error?.message ?? helperText,
        },
      }}
    />
  );
}
