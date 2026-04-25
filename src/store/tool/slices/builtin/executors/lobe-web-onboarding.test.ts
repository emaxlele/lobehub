import { InterventionChecker } from '@lobechat/agent-runtime';
import { WebOnboardingApiName, WebOnboardingManifest } from '@lobechat/builtin-tool-web-onboarding';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { finishOnboardingSpy, refreshUserStateSpy } = vi.hoisted(() => ({
  finishOnboardingSpy: vi.fn(),
  refreshUserStateSpy: vi.fn(),
}));

vi.mock('@/services/user', () => ({
  userService: {
    finishOnboarding: finishOnboardingSpy,
  },
}));

vi.mock('@/store/user', () => ({
  useUserStore: {
    getState: () => ({
      refreshUserState: refreshUserStateSpy,
    }),
  },
}));

vi.mock('@/store/agent', () => ({
  useAgentStore: {
    getState: () => ({
      refreshBuiltinAgent: vi.fn().mockResolvedValue(undefined),
    }),
  },
}));

describe('webOnboardingExecutor', () => {
  beforeEach(() => {
    finishOnboardingSpy.mockReset();
    refreshUserStateSpy.mockReset();
    vi.resetModules();
  });

  it('publishes the renamed saveUserQuestion API', async () => {
    const { webOnboardingExecutor } = await import('./lobe-web-onboarding');

    expect(WebOnboardingApiName.saveUserQuestion).toBe('saveUserQuestion');
    expect('saveAnswer' in WebOnboardingApiName).toBe(false);
    expect(webOnboardingExecutor.hasApi(WebOnboardingApiName.saveUserQuestion)).toBe(true);
    expect(webOnboardingExecutor.hasApi('saveAnswer')).toBe(false);
  });

  it('publishes the flat saveUserQuestion manifest contract', () => {
    const saveUserQuestionApi = WebOnboardingManifest.api.find(
      (api) => api.name === WebOnboardingApiName.saveUserQuestion,
    );

    expect(saveUserQuestionApi).toMatchObject({
      description: expect.stringContaining('require user confirmation'),
      humanIntervention: [
        {
          match: { agentName: { pattern: '\\S', type: 'regex' } },
          policy: 'always',
        },
        {
          match: { agentEmoji: { pattern: '\\S', type: 'regex' } },
          policy: 'always',
        },
        {
          match: { fullName: { pattern: '\\S', type: 'regex' } },
          policy: 'always',
        },
        {
          match: { responseLanguage: { pattern: '\\S', type: 'regex' } },
          policy: 'always',
        },
        { policy: 'never' },
      ],
      parameters: {
        additionalProperties: false,
        properties: {
          agentEmoji: { description: expect.any(String), type: 'string' },
          agentName: { description: expect.any(String), type: 'string' },
          fullName: { type: 'string' },
          interests: {
            items: { type: 'string' },
            type: 'array',
          },
          responseLanguage: { type: 'string' },
        },
        type: 'object',
      },
    });
  });

  it('requires approval for agent identity and user profile fields, bypasses interests-only saves', () => {
    const saveUserQuestionApi = WebOnboardingManifest.api.find(
      (api) => api.name === WebOnboardingApiName.saveUserQuestion,
    );
    const humanIntervention = saveUserQuestionApi?.humanIntervention;

    expect(humanIntervention).toBeDefined();
    expect(Array.isArray(humanIntervention)).toBe(true);

    if (!Array.isArray(humanIntervention)) {
      throw new TypeError('saveUserQuestion humanIntervention must use static rules');
    }

    const intervene = (toolArgs: Record<string, unknown>) =>
      InterventionChecker.shouldIntervene({
        config: humanIntervention,
        securityBlacklist: [],
        toolArgs,
      });

    expect(intervene({ agentName: 'Atlas' })).toBe('always');
    expect(intervene({ agentEmoji: '🛰️' })).toBe('always');
    expect(intervene({ fullName: 'Ada Lovelace' })).toBe('always');
    expect(intervene({ responseLanguage: 'en-US' })).toBe('always');
    expect(intervene({ fullName: 'Ada', responseLanguage: 'en-US' })).toBe('always');
    expect(intervene({ interests: ['AI tooling'] })).toBe('never');
  });

  it('calls finishOnboarding service and syncs user state', async () => {
    finishOnboardingSpy.mockResolvedValue({
      agentId: 'inbox-agent-1',
      success: true,
      topicId: 'topic-1',
    });

    const { webOnboardingExecutor } = await import('./lobe-web-onboarding');
    const result = await webOnboardingExecutor.finishOnboarding({}, {} as any);

    expect(finishOnboardingSpy).toHaveBeenCalledTimes(1);
    expect(refreshUserStateSpy).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
  });
});
