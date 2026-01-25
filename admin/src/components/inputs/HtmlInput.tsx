import { lazy, Suspense } from 'react';
import { CircularProgress, Box } from '@mui/material';
import type { RichTextInputProps } from 'ra-input-rich-text';

const RichTextInput = lazy(() =>
  import('ra-input-rich-text').then((module) => ({
    default: module.RichTextInput,
  }))
);

interface HtmlInputProps extends Omit<RichTextInputProps, 'source'> {
  source: string;
  label?: string;
  helperText?: string;
}

/**
 * HTML WYSIWYG input component using TipTap via ra-input-rich-text.
 * Lazy-loaded to reduce initial bundle size (~120kB).
 * Provides common formatting options (bold, italic, links, lists).
 */
export function HtmlInput({ source, label, helperText, ...props }: HtmlInputProps) {
  return (
    <Suspense
      fallback={
        <Box display="flex" alignItems="center" justifyContent="center" minHeight={200}>
          <CircularProgress size={24} />
        </Box>
      }
    >
      <RichTextInput source={source} label={label} helperText={helperText} {...props} />
    </Suspense>
  );
}
