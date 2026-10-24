FROM node:20-alpine

WORKDIR /app

# Copy package manifests
COPY package*.json ./
COPY Backend_app/package*.json ./Backend_app/
COPY frontend_app/package*.json ./frontend_app/

# Install dependencies
RUN cd Backend_app && npm install
RUN cd ../frontend_app && npm install

# Copy source code
COPY . .

# Build frontend into frontend_app/dist
RUN cd frontend_app && npm run build

# Default port for free container hosts (Hugging Face / Koyeb / Cloud)
ENV PORT=7860
ENV NODE_ENV=production
ENV DB_TYPE=postgres

EXPOSE 7860

# Start the unified backend & static frontend server
CMD ["node", "Backend_app/index.js"]
