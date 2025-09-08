import {
  DedupeStrategy,
  Polling,
  pollingHelper,
} from '@activepieces/pieces-common';
import {
  StaticPropsValue,
  TriggerStrategy,
  createTrigger,
} from '@activepieces/pieces-framework';
import { agentxAuth } from '../../index';
import { createAgentXClient, AgentXAgent } from '../common';

const polling: Polling<string, StaticPropsValue<Record<string, never>>> = {
  strategy: DedupeStrategy.TIMEBASED,
  items: async ({ auth }) => {
    const client = createAgentXClient(auth);
    const agents = await client.getAgents();
    
    return agents.map((agent: AgentXAgent) => ({
      epochMilliSeconds: new Date(agent.created_at).getTime(),
      data: agent,
    }));
  },
};

export const newAgentTrigger = createTrigger({
  auth: agentxAuth,
  name: 'new_agent',
  displayName: 'New Agent',
  description: 'Triggers when a new AgentX agent is created.',
  props: {},
  sampleData: {
    id: 'agent_123',
    name: 'Customer Support Agent',
    description: 'AI agent for handling customer support queries',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  type: TriggerStrategy.POLLING,
  async test(context) {
    const { store, auth, propsValue, files } = context;
    return await pollingHelper.test(polling, { store, auth, propsValue, files });
  },
  async onEnable(context) {
    const { store, auth, propsValue } = context;
    await pollingHelper.onEnable(polling, { store, auth, propsValue });
  },
  async onDisable(context) {
    const { store, auth, propsValue } = context;
    await pollingHelper.onDisable(polling, { store, auth, propsValue });
  },
  async run(context) {
    const { store, auth, propsValue, files } = context;
    return await pollingHelper.poll(polling, { store, auth, propsValue, files });
  },
});
