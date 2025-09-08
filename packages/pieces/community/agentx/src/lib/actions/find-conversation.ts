import { createAction, Property } from '@activepieces/pieces-framework';
import { agentxAuth } from '../../index';
import { createAgentXClient } from '../common';

export const findConversationAction = createAction({
  auth: agentxAuth,
  name: 'find_conversation',
  displayName: 'Find Conversation',
  description: 'Looks up an existing AgentX conversation by ID.',
  props: {
    conversation_id: Property.ShortText({
      displayName: 'Conversation ID',
      description: 'The ID of the conversation to find',
      required: true,
    }),
    include_messages: Property.Checkbox({
      displayName: 'Include Messages',
      description: 'Whether to include messages in the conversation response',
      required: false,
      defaultValue: false,
    }),
  },
  async run(context) {
    const { auth, propsValue } = context;
    const { conversation_id, include_messages } = propsValue;
    
    const client = createAgentXClient(auth);
    const conversation = await client.getConversation(conversation_id as string);
    
    if (!conversation) {
      throw new Error(`Conversation with ID ${conversation_id} not found`);
    }
    
    // If include_messages is true, fetch the messages separately
    if (include_messages) {
      const messages = await client.getMessages(conversation.id);
      return {
        ...conversation,
        messages,
      };
    }
    
    return conversation;
  },
});
