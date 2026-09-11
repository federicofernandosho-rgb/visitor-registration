# Visitor Registration

Server-ready visitor registration application with backend authentication, role-based access, and server-side record storage. It can use MySQL when database settings are configured, or JSON files for simple local testing.

## Run Locally

```powershell
npm install
npm start
```

Then open:

```text
http://localhost:3001
```

The first time the app runs, it asks you to create the first Super Admin user. Users can have one of these roles:

- Super Admin: can create users, change roles, and edit records/photos.
- Data Entry: can create, edit, and save records, and upload photos.
- Read Only: can view records, open photo modals, navigate records, and generate reports.

## MySQL Setup

1. Create the database and tables by running:

```bash
mysql -u root -p < schema.sql
```

If you already created the database before the Super Admin role was added, run:

```bash
mysql -u root -p < migration-admin-role.sql
```

To create or reset the default Super Admin login, run:

```bash
mysql -u root -p < create-super-admin.sql
```

Default Super Admin:

```text
Username: admin
Password: admin123
```

2. Create a MySQL user, or use an existing one that has access to `visitor_registration_db`.

Example:

```sql
CREATE USER 'visitor_registration_user'@'%' IDENTIFIED BY 'change_this_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON visitor_registration_db.* TO 'visitor_registration_user'@'%';
FLUSH PRIVILEGES;
```

3. Copy `.env.example` to `.env` and edit the database connection values:

```text
DB_HOST=your_mysql_server_ip
DB_PORT=3306
DB_USER=visitor_registration_user
DB_PASSWORD=your_password
DB_NAME=visitor_registration_db
```

4. Start the app:

```bash
npm start
```

If `DB_HOST` is set, the backend uses MySQL. If `DB_HOST` is missing, it uses JSON files.

## JSON Server Data

When MySQL is not configured, the backend stores data in:

```text
data/users.json
data/records.json
data/secret.txt
```

Back up the `data` folder regularly. Do not publish `data/secret.txt`.

## Deploy

Copy the project folder to your server, install Node.js 18 or newer, then run:

```bash
npm install
npm start
```

Optional environment variables:

```bash
PORT=3001
HOST=0.0.0.0
```

## Windows Service Deployment With NSSM

For Windows Server service installation, use:

```powershell
.\deployment\Install-VisitorRegistrationService.ps1
```

Full instructions are in:

```text
deployment\DEPLOYMENT-NSSM.md
```

If NSSM is not installed in PATH, put `nssm.exe` here before running the install script:

```text
tools\nssm\nssm.exe
```

## Keep Changes & Deploy (recommended)

To preserve your changes and deploy the app to your server, follow these steps on your development machine and on the target server.

1. Commit your local changes locally:

```bash
git add -A
git commit -m "Configure Visitor Registration deployment"
```

2. Push to your remote (replace `origin` and `main` if different):

```bash
git push origin main
```

3. On the production server, clone or pull the repo and install dependencies:

```bash
git clone <your-repo-url> /opt/visitor-registration || (cd /opt/visitor-registration && git pull)
cd /opt/visitor-registration
npm install --production
```

4. Start the app with a process manager so it restarts on crash or reboot.

Using pm2 (recommended):

```bash
npm install -g pm2
pm2 start server.js --name visitor-registration --env production -- PORT=3001
pm2 save
pm2 startup
```

Using systemd (example service unit): create `/etc/systemd/system/visitor-registration.service` with:

```ini
[Unit]
Description=Visitor Registration Service
After=network.target

[Service]
WorkingDirectory=/opt/visitor-registration
ExecStart=/usr/bin/node server.js
Restart=always
Environment=PORT=3001
Environment=NODE_ENV=production
User=www-data

[Install]
WantedBy=multi-user.target
```

Then enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable visitor-registration
sudo systemctl start visitor-registration
sudo journalctl -u visitor-registration -f
```

5. Preserve runtime data: back up the `data/` folder regularly (it contains `users.json`, `records.json`, `secret.txt`).

6. Rollbacks and updates: pull latest changes on the server and restart pm2 or systemd:

```bash
cd /opt/visitor-registration && git pull && npm install
pm2 restart visitor-registration   # or: sudo systemctl restart visitor-registration
```

The included `deploy.sh` script automates these steps.
