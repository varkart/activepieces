import { createAction, Property } from '@activepieces/pieces-framework';
import { agentxAuth } from '../../index';
import { createAgentXClient } from '../common';

export const createConversationAction = createAction({
  auth: agentxAuth,
  name: 'create_conversation',
  displayName: 'Create Conversation With Single Agent',
  description: 'Starts a new conversation session with an AgentX agent.',
  props: {
    agent_id: Property.Dropdown({
      displayName: 'Agent',
      description: 'Select the agent to start a conversation with',
      required: true,
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
    initial_message: Property.LongText({
      displayName: 'Initial Message',
      description: 'Optional initial message to start the conversation with',
      required: false,
    }),
  },
  async run(context) {
    const { auth, propsValue } = context;
    const { agent_id, initial_message } = propsValue;
    
    const client = createAgentXClient(auth);
    const conversation = await client.createConversation(
      agent_id as string,
      initial_message as string | undefined
    );
    
    return conversation;
  },
});
