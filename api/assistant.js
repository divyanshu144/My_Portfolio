import { ai, model } from './_lib/context.js';
import { makeAssistantHandler } from './_lib/assistant.js';

export default makeAssistantHandler((messages) =>
  ai.chat.completions.create({ model, messages }).then((r) => r.choices[0].message.content ?? ''));
