import { createAction, Property } from '@activepieces/pieces-framework';
import { agentxAuth } from '../../index';
import { createAgentXClient } from '../common';

export const findMessageAction = createAction({
  auth: agentxAuth,
  name: 'find_message',
  displayName: 'Find Message',
  description: 'Searches for a specific message by ID in AgentX conversations.',
  props: {
    message_id: Property.ShortText({
      displayName: 'Message ID',
      description: 'The ID of the message to find',
      required: true,
    }),
  },
  async run(context) {
    const { auth, propsValue } = context;
    const { message_id } = propsValue;
    
    const client = createAgentXClient(auth);
    const message = await client.getMessage(message_id as string);
    
    if (!message) {
      throw new Error(`Message with ID ${message_id} not found`);
    }
    
    return message;
  },
});
