'use client';

import type { BuiltinInterventionProps } from '@lobechat/types';
import { Button, Flexbox, Text } from '@lobehub/ui';
import { cx } from 'antd-style';
import type { KeyboardEvent } from 'react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AGENT_TEMPLATES, getTemplatesByCategoryPriority } from '../../../data/agent-templates';
import {
  type AgentTemplate,
  type MarketplaceCategory,
  type ShowAgentMarketplaceArgs,
} from '../../../types';
import { CATEGORY_DEFAULT_AVATAR, CATEGORY_LABELS } from './constants';
import { styles } from './style';

const PickAgentsIntervention = memo<BuiltinInterventionProps<ShowAgentMarketplaceArgs>>(
  ({ args, interactionMode, onInteractionAction }) => {
    const { t } = useTranslation('ui');
    const isCustom = interactionMode === 'custom';

    const { categoryHints, description, prompt } = args;

    const templates = useMemo(
      () => getTemplatesByCategoryPriority(categoryHints ?? []),
      [categoryHints],
    );

    const groupedTemplates = useMemo(() => {
      const map = new Map<MarketplaceCategory, AgentTemplate[]>();
      for (const tpl of templates) {
        const list = map.get(tpl.category);
        if (list) list.push(tpl);
        else map.set(tpl.category, [tpl]);
      }
      return map;
    }, [templates]);

    const availableCategories = useMemo(() => [...groupedTemplates.keys()], [groupedTemplates]);

    const [activeCategory, setActiveCategory] = useState<MarketplaceCategory | undefined>(
      () => availableCategories[0],
    );

    useEffect(() => {
      if (!activeCategory || !groupedTemplates.has(activeCategory)) {
        setActiveCategory(availableCategories[0]);
      }
    }, [activeCategory, availableCategories, groupedTemplates]);

    const visibleTemplates = useMemo(
      () => (activeCategory ? (groupedTemplates.get(activeCategory) ?? []) : []),
      [activeCategory, groupedTemplates],
    );

    const [selected, setSelected] = useState<Set<string>>(() => new Set());
    const [submitting, setSubmitting] = useState(false);

    const toggle = useCallback((id: string) => {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    }, []);

    const handleSubmit = useCallback(async () => {
      if (!onInteractionAction || selected.size === 0) return;
      setSubmitting(true);
      try {
        await onInteractionAction({
          payload: { selectedTemplateIds: [...selected] },
          type: 'submit',
        });
      } catch (error) {
        console.error('[AgentMarketplace] submit failed', error);
      } finally {
        setSubmitting(false);
      }
    }, [onInteractionAction, selected]);

    const handleSkip = useCallback(async () => {
      if (!onInteractionAction) return;
      await onInteractionAction({ type: 'skip' });
    }, [onInteractionAction]);

    const handleCardKeyDown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>, id: string) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggle(id);
        }
      },
      [toggle],
    );

    if (!isCustom) {
      return (
        <Flexbox gap={8}>
          <Text>{prompt}</Text>
          {description && (
            <Text style={{ fontSize: 13 }} type="secondary">
              {description}
            </Text>
          )}
          <Text style={{ fontSize: 12 }} type="secondary">
            {templates.length} / {AGENT_TEMPLATES.length} templates available.
          </Text>
        </Flexbox>
      );
    }

    return (
      <Flexbox className={styles.root} gap={12}>
        <div className={styles.header}>
          <Text style={{ fontWeight: 500 }}>{prompt}</Text>
          {description && (
            <Text style={{ fontSize: 13 }} type="secondary">
              {description}
            </Text>
          )}
        </div>

        <div className={styles.container}>
          <div aria-orientation="vertical" className={styles.sidebar} role="tablist">
            {availableCategories.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  aria-selected={isActive}
                  className={cx(styles.categoryItem, isActive && styles.categoryItemActive)}
                  key={category}
                  role="tab"
                  type="button"
                  onClick={() => setActiveCategory(category)}
                >
                  {CATEGORY_LABELS[category]}
                </button>
              );
            })}
          </div>

          <div className={styles.content}>
            {visibleTemplates.length === 0 ? (
              <div className={styles.empty}>No templates available.</div>
            ) : (
              <div className={styles.grid}>
                {visibleTemplates.map((tpl) => {
                  const isSelected = selected.has(tpl.id);
                  const avatar = tpl.avatar ?? CATEGORY_DEFAULT_AVATAR[tpl.category];
                  return (
                    <div
                      aria-pressed={isSelected}
                      className={cx(styles.card, isSelected && styles.cardSelected)}
                      key={tpl.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => toggle(tpl.id)}
                      onKeyDown={(event) => handleCardKeyDown(event, tpl.id)}
                    >
                      <div className={styles.cardIcon}>{avatar}</div>
                      <div className={styles.cardTitle}>{tpl.title}</div>
                      <div className={styles.cardDescription}>{tpl.description}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <Text className={styles.skipLink} type="secondary" onClick={handleSkip}>
            {t('form.skip')}
          </Text>
          <Button
            disabled={selected.size === 0}
            loading={submitting}
            type="primary"
            onClick={handleSubmit}
          >
            {`${t('common.confirm')} (${selected.size})`}
          </Button>
        </div>
      </Flexbox>
    );
  },
);

PickAgentsIntervention.displayName = 'PickAgentsIntervention';

export default PickAgentsIntervention;
