FROM golang
COPY ./backend/ /home/backend
WORKDIR /home/backend
RUN ["go", "get"]
EXPOSE 3333
CMD [ "go", "run", "." ]
