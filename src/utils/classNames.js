/**
 * Tiny classnames helper — joins truthy class strings with spaces.
 *
 *   cx('btn', isPrimary && 'btn-primary', styles.large)
 *   → 'btn btn-primary _large_abc123'
 */
export function cx(...args) {
  return args.filter(Boolean).join(' ')
}

export default cx
