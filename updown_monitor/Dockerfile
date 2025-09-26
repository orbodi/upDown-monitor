# Stage 1: Base build stage
FROM python:3.13-slim AS builder

RUN mkdir /app
WORKDIR /app

# Prevents Python from writing pyc files to disc
# and ensures that Python output is sent straight to terminal (e.g. your container log)
ENV PYTHONDONTWRITEBYTECODE=1

#  Prevents Python from buffering stdout and stderr
ENV PYTHONUNBUFFERED=1 

RUN pip install --upgrade pip 

COPY requirements.txt /app/

RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Production stage
FROM python:3.13-slim

# Install ping utility
RUN apt-get update && apt-get install -y iputils-ping && rm -rf /var/lib/apt/lists/*

# Create a non-root user to run the application
RUN useradd -m -r appuser && \
   mkdir /app && \
   chown -R appuser /app

# Copy only the necessary files from the builder stage
COPY --from=builder /usr/local/lib/python3.13/site-packages/ /usr/local/lib/python3.13/site-packages/
COPY --from=builder /usr/local/bin/ /usr/local/bin/

WORKDIR /app

# Copy the application code
COPY --chown=appuser:appuser . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1

#  Prevents Python from buffering stdout and stderr
ENV PYTHONUNBUFFERED=1 

# Change to the non-root user
USER appuser

# Expose the port the app runs on
EXPOSE 8000 

# Start the application using Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "updown_monitor.wsgi:application"]
