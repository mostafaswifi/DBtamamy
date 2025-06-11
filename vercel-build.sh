#!/bin/bash

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Build Next.js
npm run build