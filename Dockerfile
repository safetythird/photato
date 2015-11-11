FROM python:2.7
ENV PYTHONUNBUFFERED 1
# Install NodeJS and the webapp dependencies
RUN curl --silent --location https://deb.nodesource.com/setup_4.x | bash -
RUN apt-get install -y nodejs
ENV PATH $PATH:/nodejs/bin
RUN npm install -g browserify watchify stringify eslint eslint-plugin-react

# Install Python dependencies
WORKDIR /app
ADD requirements.txt /app/
RUN pip install -r requirements.txt
ADD . /app/

ENTRYPOINT ["/app/entrypoint.sh"]