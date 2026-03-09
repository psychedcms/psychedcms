import { useState, useCallback } from 'react';
import {
  useGetList,
  useUpdate,
  useDelete,
  useNotify,
  useRefresh,
  useRedirect,
  TopToolbar,
  CreateButton,
} from 'react-admin';
import type { RaRecord } from 'react-admin';
import {
  Typography,
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Tooltip,
  Card,
  CardActionArea,
  CardContent,
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LabelIcon from '@mui/icons-material/Label';
import CategoryIcon from '@mui/icons-material/Category';
import { useTaxonomyTypes } from '../../hooks/useTaxonomyTypes.ts';

// ─── Shared tree helpers ───────────────────────────────────────────────

interface TreeRow {
  record: RaRecord;
  depth: number;
  parentId: string | null;
}

function buildTreeRows(data: RaRecord[]): TreeRow[] {
  const childrenByParent = new Map<string, RaRecord[]>();
  for (const item of data) {
    if (item.parent) {
      const key = item.parent as string;
      const list = childrenByParent.get(key) ?? [];
      list.push(item);
      childrenByParent.set(key, list);
    }
  }

  const idSet = new Set(data.map((r) => r['@id'] ?? r.id));
  const roots = data.filter((r) => !r.parent || !idSet.has(r.parent as string));

  const rows: TreeRow[] = [];
  function walk(items: RaRecord[], depth: number, parentId: string | null) {
    for (const item of items) {
      rows.push({ record: item, depth, parentId });
      const kids = childrenByParent.get(item['@id'] ?? item.id) ?? [];
      if (kids.length > 0) {
        walk(kids, depth + 1, (item['@id'] ?? item.id) as string);
      }
    }
  }
  walk(roots, 0, null);
  return rows;
}

function getSiblings(rows: TreeRow[], row: TreeRow): TreeRow[] {
  return rows.filter((r) => r.parentId === row.parentId);
}

// ─── Selection state ───────────────────────────────────────────────────

type SelectedTaxonomy =
  | { kind: 'entity'; resource: string; label: string }
  | { kind: 'generic'; type: string; label: string };

// ─── Categories index ──────────────────────────────────────────────────

function TaxonomyCard({ entry, onSelect }: { entry: SelectedTaxonomy; onSelect: (t: SelectedTaxonomy) => void }) {
  return (
    <Card key={entry.kind === 'entity' ? entry.resource : entry.type} variant="outlined">
      <CardActionArea onClick={() => onSelect(entry)}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {entry.kind === 'entity' ? (
            <CategoryIcon color="primary" />
          ) : (
            <LabelIcon color="action" />
          )}
          <Typography variant="subtitle1" fontWeight={500}>
            {entry.label}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function CategoriesIndex({ onSelect }: { onSelect: (t: SelectedTaxonomy) => void }) {
  const { generic, entity } = useTaxonomyTypes();

  const tags: SelectedTaxonomy[] = generic.map((t) => ({ kind: 'generic', type: t.type, label: t.label }));
  const categories: SelectedTaxonomy[] = entity.map((t) => ({ kind: 'entity', resource: t.resource, label: t.label }));

  const isEmpty = tags.length === 0 && categories.length === 0;

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>
        Taxonomies
      </Typography>
      {isEmpty && (
        <Typography variant="body2" color="text.secondary">
          No taxonomy types configured.
        </Typography>
      )}

      {tags.length > 0 && (
        <Box mb={3}>
          <Typography variant="overline" color="text.secondary" gutterBottom display="block">
            Tags
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 2 }}>
            {tags.map((entry) => (
              <TaxonomyCard key={entry.kind === 'generic' ? entry.type : entry.resource} entry={entry} onSelect={onSelect} />
            ))}
          </Box>
        </Box>
      )}

      {categories.length > 0 && (
        <Box mb={3}>
          <Typography variant="overline" color="text.secondary" gutterBottom display="block">
            Categories
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 2 }}>
            {categories.map((entry) => (
              <TaxonomyCard key={entry.kind === 'entity' ? entry.resource : entry.type} entry={entry} onSelect={onSelect} />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

// ─── Reorder buttons ───────────────────────────────────────────────────

function useReorder(resource: string) {
  const [update] = useUpdate();
  const notify = useNotify();
  const refresh = useRefresh();

  const reorder = useCallback(
    async (rows: TreeRow[], movingRow: TreeRow, direction: 'up' | 'down') => {
      const siblings = getSiblings(rows, movingRow);
      const idx = siblings.findIndex((s) => (s.record['@id'] ?? s.record.id) === (movingRow.record['@id'] ?? movingRow.record.id));
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= siblings.length) return;

      // Assign sequential positions to all siblings so order is deterministic
      const reordered = [...siblings];
      reordered.splice(idx, 1);
      reordered.splice(targetIdx, 0, siblings[idx]);

      try {
        for (let i = 0; i < reordered.length; i++) {
          const rec = reordered[i].record;
          if ((rec.taxonomyTermPosition as number ?? 0) !== i) {
            await update(resource, { id: rec.id, data: { taxonomyTermPosition: i }, previousData: rec }, { mutationMode: 'pessimistic' });
          }
        }
        refresh();
      } catch {
        notify('Error reordering', { type: 'error' });
      }
    },
    [update, resource, notify, refresh],
  );

  return reorder;
}

function ReorderButtons({
  rows,
  row,
  onReorder,
}: {
  rows: TreeRow[];
  row: TreeRow;
  onReorder: (rows: TreeRow[], row: TreeRow, direction: 'up' | 'down') => void;
}) {
  const siblings = getSiblings(rows, row);
  const idx = siblings.findIndex((s) => (s.record['@id'] ?? s.record.id) === (row.record['@id'] ?? row.record.id));
  const canUp = idx > 0;
  const canDown = idx < siblings.length - 1;

  return (
    <>
      <Tooltip title="Move up">
        <span>
          <IconButton size="small" disabled={!canUp} onClick={() => onReorder(rows, row, 'up')}>
            <ArrowUpwardIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Move down">
        <span>
          <IconButton size="small" disabled={!canDown} onClick={() => onReorder(rows, row, 'down')}>
            <ArrowDownwardIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </>
  );
}

// ─── Entity taxonomy term manager ──────────────────────────────────────

function EntityTermManager({
  resource,
  label,
  onBack,
}: {
  resource: string;
  label: string;
  onBack: () => void;
}) {
  const { data, isLoading } = useGetList(resource, {
    pagination: { page: 1, perPage: 200 },
    sort: { field: 'taxonomyTermPosition', order: 'ASC' },
  });
  const redirect = useRedirect();
  const reorder = useReorder(resource);
  const rows = buildTreeRows(data ?? []);

  return (
    <Box p={2}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <IconButton onClick={onBack}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5">{label}</Typography>
      </Box>

      {isLoading ? null : rows.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No {label.toLowerCase()} yet.
        </Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell width={120}>Order</TableCell>
              <TableCell width={60} />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const name = (row.record.taxonomyLabel ?? row.record.name ?? '') as string;
              return (
                <TableRow key={row.record.id} hover>
                  <TableCell>
                    <Box sx={{ pl: row.depth * 3 }}>
                      {row.depth > 0 && (
                        <Box component="span" sx={{ color: 'text.disabled', mr: 0.5 }}>{'—'}</Box>
                      )}
                      {name}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <ReorderButtons rows={rows} row={row} onReorder={reorder} />
                  </TableCell>
                  <TableCell>
                    <Tooltip title={`Edit ${label.replace(/s$/, '')}`}>
                      <IconButton size="small" onClick={() => redirect('edit', resource, row.record.id)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}

// ─── Generic taxonomy term manager ─────────────────────────────────────

function GenericTermManager({
  type,
  label,
  onBack,
}: {
  type: string;
  label: string;
  onBack: () => void;
}) {
  const { data, isLoading } = useGetList('taxonomies', {
    pagination: { page: 1, perPage: 200 },
    sort: { field: 'taxonomyTermPosition', order: 'ASC' },
    filter: { type },
  });
  const redirect = useRedirect();
  const [deleteOne] = useDelete();
  const notify = useNotify();
  const refresh = useRefresh();
  const reorder = useReorder('taxonomies');
  const rows = buildTreeRows(data ?? []);

  const handleDelete = useCallback(
    async (record: RaRecord) => {
      try {
        await deleteOne('taxonomies', { id: record.id, previousData: record }, { mutationMode: 'pessimistic' });
        notify('Term deleted', { type: 'success' });
        refresh();
      } catch {
        notify('Error deleting term', { type: 'error' });
      }
    },
    [deleteOne, notify, refresh],
  );

  return (
    <Box p={2}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton onClick={onBack}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5">{label}</Typography>
        </Box>
        <TopToolbar>
          <CreateButton resource="taxonomies" />
        </TopToolbar>
      </Box>

      {isLoading ? null : rows.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No {label.toLowerCase()} yet.
        </Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell width={120}>Order</TableCell>
              <TableCell width={100} />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.record.id} hover>
                <TableCell>
                  <Box sx={{ pl: row.depth * 3 }}>
                    {row.depth > 0 && (
                      <Box component="span" sx={{ color: 'text.disabled', mr: 0.5 }}>{'—'}</Box>
                    )}
                    {row.record.name as string}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {row.record.slug as string}
                  </Typography>
                </TableCell>
                <TableCell>
                  <ReorderButtons rows={rows} row={row} onReorder={reorder} />
                </TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => redirect('edit', 'taxonomies', row.record.id)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => handleDelete(row.record)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}

// ─── Main component ────────────────────────────────────────────────────

export function TaxonomyList() {
  const [selected, setSelected] = useState<SelectedTaxonomy | null>(null);

  if (!selected) {
    return <CategoriesIndex onSelect={setSelected} />;
  }

  if (selected.kind === 'entity') {
    return (
      <EntityTermManager
        resource={selected.resource}
        label={selected.label}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <GenericTermManager
      type={selected.type}
      label={selected.label}
      onBack={() => setSelected(null)}
    />
  );
}
