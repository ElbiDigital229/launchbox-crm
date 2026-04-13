import { TAG_COLORS } from '@/lib/constants';
import Badge from './Badge';

/**
 * Renders a single tag badge with auto-coloring based on TAG_COLORS.
 */
export default function TagBadge({ tag, size = 'sm' }) {
  const variant = TAG_COLORS[tag] || 'gray';
  return (
    <Badge variant={variant} size={size}>
      {tag}
    </Badge>
  );
}

/**
 * Renders a list of tag badges with optional truncation.
 * Shows first `max` tags and a "+N" indicator for the rest.
 */
export function TagList({ tags = [], max, size = 'sm' }) {
  if (!tags || tags.length === 0) return null;

  const visible = max ? tags.slice(0, max) : tags;
  const remaining = max ? tags.length - max : 0;

  return (
    <div className="inline-flex flex-wrap gap-1">
      {visible.map((tag) => (
        <TagBadge key={tag} tag={tag} size={size} />
      ))}
      {remaining > 0 && (
        <Badge variant="gray" size={size}>
          +{remaining}
        </Badge>
      )}
    </div>
  );
}
