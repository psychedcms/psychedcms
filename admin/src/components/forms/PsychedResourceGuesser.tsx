import { ResourceGuesser, type ResourceGuesserProps } from '@api-platform/admin';

import { PsychedCreateGuesser } from './PsychedCreateGuesser.tsx';
import { PsychedEditGuesser } from './PsychedEditGuesser.tsx';

/**
 * Custom ResourceGuesser that uses PsychedCreateGuesser and PsychedEditGuesser
 * for resources with x-psychedcms field metadata.
 *
 * This component wraps API Platform's ResourceGuesser with our custom
 * create and edit components that support tabbed forms and field type mapping.
 */
export function PsychedResourceGuesser(props: ResourceGuesserProps) {
  return (
    <ResourceGuesser
      {...props}
      create={PsychedCreateGuesser}
      edit={PsychedEditGuesser}
    />
  );
}
