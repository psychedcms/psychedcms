import {
  List,
  Datagrid,
  TextField,
  EditButton,
  ReferenceField,
  useListContext,
  TopToolbar,
  CreateButton,
} from 'react-admin';
import { Typography } from '@mui/material';

function GenreTree() {
  const { data } = useListContext();
  const all = data ?? [];

  const childrenByParent = new Map<string | number, typeof all>();
  for (const item of all) {
    const parentIri = item.parent;
    if (parentIri) {
      const existing = childrenByParent.get(parentIri) ?? [];
      existing.push(item);
      childrenByParent.set(parentIri, existing);
    }
  }

  const idSet = new Set(all.map((r) => r.id));
  const roots = all.filter((r) => !r.parent || !idSet.has(r.parent));

  const rows: { record: (typeof all)[0]; depth: number }[] = [];
  function walk(items: typeof all, depth: number) {
    for (const item of items) {
      rows.push({ record: item, depth });
      const kids = childrenByParent.get(item['@id'] ?? item.id) ?? [];
      if (kids.length > 0) {
        walk(kids, depth + 1);
      }
    }
  }
  walk(roots, 0);

  if (rows.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No genres yet.
      </Typography>
    );
  }

  return (
    <Datagrid
      data={rows.map((r) => r.record)}
      sort={{ field: 'taxonomyTermPosition', order: 'ASC' }}
      bulkActionButtons={false}
    >
      <TextField source="taxonomyLabel" label="Name" />
      <ReferenceField source="parent" reference="genres" link={false} emptyText="—">
        <TextField source="taxonomyLabel" />
      </ReferenceField>
      <EditButton />
    </Datagrid>
  );
}

function GenreListActions() {
  return (
    <TopToolbar>
      <CreateButton />
    </TopToolbar>
  );
}

export function GenreList() {
  return (
    <List actions={<GenreListActions />} pagination={false} perPage={200}>
      <GenreTree />
    </List>
  );
}
