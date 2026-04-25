import type { BuiltinToolManifest } from '@lobechat/types';
import { zodToJsonSchema } from 'zod-to-json-schema';

import { askUserQuestionArgsSchema } from './schemas';
import { systemPrompt } from './systemRole';
import { UserInteractionApiName, UserInteractionIdentifier } from './types';

const askUserQuestionParameters = (() => {
  const schema = zodToJsonSchema(askUserQuestionArgsSchema, {
    target: 'openApi3',
  }) as Record<string, any>;
  // Remove meta-schema markers that LLM providers don't need.
  delete schema.$schema;
  delete schema.$ref;
  return schema;
})();

export const UserInteractionManifest: BuiltinToolManifest = {
  api: [
    {
      description:
        'Create a UI-mediated interaction request with either structured form fields or freeform input. Returns the request in pending state.',
      humanIntervention: 'always',
      name: UserInteractionApiName.askUserQuestion,
      parameters: askUserQuestionParameters,
      renderDisplayControl: 'collapsed',
    },
    {
      description:
        "Record the user's submitted response for a pending interaction request. In normal product flows, this is usually handled by the client or framework after the user submits in the UI.",
      name: UserInteractionApiName.submitUserResponse,
      parameters: {
        properties: {
          requestId: {
            description: 'The interaction request ID to submit a response for.',
            type: 'string',
          },
          response: {
            additionalProperties: true,
            description: "The user's response data.",
            type: 'object',
          },
        },
        required: ['requestId', 'response'],
        type: 'object',
      },
    },
    {
      description:
        'Mark a pending interaction request as skipped with an optional reason. In normal product flows, this is usually handled by the client or framework after the user skips in the UI.',
      name: UserInteractionApiName.skipUserResponse,
      parameters: {
        properties: {
          reason: {
            description: 'Optional reason for skipping.',
            type: 'string',
          },
          requestId: {
            description: 'The interaction request ID to skip.',
            type: 'string',
          },
        },
        required: ['requestId'],
        type: 'object',
      },
    },
    {
      description:
        'Cancel a pending interaction request. In normal product flows, this is usually handled by the client or framework after the user cancels in the UI.',
      name: UserInteractionApiName.cancelUserResponse,
      parameters: {
        properties: {
          requestId: {
            description: 'The interaction request ID to cancel.',
            type: 'string',
          },
        },
        required: ['requestId'],
        type: 'object',
      },
    },
    {
      description:
        'Inspect the current state of a known interaction request. Use for recovery or diagnostics, not routine polling.',
      name: UserInteractionApiName.getInteractionState,
      parameters: {
        properties: {
          requestId: {
            description: 'The interaction request ID to query.',
            type: 'string',
          },
        },
        required: ['requestId'],
        type: 'object',
      },
      renderDisplayControl: 'collapsed',
    },
  ],
  identifier: UserInteractionIdentifier,
  meta: {
    avatar: '💬',
    description: 'Ask users questions through UI interactions and observe their lifecycle outcomes',
    title: 'User Interaction',
  },
  systemRole: systemPrompt,
  type: 'builtin',
};
