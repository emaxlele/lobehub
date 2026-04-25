import { describe, expect, it } from 'vitest';

import { UserInteractionManifest } from './manifest';
import { askUserQuestionArgsSchema, userInteractionArgsSchemas } from './schemas';

describe('UserInteractionManifest', () => {
  const askApi = UserInteractionManifest.api.find((a) => a.name === 'askUserQuestion');

  it('does not attach argsSchema onto the manifest (kept serializable)', () => {
    // argsSchema must NOT live on the manifest — manifests cross the TRPC
    // boundary and Zod prototype methods would be stripped during JSON
    // serialization. Schemas are instead exposed as sibling exports and
    // assembled into a registry by @lobechat/builtin-tools.
    expect(askApi).not.toHaveProperty('argsSchema');
  });

  it('exposes per-API args schemas for registry assembly', () => {
    expect(userInteractionArgsSchemas.askUserQuestion).toBe(askUserQuestionArgsSchema);
  });

  it('generates parameters JSONSchema that matches the Zod shape', () => {
    expect(askApi?.parameters).toMatchObject({
      type: 'object',
      required: ['question'],
      additionalProperties: false,
      properties: {
        question: {
          type: 'object',
          required: ['id', 'mode', 'prompt'],
          additionalProperties: false,
          properties: {
            id: { type: 'string' },
            mode: { type: 'string', enum: ['form', 'freeform'] },
            prompt: { type: 'string' },
          },
        },
      },
    });
    // $schema marker should be stripped so it doesn't leak to LLM providers.
    expect(askApi?.parameters).not.toHaveProperty('$schema');
  });

  it('argsSchema rejects a stringified question (real failure mode)', () => {
    const bad = askUserQuestionArgsSchema.safeParse({
      question: JSON.stringify({ id: 'x', mode: 'form', prompt: 'pick' }),
    });
    expect(bad.success).toBe(false);
  });

  it('argsSchema accepts a well-formed freeform question', () => {
    const good = askUserQuestionArgsSchema.safeParse({
      question: { id: 'x', mode: 'freeform', prompt: 'pick' },
    });
    expect(good.success).toBe(true);
  });

  it('argsSchema enforces the form-mode-requires-fields refinement', () => {
    const badFormNoFields = askUserQuestionArgsSchema.safeParse({
      question: { id: 'x', mode: 'form', prompt: 'pick' },
    });
    expect(badFormNoFields.success).toBe(false);
  });
});
