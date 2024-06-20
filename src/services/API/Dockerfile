FROM node:20.10-alpine
WORKDIR /app

# Copy and download dependencies
COPY package*.json ./
RUN npm install -g nodemon
RUN if [ "$ENV" = "DEV" ] ; \
    then npm ci ; \
    else npm ci --only=production ;\
    fi

# Copy the source files into the image
COPY . .