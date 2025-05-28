FROM nginx:stable-alpine

# update libxml2 to fix vulnerabilities
RUN apk update && apk upgrade --no-cache

COPY --from=build /frontend/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]