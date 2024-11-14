FROM archlinux
WORKDIR /app
RUN pacman -Syu --noconfirm && \
    pacman -S git chromium nodejs npm unrar python base-devel --noconfirm && \
    git clone https://github.com/mdecicco/phish-server.git
COPY ./run.sh /app/phish-server
WORKDIR /app/phish-server
EXPOSE 6169
CMD ./run.sh

