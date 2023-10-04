FROM mcr.microsoft.com/devcontainers/typescript-node:1-20-bullseye

# Create and run commands in /app inside the container
WORKDIR /app

# Install pip
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3-pip

# Copy the required files into the working directory
COPY /api/ /app/api/

# Install the Python dependencies
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --upgrade pip && \
    pip install -r api/requirements.txt

# Build UI
COPY /ui/ /app/ui/
WORKDIR /app/ui
RUN yarn install && yarn build

# Create and use a non-root user
RUN useradd -m appUser
USER appUser

# expose port 8000
EXPOSE 8000

# Serve the app on port 8000
WORKDIR /app/api
CMD uvicorn --host 0.0.0.0 --port 8000 main:app
