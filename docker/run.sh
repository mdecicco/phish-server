if [ ! -d "./node_modules" ]; then
    npm install && npm run build
fi

node ./server/index.js