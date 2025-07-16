# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Build the Next.js app
RUN npm run build

# Expose port 8080
EXPOSE 8080

# Set the port environment variable
ENV PORT 8080

# Start the app
CMD ["npm", "start"]
