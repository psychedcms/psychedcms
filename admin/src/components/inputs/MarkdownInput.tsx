import { useCallback } from 'react';
import { CircularProgress, Box } from '@mui/material';
import { useInput, type InputProps } from 'react-admin';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Markdown } from 'tiptap-markdown';

interface MarkdownInputProps extends Omit<InputProps, 'source'> {
  source: string;
  label?: string;
  helperText?: string;
}

/**
 * Markdown WYSIWYG input component using TipTap with markdown extension.
 * Parses markdown on load, exports markdown on save.
 * Provides inline formatting (not split-pane preview).
 */
export function MarkdownInput({ source, label, helperText, ...props }: MarkdownInputProps) {
  const {
    field: { value, onChange },
    fieldState: { error },
    isRequired,
  } = useInput({ source, ...props });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.extend({
        name: 'link',
      }).configure({
        openOnClick: false,
        autolink: true,
      }),
      Markdown.configure({
        html: false,
        linkify: false,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const markdown = editor.storage.markdown.getMarkdown();
      onChange(markdown);
    },
  });

  if (!editor) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight={200}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 2 }}>
      {label && (
        <Box
          component="label"
          sx={{
            display: 'block',
            mb: 0.5,
            fontSize: '0.75rem',
            color: error ? 'error.main' : 'text.secondary',
          }}
        >
          {label}
          {isRequired && ' *'}
        </Box>
      )}
      <Box
        sx={{
          border: 1,
          borderColor: error ? 'error.main' : 'grey.400',
          borderRadius: 1,
          '&:focus-within': {
            borderColor: error ? 'error.main' : 'primary.main',
            borderWidth: 2,
          },
          '& .tiptap': {
            minHeight: 200,
            padding: 2,
            outline: 'none',
            '& p': {
              margin: 0,
              marginBottom: 1,
            },
            '& h1, & h2, & h3': {
              marginTop: 2,
              marginBottom: 1,
            },
            '& ul, & ol': {
              paddingLeft: 3,
            },
            '& a': {
              color: 'primary.main',
              textDecoration: 'underline',
            },
          },
        }}
      >
        <MarkdownToolbar editor={editor} />
        <EditorContent editor={editor} />
      </Box>
      {helperText && (
        <Box
          sx={{
            mt: 0.5,
            fontSize: '0.75rem',
            color: 'text.secondary',
          }}
        >
          {helperText}
        </Box>
      )}
      {error && (
        <Box
          sx={{
            mt: 0.5,
            fontSize: '0.75rem',
            color: 'error.main',
          }}
        >
          {error.message}
        </Box>
      )}
    </Box>
  );
}

interface MarkdownToolbarProps {
  editor: Editor;
}

function MarkdownToolbar({ editor }: MarkdownToolbarProps) {
  const toggleBold = useCallback(() => {
    editor.chain().focus().toggleBold().run();
  }, [editor]);

  const toggleItalic = useCallback(() => {
    editor.chain().focus().toggleItalic().run();
  }, [editor]);

  const toggleHeading = useCallback(
    (level: 1 | 2 | 3) => {
      editor.chain().focus().toggleHeading({ level }).run();
    },
    [editor]
  );

  const toggleBulletList = useCallback(() => {
    editor.chain().focus().toggleBulletList().run();
  }, [editor]);

  const toggleOrderedList = useCallback(() => {
    editor.chain().focus().toggleOrderedList().run();
  }, [editor]);

  const setLink = useCallback(() => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 0.5,
        p: 1,
        borderBottom: 1,
        borderColor: 'grey.300',
        bgcolor: 'grey.50',
      }}
    >
      <ToolbarButton
        onClick={toggleBold}
        isActive={editor.isActive('bold')}
        title="Bold"
      >
        B
      </ToolbarButton>
      <ToolbarButton
        onClick={toggleItalic}
        isActive={editor.isActive('italic')}
        title="Italic"
      >
        I
      </ToolbarButton>
      <ToolbarButton
        onClick={() => toggleHeading(1)}
        isActive={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
      >
        H1
      </ToolbarButton>
      <ToolbarButton
        onClick={() => toggleHeading(2)}
        isActive={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        onClick={() => toggleHeading(3)}
        isActive={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
      >
        H3
      </ToolbarButton>
      <ToolbarButton
        onClick={toggleBulletList}
        isActive={editor.isActive('bulletList')}
        title="Bullet List"
      >
        UL
      </ToolbarButton>
      <ToolbarButton
        onClick={toggleOrderedList}
        isActive={editor.isActive('orderedList')}
        title="Numbered List"
      >
        OL
      </ToolbarButton>
      <ToolbarButton
        onClick={setLink}
        isActive={editor.isActive('link')}
        title="Link"
      >
        Link
      </ToolbarButton>
    </Box>
  );
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, isActive, title, children }: ToolbarButtonProps) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      title={title}
      sx={{
        px: 1,
        py: 0.5,
        border: 1,
        borderColor: isActive ? 'primary.main' : 'grey.300',
        borderRadius: 0.5,
        bgcolor: isActive ? 'primary.light' : 'white',
        color: isActive ? 'primary.contrastText' : 'text.primary',
        cursor: 'pointer',
        fontSize: '0.75rem',
        fontWeight: isActive ? 'bold' : 'normal',
        '&:hover': {
          bgcolor: isActive ? 'primary.main' : 'grey.100',
        },
      }}
    >
      {children}
    </Box>
  );
}
