import { PrismaClient } from '@prisma/client'

import { createServer } from "http";
import express from "express";
import { ApolloServer, gql } from "apollo-server-express";
const startServer = async () => { 

  // 2
  const app = express()
  const httpServer = createServer(app)

  // 3
  const typeDefs = gql`
    type Query {
      hello: String
    }
  `;

  // 4
  const resolvers = {
    Query: {
      hello: () => 'Hello world!',
    },
  };

  // 5
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  })

  // 6
  await apolloServer.start()

  // 7
  apolloServer.applyMiddleware({
      app,
      path: '/api'
  })

  // 8
  httpServer.listen({ port: process.env.PORT || 4000 }, () =>
    console.log(`Server listening on localhost:4000${apolloServer.graphqlPath}`)
  )
}

startServer()

const prisma = new PrismaClient()

async function main() {
    await prisma.user.create({
      data: {
        name: 'Alice',
        email: 'alice@prisma.io',
        posts: {
          create: { title: 'Hello World' },
        },
        // profile: {
        //   create: { bio: 'I like turtles' },
        // },
      },
    })
  
    const allUsers = await prisma.user.findMany({
      include: {
        posts: true,
        // profile: true,
      },
    })
    console.dir(allUsers, { depth: null })
  }
  
main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })