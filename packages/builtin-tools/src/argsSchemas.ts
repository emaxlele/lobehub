import {
  userInteractionArgsSchemas,
  UserInteractionIdentifier,
} from '@lobechat/builtin-tool-user-interaction';
import type { ZodTypeAny } from 'zod';

// Injected into GeneralChatAgent via import — can't travel over TRPC/JSON.
// Opt-in per tool; missing entries skip pre-validation.
export const builtinToolArgsSchemas: Record<string, Record<string, ZodTypeAny>> = {
  [UserInteractionIdentifier]: userInteractionArgsSchemas,
};
