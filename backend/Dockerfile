FROM python:3.10-alpine AS builder

WORKDIR /app

COPY requirements.txt .

# RUN pip install --no-cache-dir -r requirements.txt
RUN pip install -r requirements.txt

COPY . .

FROM python:3.10-alpine AS runtime

WORKDIR /app

# Copy the built dependencies from the backend-builder stage
COPY --from=builder /usr/local/lib/python3.10/site-packages/ /usr/local/lib/python3.10/site-packages/

# Copy the application code from the backend-builder stage
COPY --from=builder /app /app

EXPOSE 5000

CMD ["python", "app.py"]