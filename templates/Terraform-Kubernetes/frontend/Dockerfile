# frontend/Dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build

# Second stage
FROM node:18-alpine as runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .
EXPOSE 3000
CMD ["npm", "start"]
