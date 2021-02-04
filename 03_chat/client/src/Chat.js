import React from 'react';
import MessageInput from './MessageInput';
import MessageList from './MessageList';
import { useQuery, useMutation, useSubscription } from '@apollo/react-hooks'
import { messagesQuery, addMessageMutation, messageAddedSubscription } from './graphql/queries'

const Chat = ({user}) => {

  const {data} = useQuery(messagesQuery);
  const messages = data ? data.messages : [];
  
  const [addMessage] = useMutation(addMessageMutation);

  const handleSend = async (text) => {    
    await addMessage({variables: {input: {text}}});
  };

  useSubscription(messageAddedSubscription, {
    onSubscriptionData: ({client, subscriptionData})=> {
      client.cache.writeData({data: {
        messages: messages.concat(subscriptionData.data.messageAdded)
      }});
    } 
  });

  return (
    <section className="section">
      <div className="container">
        <h1 className="title">Chatting as {user}</h1>
        <MessageList user={user} messages={messages} />
        <MessageInput onSend={handleSend} />
      </div>
    </section>
  );
};


export default Chat;