import {
  AuthenticationType,
  HttpMethod,
  createCustomApiCallAction,
  httpClient,
} from '@activepieces/pieces-common';
import { PieceAuth, createPiece } from '@activepieces/pieces-framework';
import { PieceCategory } from '@activepieces/shared';

// Import actions
import { createConversationAction } from './lib/actions/create-conversation';
import { sendMessageAction } from './lib/actions/send-message';
import { searchAgentsAction } from './lib/actions/search-agents';
import { findConversationAction } from './lib/actions/find-conversation';
import { findMessageAction } from './lib/actions/find-message';

// Import triggers  
import { newAgentTrigger } from './lib/trigger/new-agent';
import { newConversationTrigger } from './lib/trigger/new-conversation';

export const agentxAuth = PieceAuth.SecretText({
  displayName: 'API Key',
  required: true,
  description: `
    To obtain your AgentX API key, follow these steps:

    1. Sign up or log in to your AgentX account at https://www.agentx.so/
    2. Navigate to your account settings or developer settings
    3. Generate a new API key
    4. Copy the API key and paste it here
    `,
  validate: async (auth) => {
    try {
      await httpClient.sendRequest({
        method: HttpMethod.GET,
        url: 'https://api.agentx.so/api/v1/access-agents',
        authentication: {
          type: AuthenticationType.BEARER_TOKEN,
          token: auth.auth,
        },
      });
      return {
        valid: true,
      };
    } catch (e) {
      return {
        valid: false,
        error: 'Invalid API key or unable to connect to AgentX API',
      };
    }
  },
});

export const agentx = createPiece({
  displayName: 'AgentX',
  description: 'Multi-model AI agent platform for building and deploying GPT-powered conversational agents.',
  minimumSupportedRelease: '0.30.0',
  logoUrl: 'https://cdn.activepieces.com/pieces/agentx.png',
  authors: ['varkart'],
  categories: [PieceCategory.ARTIFICIAL_INTELLIGENCE],
  auth: agentxAuth,
  actions: [
    createConversationAction,
    sendMessageAction,
    searchAgentsAction,
    findConversationAction,
    findMessageAction,
    createCustomApiCallAction({
      baseUrl: () => 'https://api.agentx.so/api/v1',
      auth: agentxAuth,
      authMapping: async (auth) => ({
        Authorization: `Bearer ${auth}`,
      }),
    }),
  ],
  triggers: [
    newAgentTrigger,
    newConversationTrigger,
  ],
});
