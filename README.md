# Website
Website code for dgraph.io. The best way to run this would be inside a docker container.

## Installation

1. Install docker from [here](https://docs.docker.com/engine/installation)

  For OS X this would mean installing the Docker toolbox and running a docker machine.

2. Modify Nginx configuration - Once you have docker running, you need to modify the `http` block in nginx/nginx.conf to

  ```
  http {
    include mime.types;

    server {
      server_name 127.0.0.1;
      location / {
        root /data;
      }
      location /query {
        proxy_pass http://dgraph.io;
      }
    }
  }
  ```

  This would make sure all your queries are reverse proxied to `http://dgraph.io` and your assets are served from within the data directory. Don't modify the `events` key in this file.


3. Run nginx via:
```
docker run -p 81:80 -v $SOURCE_DIR/website/app:/data -v $SOURCE_DIR/website/nginx:/etc/nginx -i -t nginx
```

  where `$SOURCE_DIR` is the path to source directory where this repository is cloned. This command would mount `/app` and `/nginx` from your machine to relevant volume inside the container. It also maps port 81 of your machine to port 80 within the container.

Now the website should be visible on `localhost:81` for linux machines or `$IP/81` where $IP is the IP address of the docker machine on Mac.
