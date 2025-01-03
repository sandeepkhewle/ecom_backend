# Use the official Node.js image as the base image
FROM node:20

# Create and set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Install PM2 globally
RUN npm install pm2 -g

# Expose the port the application runs on
EXPOSE 3000

# Start the application with PM2
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
