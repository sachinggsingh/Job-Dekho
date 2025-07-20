FROM node:18-slim

WORKDIR /app

# Copy only package.json and package-lock.json first (for better layer caching)
COPY package*.json ./

RUN npm install

# Now copy the rest of the source code
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
