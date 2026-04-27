/**
 * @vitest-environment happy-dom
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import type * as ReactDOM from 'react-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Intervention from './index';
import { installMarketplaceAgents } from './installMarketplaceAgents';

const submitToolInteraction = vi.fn();
const skipToolInteraction = vi.fn();
const cancelToolInteraction = vi.fn();
const updatePluginArguments = vi.fn();

vi.mock('@lobehub/ui', () => ({
  Flexbox: ({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => (
    <div {...props}>{children}</div>
  ),
}));

vi.mock('react-dom', async () => {
  const actual = await vi.importActual<typeof ReactDOM>('react-dom');

  return {
    ...actual,
    createPortal: (node: ReactNode) => node,
  };
});

vi.mock('@/store/user', () => ({
  useUserStore: (selector: (state: unknown) => unknown) => selector({}),
}));

vi.mock('@/store/user/selectors', () => ({
  toolInterventionSelectors: {
    approvalMode: () => 'manual',
  },
}));

vi.mock('../../../../../store', () => ({
  useConversationStore: (
    selector: (state: {
      cancelToolInteraction: typeof cancelToolInteraction;
      skipToolInteraction: typeof skipToolInteraction;
      submitToolInteraction: typeof submitToolInteraction;
      updatePluginArguments: typeof updatePluginArguments;
    }) => unknown,
  ) =>
    selector({
      cancelToolInteraction,
      skipToolInteraction,
      submitToolInteraction,
      updatePluginArguments,
    }),
}));

vi.mock('@lobechat/builtin-tools/interventions', () => ({
  getBuiltinIntervention: (identifier: string) =>
    identifier === 'lobe-agent-marketplace'
      ? ({
          interactionMode,
          onInteractionAction,
        }: {
          interactionMode?: string;
          onInteractionAction?: (action: {
            payload: Record<string, unknown>;
            type: 'submit';
          }) => Promise<void>;
        }) => (
          <div>
            <span>{interactionMode ?? 'approval'}</span>
            <button
              onClick={() =>
                onInteractionAction?.({
                  payload: { selectedTemplateIds: ['pair-programmer'] },
                  type: 'submit',
                })
              }
            >
              submit
            </button>
          </div>
        )
      : undefined,
}));

vi.mock('./ApprovalActions', () => ({
  default: () => <div>approval-actions</div>,
}));

vi.mock('./Fallback', () => ({
  default: () => <div>fallback</div>,
}));

vi.mock('./KeyValueEditor', () => ({
  default: () => <div>editor</div>,
}));

vi.mock('./SecurityBlacklistWarning', () => ({
  default: () => <div>security-warning</div>,
}));

vi.mock('./installMarketplaceAgents', () => ({
  installMarketplaceAgents: vi.fn().mockResolvedValue({
    installedAgentIds: ['local-agent-1'],
    skippedAgentIds: [],
  }),
}));

vi.mock('../Arguments', () => ({
  default: ({ arguments: args }: { arguments?: string }) => <pre>{args}</pre>,
}));

describe('Intervention custom interaction routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders agent marketplace interventions in custom mode and submits through tool interaction', async () => {
    render(
      <Intervention
        apiName="showAgentMarketplace"
        id="message-1"
        identifier="lobe-agent-marketplace"
        requestArgs='{"categoryHints":["engineering"],"prompt":"Try these","requestId":"req-1"}'
        toolCallId="tool-call-1"
      />,
    );

    expect(screen.getByText('custom')).toBeInTheDocument();
    expect(screen.queryByText('approval-actions')).not.toBeInTheDocument();
    expect(screen.queryByText('security-warning')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('submit'));

    await waitFor(() => {
      expect(installMarketplaceAgents).toHaveBeenCalledWith(['pair-programmer']);
      expect(submitToolInteraction).toHaveBeenCalledWith(
        'message-1',
        {
          installedAgentIds: ['local-agent-1'],
          selectedTemplateIds: ['pair-programmer'],
          skippedAgentIds: [],
        },
        { createUserMessage: false },
      );
    });
  });
});
