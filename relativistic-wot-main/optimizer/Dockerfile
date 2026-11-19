FROM python:3.9

WORKDIR /app

RUN pip install matplotlib scipy numpy flask

COPY . /app

EXPOSE 5000
ENV FLASK_APP "server.py"
ENV LC_ALL C.UTF-8
ENV LANG C.UTF-8
ENTRYPOINT ["python", "-m", "flask", "run", "--host=0.0.0.0"]
