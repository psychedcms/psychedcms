import { useState, useEffect, useCallback } from 'react';
import { useInput, type InputProps } from 'react-admin';
import { useWatch, useFormContext } from 'react-hook-form';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Lock, LockOpen } from '@mui/icons-material';
import slugify from 'slugify';

interface SlugInputProps extends Omit<InputProps, 'source'> {
  source: string;
  uses: string | string[];
  label?: string;
  helperText?: string;
}

/**
 * Slug input component with auto-generation from source field(s).
 * Watches the field(s) specified in `uses` prop and generates a slug.
 * Lock toggle allows manual override (locked = no auto-generation).
 * Initializes locked=true for existing records, locked=false for new records.
 */
export function SlugInput({ source, uses, label = 'Slug', helperText, ...props }: SlugInputProps) {
  const {
    field: { value, onChange, onBlur },
    fieldState: { error },
    isRequired,
  } = useInput({ source, ...props });

  const { getValues } = useFormContext();

  const sourceFields = Array.isArray(uses) ? uses : [uses];
  const sourceValues = useWatch({ name: sourceFields });

  const hasExistingValue = Boolean(getValues(source));
  const [isLocked, setIsLocked] = useState(hasExistingValue);
  const [hasBeenManuallyEdited, setHasBeenManuallyEdited] = useState(false);

  const generateSlug = useCallback((values: unknown[]): string => {
    const combined = values
      .filter((v): v is string => typeof v === 'string' && v.length > 0)
      .join(' ');

    if (!combined) return '';

    return slugify(combined, {
      lower: true,
      strict: true,
      trim: true,
    });
  }, []);

  useEffect(() => {
    if (isLocked || hasBeenManuallyEdited) return;

    const valuesArray = Array.isArray(sourceValues) ? sourceValues : [sourceValues];
    const newSlug = generateSlug(valuesArray);

    if (newSlug && newSlug !== value) {
      onChange(newSlug);
    }
  }, [sourceValues, isLocked, hasBeenManuallyEdited, generateSlug, onChange, value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setHasBeenManuallyEdited(true);
    setIsLocked(true);
    onChange(
      slugify(newValue, {
        lower: true,
        strict: true,
        trim: false,
      })
    );
  };

  const toggleLock = () => {
    const newLocked = !isLocked;
    setIsLocked(newLocked);

    if (!newLocked) {
      setHasBeenManuallyEdited(false);
      const valuesArray = Array.isArray(sourceValues) ? sourceValues : [sourceValues];
      const newSlug = generateSlug(valuesArray);
      if (newSlug) {
        onChange(newSlug);
      }
    }
  };

  return (
    <TextField
      value={value || ''}
      onChange={handleChange}
      onBlur={onBlur}
      label={label}
      helperText={error?.message || helperText}
      error={Boolean(error)}
      required={isRequired}
      fullWidth
      margin="dense"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={toggleLock}
              edge="end"
              size="small"
              aria-label={isLocked ? 'Unlock slug auto-generation' : 'Lock slug'}
              title={isLocked ? 'Unlock to enable auto-generation' : 'Lock to prevent auto-generation'}
            >
              {isLocked ? <Lock /> : <LockOpen />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}
