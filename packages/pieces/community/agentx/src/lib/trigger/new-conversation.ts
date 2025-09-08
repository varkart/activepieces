import {
  DedupeStrategy,
  Polling,
  pollingHelper,
} from '@activepieces/pieces-common';
import {
  StaticPropsValue,
  TriggerStrategy,
  createTrigger,
  Property,
} from '@activepieces/pieces-framework';
import { agentxAuth } from '../../index';
import { createAgentXClient, AgentXConversation } from '../common';

const props = {
  agent_id: Property.Dropdown({
    displayName: 'Agent',
    description: 'Select an agent to monitor for new conversations (leave empty to monitor all agents)',
    required: false,
    refreshers: [],
    options: async ({ auth }) => {
      if (!auth) return { options: [] };
      
      const client = createAgentXClient(auth as string);
      const agents = await client.getAgents();
      
      return {
        options: agents.map(agent => ({
          label: agent.name,
          value: agent.id,
        })),
      };
    },
  }),
};

const polling: Polling<string, StaticPropsValue<typeof props>> = {
  strategy: DedupeStrategy.TIMEBASED,
  items: async ({ auth, propsValue }) => {
    const client = createAgentXClient(auth);
    const conversations = await client.getConversations(propsValue.agent_id);
    
    return conversations.map((conversation: AgentXConversation) => ({
      epochMilliSeconds: new Date(conversation.created_at).getTime(),
      data: conversation,
    }));
  },
};

export const newConversationTrigger = createTrigger({
  auth: agentxAuth,
  name: 'new_conversation',
  displayName: 'New Conversation',
  description: 'Triggers when a new conversation begins with an AgentX agent.',
  props,
  sampleData: {
    id: 'conv_123',
    agent_id: 'agent_123',
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
