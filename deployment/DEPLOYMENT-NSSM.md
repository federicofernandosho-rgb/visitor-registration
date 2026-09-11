# Windows NSSM Deployment — Visitor Registration Server

This package runs the Visitor Registration app as a Windows service using NSSM.
All Node.js dependencies are **pre-bundled** — no internet access or `npm install` required on the server.

> [!NOTE]
> This installs **VisitorRegistration** as an independent Windows service running on port **3001**. Existing running services (such as InmateProfile) operate side-by-side without interference.

## Server Requirements

| Requirement | Details |
|---|---|
| OS | Windows Server (any modern version) |
| Node.js | 18 or newer (`node.exe` in PATH or `C:\Program Files\nodejs`) |
| NSSM | Already installed on the server at `C:\ManageViteSites\nssm.exe` |
| MySQL | Reachable at `pims:3308`, database `visitor_registration_db` |

## Deployment Steps

### 1. Copy the Folder

Copy the entire deployment package to `C:\inetpub\VisitorRegistrationServer-Deploy` on the target server:

```text
C:\inetpub\VisitorRegistrationServer-Deploy
```

The folder contains:

```
VisitorRegistrationServer-Deploy\
  app.js
  index.html
  styles.css
  server.js
  package.json
  package-lock.json
  .env                   ← pre-configured for pims / port 3001 / MySQL
  node_modules\          ← pre-bundled (no npm install needed)
  data\                  ← created automatically on first run
  logs\                  ← created automatically on first run
  schema.sql
  migration-admin-role.sql
  create-super-admin.sql
  deployment\
    Install-VisitorRegistrationService.ps1
    Start-VisitorRegistrationService.ps1
    Stop-VisitorRegistrationService.ps1
    Uninstall-VisitorRegistrationService.ps1
    nginx.visitor_registration.conf
    DEPLOYMENT-NSSM.md
  tools\
    nssm\
      nssm.exe
      PUT_NSSM_EXE_HERE.txt
```

### 2. Verify `.env`

The `.env` file is pre-configured:

```ini
PORT=3001
HOST=0.0.0.0

DB_HOST=pims
DB_PORT=3308
DB_USER=root
DB_PASSWORD=r00t@xs431u
DB_NAME=visitor_registration_db
DB_CONNECTION_LIMIT=10
```

No changes needed unless database credentials change.

### 3. Run the MySQL Schema (first time only)

The `visitor_registration_db` database is already set up on `pims:3308`. If resetting or initializing from scratch:

```powershell
Get-Content .\schema.sql | mysql -h pims -P 3308 -u root -p
Get-Content .\migration-admin-role.sql | mysql -h pims -P 3308 -u root -p
Get-Content .\create-super-admin.sql | mysql -h pims -P 3308 -u root -p
```

Default super-admin credentials:

```
Username: admin
Password: admin123
```

### 4. Create the NSSM Service (Manual or Script)

#### Option A: Run the Included PowerShell Script (Recommended)

Open **PowerShell as Administrator** on the `pims` server and run:

```powershell
cd C:\inetpub\VisitorRegistrationServer-Deploy
.\deployment\Install-VisitorRegistrationService.ps1
```

#### Option B: Manual NSSM Commands

Open **PowerShell as Administrator** on the `pims` server and run:

```powershell
nssm install VisitorRegistration "C:\Program Files\nodejs\node.exe" "C:\inetpub\VisitorRegistrationServer-Deploy\server.js"
nssm set VisitorRegistration AppDirectory "C:\inetpub\VisitorRegistrationServer-Deploy"
nssm set VisitorRegistration AppStdout "C:\inetpub\VisitorRegistrationServer-Deploy\logs\service-output.log"
nssm set VisitorRegistration AppStderr "C:\inetpub\VisitorRegistrationServer-Deploy\logs\service-error.log"
nssm set VisitorRegistration AppRotateFiles 1
nssm set VisitorRegistration AppRotateOnline 1
nssm set VisitorRegistration AppRotateBytes 10485760
nssm set VisitorRegistration Start SERVICE_AUTO_START
nssm set VisitorRegistration DisplayName "Visitor Registration"
nssm set VisitorRegistration Description "Visitor Registration Node.js web application"
```

Create the logs directory first if it doesn't exist:

```powershell
New-Item -ItemType Directory -Path "C:\inetpub\VisitorRegistrationServer-Deploy\logs" -Force
```

Then start the service:

```powershell
nssm start VisitorRegistration
```

### 5. Verify

Open a browser and navigate to:

```
http://pims:3001
```

## Service Management

```powershell
# Start
nssm start VisitorRegistration

# Stop
nssm stop VisitorRegistration

# Restart
nssm restart VisitorRegistration

# Remove service (if needed)
nssm remove VisitorRegistration confirm
```

Or use the included scripts:

```powershell
cd C:\inetpub\VisitorRegistrationServer-Deploy
.\deployment\Start-VisitorRegistrationService.ps1
.\deployment\Stop-VisitorRegistrationService.ps1
.\deployment\Uninstall-VisitorRegistrationService.ps1
```

## Log Files

```
C:\inetpub\VisitorRegistrationServer-Deploy\logs\service-output.log   ← stdout
C:\inetpub\VisitorRegistrationServer-Deploy\logs\service-error.log    ← stderr (errors here)
```

## Notes

- `node_modules` is pre-bundled — **no internet access required on the server**.
- The `.env` file is read on startup by `server.js` directly (no `dotenv` package needed).
- The `data\` folder stores a JWT secret on first run — do **not** delete it or all sessions will be invalidated.
- If you move the folder to a different path, update the `AppDirectory` and log paths in NSSM accordingly.

