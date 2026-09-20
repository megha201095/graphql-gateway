// Mock Data Store for Boilerplate Setup
const usersData = [
  { id: '1', name: 'Alice Smith', email: 'alice@example.com' },
  { id: '2', name: 'Bob Jones', email: 'bob@example.com' }
];

export const resolvers = {
  Query: {
    users: () => usersData,
    user: (_: any, { id }: { id: string }) => usersData.find(user => user.id === id),
  },
  Mutation: {
    createUser: (_: any, { name, email }: { name: string; email: string }) => {
      const newUser = { id: String(usersData.length + 1), name, email };
      usersData.push(newUser);
      return newUser;
    }
  }
};
