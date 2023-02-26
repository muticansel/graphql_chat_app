import { PubSub } from "graphql-subscriptions";
import { Message } from "./db.js";

const pubsub = new PubSub();

function rejectIf(condition) {
  if (condition) {
    throw new Error("Unauthorized");
  }
}

export const resolvers = {
  Query: {
    messages: (_root, _args, { userId }) => {
      rejectIf(!userId);
      return Message.findAll();
    },
  },

  Mutation: {
    addMessage: async (_root, { input }, { userId }) => {
      rejectIf(!userId);
      const message = await Message.create({ from: userId, text: input.text });
      pubsub.publish("MESSAGE_ADDED", { messageAdded: message });
      return message;
    },
  },

  Subscription: {
    messageAdded: {
      subscribe: () => pubsub.asyncIterator("MESSAGE_ADDED"),
    },
  },
};
