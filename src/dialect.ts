import type { DialectName, DialectProfile } from './dialects/types';

export type { DialectName, DialectProfile, DialectStatementHandler } from './dialects/types';

/**
 * Public dialect option accepted by Holywell APIs.
 *
 * Use a built-in dialect name for common behavior, or pass a full profile
 * for custom dialect integrations.
 */
export type SQLDialect = DialectName | DialectProfile;
