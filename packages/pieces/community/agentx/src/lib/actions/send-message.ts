import { createAction, Property } from '@activepieces/pieces-framework';
import { agentxAuth } from '../../index';
import { createAgentXClient } from '../common';

export const sendMessageAction = createAction({
  auth: agentxAuth,
  name: 'send_message',
  displayName: 'Send Message to Existing Conversation',
  description: 'Posts a message in an already active AgentX conversation.',
  props: {
    conversation_id: Property.ShortText({
      displayName: 'Conversation ID',
      description: 'The ID of the conversation to send the message to',
      required: true,
    }),
    content: Property.LongText({
      displayName: 'Message Content',
      description: 'The content of the message to send',
      required: true,
    }),
  },
  async run(context) {
    const { auth, propsValue } = context;
    const { conversation_id, content } = propsValue;
    
    const client = createAgentXClient(auth);
    const message = await client.sendMessage(
      conversation_id as string,
      content as string
    );
    
    return message;
  },
});
