# Build Stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build
 
# Production Stage
FROM nginx:stable-alpine AS production

# update libxml2 to fix vulnerabilities
RUN apk update && apk upgrade --no-cache

COPY --from=build /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]