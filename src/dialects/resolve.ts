import { DIALECT_PROFILES, POSTGRES_PROFILE } from './profiles';
import type { DialectName, DialectProfile, DialectStatementHandler } from './types';

function isDialectProfile(value: unknown): value is DialectProfile {
  if (value === null || typeof value !== 'object') return false;
  const candidate = value as Partial<DialectProfile>;
  return (
    typeof candidate.name === 'string'
    && candidate.keywords instanceof Set
    && candidate.functionKeywords instanceof Set
    && candidate.clauseKeywords instanceof Set
    && candidate.statementStarters instanceof Set
  );
}

function normalizeKeywordSet(
  values: ReadonlySet<string>,
  propertyName: 'keywords' | 'functionKeywords' | 'clauseKeywords' | 'statementStarters',
): { readonly set: ReadonlySet<string>; readonly changed: boolean } {
  const normalized = new Set<string>();
  let changed = false;

  for (const value of values) {
    if (typeof value !== 'string') {
      throw new Error(`Unsupported SQL dialect profile. '${propertyName}' must contain only strings.`);
    }
    const upper = value.toUpperCase();
    if (upper !== value) changed = true;
    normalized.add(upper);
  }

  if (normalized.size !== values.size) changed = true;
  return changed ? { set: normalized, changed } : { set: values, changed };
}

function normalizeStatementHandlers(
  statementHandlers: Readonly<Record<string, DialectStatementHandler>> | undefined,
): { readonly handlers: Readonly<Record<string, DialectStatementHandler>> | undefined; readonly changed: boolean } {
  if (!statementHandlers) {
    return { handlers: statementHandlers, changed: false };
  }

  const normalized: Record<string, DialectStatementHandler> = {};
  let changed = false;

  for (const [key, handler] of Object.entries(statementHandlers)) {
    const upper = key.toUpperCase();
    if (upper !== key || Object.prototype.hasOwnProperty.call(normalized, upper)) {
      changed = true;
    }
    normalized[upper] = handler;
  }

  return changed ? { handlers: normalized, changed } : { handlers: statementHandlers, changed };
}

function normalizeCustomDialectProfile(profile: DialectProfile): DialectProfile {
  const keywords = normalizeKeywordSet(profile.keywords, 'keywords');
  const functionKeywords = normalizeKeywordSet(profile.functionKeywords, 'functionKeywords');
  const clauseKeywords = normalizeKeywordSet(profile.clauseKeywords, 'clauseKeywords');
  const statementStarters = normalizeKeywordSet(profile.statementStarters, 'statementStarters');
  const statementHandlers = normalizeStatementHandlers(profile.statementHandlers);

  if (
    !keywords.changed
    && !functionKeywords.changed
    && !clauseKeywords.changed
    && !statementStarters.changed
    && !statementHandlers.changed
  ) {
    return profile;
  }

  return {
    ...profile,
    keywords: keywords.set,
    functionKeywords: functionKeywords.set,
    clauseKeywords: clauseKeywords.set,
    statementStarters: statementStarters.set,
    statementHandlers: statementHandlers.handlers,
  };
}

export function resolveDialectProfile(dialect?: DialectName | DialectProfile): DialectProfile {
  if (dialect === undefined) return POSTGRES_PROFILE;
  if (isDialectProfile(dialect)) return normalizeCustomDialectProfile(dialect);
  if (typeof dialect !== 'string') {
    throw new Error('Unsupported SQL dialect object. Expected a dialect name (ansi, postgres, mysql, tsql) or a DialectProfile.');
  }

  const normalized = dialect.toLowerCase() as DialectName;
  const resolved = DIALECT_PROFILES[normalized];
  if (!resolved) {
    throw new Error(
      `Unsupported SQL dialect: '${dialect}'. Expected one of: ansi, postgres, mysql, tsql.`
    );
  }
  return resolved;
}
