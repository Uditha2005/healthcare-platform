FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3007
ENV PORT=3007
CMD sh -c 'echo "" && echo "  ✅ frontend-app is starting..." && echo "" && echo "  You can now view frontend-app in the browser." && echo "" && echo "    Local:  http://localhost:3007" && echo "" && exec npm start'