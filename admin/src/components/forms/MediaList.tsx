import { useGetList } from 'react-admin';
import { useState } from 'react';
import {
  Box,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Typography,
  TextField,
  Pagination,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

const PER_PAGE = 24;

export function MediaList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const filter: Record<string, string> = {};
  if (search) {
    filter.originalFilename = search;
  }

  const { data, total, isLoading } = useGetList('media', {
    pagination: { page, perPage: PER_PAGE },
    sort: { field: 'createdAt', order: 'DESC' },
    filter,
  });

  const totalPages = total ? Math.ceil(total / PER_PAGE) : 0;
  const isImage = (mimeType?: string) => mimeType?.startsWith('image/');

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5">Media Library</Typography>
          <TextField
            size="small"
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : !data || data.length === 0 ? (
          <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
            No media found.
          </Typography>
        ) : (
          <ImageList cols={6} rowHeight={160} gap={8}>
            {data.map((media) => (
              <ImageListItem key={media.id}>
                {isImage(media.mimeType) ? (
                  <img
                    src={media.thumbnailUrl || media.url}
                    alt={media.altText ?? media.originalFilename ?? ''}
                    style={{ objectFit: 'contain', height: '100%', backgroundColor: '#f5f5f5' }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.100',
                    }}
                  >
                    <InsertDriveFileIcon sx={{ fontSize: 48, color: 'grey.500' }} />
                  </Box>
                )}
                <ImageListItemBar
                  title={media.originalFilename}
                  subtitle={media.mimeType}
                />
              </ImageListItem>
            ))}
          </ImageList>
        )}

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
