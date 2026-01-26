import { ResourceGuesser, type ResourceGuesserProps } from '@api-platform/admin';

import { PsychedCreateGuesser } from './PsychedCreateGuesser.tsx';
import { PsychedEditGuesser } from './PsychedEditGuesser.tsx';
import { PsychedListGuesser } from './PsychedListGuesser.tsx';

/**
 * Custom ResourceGuesser that uses PsychedCMS custom components
 * for resources with x-psychedcms field metadata.
 *
 * This component wraps API Platform's ResourceGuesser with our custom
 * list, create and edit components that support tabbed forms and field type mapping.
 */
export function PsychedResourceGuesser(props: ResourceGuesserProps) {
  return (
    <ResourceGuesser
      {...props}
      list={PsychedListGuesser}
      create={PsychedCreateGuesser}
      edit={PsychedEditGuesser}
    />
  );
}
