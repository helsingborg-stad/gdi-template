# Builder image
FROM node:18 as builder

WORKDIR /usr/src/app

COPY yarn.lock tsconfig.json package*.json *.yml ./
COPY src ./src

RUN yarn install && yarn build

# Install dependencies

FROM node:18-alpine	as deps

WORKDIR /deps
COPY package.json .
COPY yarn.lock .
RUN yarn install --production --ignore-optional


# Create minimal production image from builder.
# FROM node:18-alpine
FROM gcr.io/distroless/nodejs:18
WORKDIR /usr/src/app

EXPOSE 80
ENV NODE_ENV=production
ENV PORT=80

COPY --from=deps /deps/node_modules /usr/src/app/node_modules/
COPY --from=deps /deps/package.json /usr/src/package.json
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/openapi.yml /usr/src/app/openapi.yml

CMD ["dist/index.js"]