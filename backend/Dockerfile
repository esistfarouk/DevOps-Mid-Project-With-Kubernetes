FROM python:3.10-alpine 

WORKDIR /app

# Copy the built dependencies from the backend-builder stage
COPY . .

#delet packages that causes vulnerabilities and not needed anymore
RUN pip uninstall -y setuptools==65.5.1 && pip uninstall -y pip==23.0.1 

EXPOSE 5000

CMD ["python", "src/app.py"]