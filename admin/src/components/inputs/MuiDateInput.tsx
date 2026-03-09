import { useInput, type InputProps } from 'react-admin';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';

interface MuiDateInputProps extends Omit<InputProps, 'source'> {
  source: string;
  label?: string;
  helperText?: string;
  isRequired?: boolean;
  readOnly?: boolean;
}

export function MuiDateInput({
  source,
  label,
  helperText,
  isRequired,
  readOnly,
  ...props
}: MuiDateInputProps) {
  const {
    field,
    fieldState: { error },
  } = useInput({ source, ...props });

  const value = field.value ? dayjs(field.value) : null;

  const handleChange = (newValue: Dayjs | null) => {
    field.onChange(newValue ? newValue.format('YYYY-MM-DD') : null);
  };

  return (
    <DatePicker
      label={label}
      value={value}
      onChange={handleChange}
      readOnly={readOnly}
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
