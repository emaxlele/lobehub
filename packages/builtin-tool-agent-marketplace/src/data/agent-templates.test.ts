import { describe, expect, it } from 'vitest';

import { MarketplaceCategory } from '../types';
import { AGENT_TEMPLATES, getTemplatesByCategoryPriority } from './agent-templates';

describe('getTemplatesByCategoryPriority', () => {
  it('keeps all templates while moving hinted categories to the front in hint order', () => {
    const templates = getTemplatesByCategoryPriority([
      MarketplaceCategory.Engineering,
      MarketplaceCategory.ContentCreation,
    ]);

    expect(templates).toHaveLength(AGENT_TEMPLATES.length);
    expect(templates[0]?.category).toBe(MarketplaceCategory.Engineering);

    const firstNonEngineeringIndex = templates.findIndex(
      (template) => template.category !== MarketplaceCategory.Engineering,
    );
    expect(templates[firstNonEngineeringIndex]?.category).toBe(MarketplaceCategory.ContentCreation);

    expect(
      templates.some((template) => template.category === MarketplaceCategory.PersonalLife),
    ).toBe(true);
  });
});
