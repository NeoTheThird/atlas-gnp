# Atlas Neuropädiatrie DACH 2.0

A [map](https://atlas.gesellschaft-fuer-neuropaediatrie.org/) showing all Neuro-Paediatricians in Germany, Austria and Switzerland. Provided by the [GNP](https://gesellschaft-fuer-neuropaediatrie.org/).

Built using [openstreetmap](https://www.openstreetmap.org).

## Installing

Create a `.env`-File with your `GEO_API_KEY` ([MapQuest](https://developer.mapquest.com/)) and `GNP_API_KEY` ([VereinOnline](https://www.vereinonline.org/api)) in the root of the repository:

```
GEO_API_KEY=<MapQuest API key without brackets>
GNP_API_KEY=<VereinOnline API key without brackets>
```

These keys are secret and **must not be leaked to the public**. If they are ever exposed, they need to be revoked and changed in VereinOnline or MapQuest respectively.

Run `npm install`. Run `npm start` to serve on port `7000`.

Mapquest imposes heavy rate-limiting, so make sure you keep the `.geo-cache` file that the server generates in the root of the repository around.

## Deploying for production

The application is a fairly standard NodeJS express app and is very straightforward to install and maintain. The following is a simple example of how to serve the application using [nginx](https://nginx.org/) and [pm2](https://www.npmjs.com/package/pm2) on [ubuntu](https://ubuntu.com) and obtain a free SSL-certificate from [letsencrypt](https://letsencrypt.org/).

- Install the required tools: `sudo apt install nodejs npm git nginx`
- Clone the repository to a new directory on the server and navigate to it.
- Run `npm install` to install the depenencies
- Create the `.env` file with the API keys as described above
- Install the process manager: `npm install -g pm2`
- Start with pm2 with `pm2 start src/server.js` and keep it running with `pm2 startup systemd`
- Allow nginx to the firewall `sudo ufw allow 'Nginx HTTP'`
- Open the nginx config `sudo nano /etc/nginx/sites-available/default` and replace the `location` section with the following code:

```
location / {
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-NginX-Proxy true;
    proxy_pass http://localhost:7000;
    proxy_set_header Host $http_host;
    proxy_cache_bypass $http_upgrade;
    proxy_redirect off;
}
```

- Run `nginx -t` to verify the syntax and `sudo systemctl restart nginx` to apply the changes from systemd
- The atlas should now be served at `http://<ip address of the server>`

#### Connect a domain

- Point an `AAAA` (or `A`, if you're feeling whimsically retro) record for the desired domain or subdomain to the IP address
- Open the nginx config `sudo nano /etc/nginx/sites-available/default` again and replace the underscore (`_`) in the after the `server_name` with your domain
- Run `nginx -t` to verify the syntax and `sudo systemctl restart nginx` to apply the changes from systemd

#### Let's encrypt with letsencrypt

- Give nginx full permissions to the firewall: `sudo ufw allow 'Nginx Full' && sudo ufw delete allow 'Nginx HTTP'`
- Install certbot: `sudo add-apt-repository ppa:certbot/certbot && sudo apt update && sudo apt install python-certbot-nginx`
- Run certbot and answer the questions using common sense: `sudo certbot --nginx -d <your domain>`
- The website should now be served at `https://<your domain>`.
- Test the letsencrypt renewal using `sudo certbot renew --dry-run` and hope that there are no errors
- Set up a cron job to run `certbot renew` regularly

#### Finishing thoughts

You may also want to create a cron job (or incorporate it into the established update workflow in some other way) to regularly pull the changes from the repositories `origin master` and `npm install` the updated production dependencies.

## URL parameters

There are a couple options available as url parameters that can be used like `https://<url>/?parameter=value&otherParameter=otherValue` All of them are optional:

| Parameter | Default | Description |
|---|---|---|
| `lat` | 51 | Latitude to center the map on |
| `long` | 51 | Longitude to center the map on |
| `zoom` | 6 | Initial zoom level |
| `radius` | 45 | pixel radius for clustering |
| `embed` | false | use embed mode (hide logo, show fullscreen-button) |

## Embedding

The atlas can easily be embedded using an iFrame. The following is an example of a responsive iFrame that should work fine in WordPress:

```html
<iframe width="100%" height="100%" style="min-height: 30em;" src="https://atlas.spri.nz/?embed=true" frameborder="0"></iframe>
```
