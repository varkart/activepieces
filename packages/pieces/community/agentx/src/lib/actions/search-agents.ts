import { createAction, Property } from '@activepieces/pieces-framework';
import { agentxAuth } from '../../index';
import { createAgentXClient } from '../common';

export const searchAgentsAction = createAction({
  auth: agentxAuth,
  name: 'search_agents',
  displayName: 'Search Agents',
  description: 'Finds AgentX agents by name or ID using search filters.',
  props: {
    query: Property.ShortText({
      displayName: 'Search Query',
      description: 'Search term to find agents by name or ID (leave empty to get all agents)',
      required: false,
    }),
  },
  async run(context) {
    const { auth, propsValue } = context;
    const { query } = propsValue;
    
    const client = createAgentXClient(auth);
    const agents = await client.searchAgents(query as string | undefined);
    
    return {
      agents,
      count: agents.length,
    };
  },
});
