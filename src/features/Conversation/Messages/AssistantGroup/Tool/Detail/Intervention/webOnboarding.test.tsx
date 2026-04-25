/**
 * @vitest-environment happy-dom
 */
import { cleanup, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@lobehub/ui', () => ({
  Avatar: ({ avatar }: { avatar: string }) => <div>{avatar}</div>,
  Flexbox: ({ children }: { children?: ReactNode; [key: string]: unknown }) => (
    <div>{children}</div>
  ),
  Text: ({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => (
    <span {...props}>{children}</span>
  ),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      (
        ({
          'tool.intervention.onboarding.agentIdentity.applyHint':
            'The new identity will appear after approval.',
          'tool.intervention.onboarding.agentIdentity.description':
            'Approving this change updates the Agent shown in Inbox and in this onboarding conversation.',
          'tool.intervention.onboarding.agentIdentity.emoji': 'Agent avatar',
          'tool.intervention.onboarding.agentIdentity.eyebrow': 'Onboarding approval',
          'tool.intervention.onboarding.agentIdentity.name': 'Agent name',
          'tool.intervention.onboarding.agentIdentity.targetInbox': 'Inbox Agent',
          'tool.intervention.onboarding.agentIdentity.targetOnboarding': 'Current onboarding Agent',
          'tool.intervention.onboarding.agentIdentity.targets': 'Applies to',
          'tool.intervention.onboarding.agentIdentity.title': 'Confirm Agent identity update',
          'tool.intervention.onboarding.userProfile.applyHint':
            'These details will be saved to your profile after approval.',
          'tool.intervention.onboarding.userProfile.description':
            'Approving this change updates your onboarding profile so the Agent can tailor future replies.',
          'tool.intervention.onboarding.userProfile.eyebrow': 'Onboarding approval',
          'tool.intervention.onboarding.userProfile.fullName': 'Full name',
          'tool.intervention.onboarding.userProfile.responseLanguage': 'Response language',
          'tool.intervention.onboarding.userProfile.title': 'Confirm your profile update',
          'untitledAgent': 'Untitled Agent',
        }) satisfies Record<string, string>
      )[key] || key,
  }),
}));

const importComponent = async () => {
  const { WebOnboardingInterventions } =
    await import('@lobechat/builtin-tool-web-onboarding/client');
  const { WebOnboardingApiName } = await import('@lobechat/builtin-tool-web-onboarding');

  const Component = WebOnboardingInterventions[WebOnboardingApiName.saveUserQuestion];
  if (!Component) throw new TypeError('Expected web onboarding intervention to be registered');
  return Component;
};

describe('web onboarding intervention registry', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the agent identity card when agent fields are present', async () => {
    const Component = await importComponent();

    const { container } = render(
      <Component args={{ agentEmoji: '🛰️', agentName: 'Atlas' }} messageId="message-1" />,
    );

    expect(screen.getByText('Confirm Agent identity update')).toBeInTheDocument();
    expect(screen.getAllByText('Atlas')).toHaveLength(2);
    expect(container.textContent).toContain('🛰️');
    expect(screen.getByText('Inbox Agent')).toBeInTheDocument();
    expect(screen.getByText('Current onboarding Agent')).toBeInTheDocument();
    expect(screen.queryByText('Confirm your profile update')).not.toBeInTheDocument();
  });

  it('renders the user profile card when only user fields are present', async () => {
    const Component = await importComponent();

    render(
      <Component
        args={{ fullName: 'Ada Lovelace', responseLanguage: 'en-US' }}
        messageId="message-2"
      />,
    );

    expect(screen.getByText('Confirm your profile update')).toBeInTheDocument();
    expect(screen.getByText('Full name')).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Response language')).toBeInTheDocument();
    expect(screen.getByText('en-US')).toBeInTheDocument();
    expect(screen.queryByText('Confirm Agent identity update')).not.toBeInTheDocument();
    expect(screen.queryByText('Inbox Agent')).not.toBeInTheDocument();
  });

  it('renders nothing when only interests are passed', async () => {
    const Component = await importComponent();

    const { container } = render(
      <Component args={{ interests: ['AI tooling'] }} messageId="message-3" />,
    );

    expect(screen.queryByText('Confirm Agent identity update')).not.toBeInTheDocument();
    expect(screen.queryByText('Confirm your profile update')).not.toBeInTheDocument();
    expect(container.textContent).toBe('');
  });

  it('renders both sections when agent and user fields arrive together', async () => {
    const Component = await importComponent();

    render(
      <Component args={{ agentName: 'Atlas', fullName: 'Ada Lovelace' }} messageId="message-4" />,
    );

    expect(screen.getByText('Confirm Agent identity update')).toBeInTheDocument();
    expect(screen.getByText('Confirm your profile update')).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
  });
});
