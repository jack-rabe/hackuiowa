FROM golang
COPY ./backend/ /home/backend
WORKDIR /home/backend
EXPOSE 3333
CMD [ "go", "run", "." ]
