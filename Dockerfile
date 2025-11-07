# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files (these should be at /app level)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy ALL source code
COPY . .

# Build the application
RUN npm run build

# Expose the port
EXPOSE 3001

# Start the application
CMD ["npm", "run", "start:prod"]
