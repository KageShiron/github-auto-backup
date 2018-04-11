# GitHub Auto Backup
git@github.com:KageShiron/github-auto-backup.git

* Backup repos pushed in last 7 days
* Backup every repos at the beginning of the month ( 1 <= date <= 7)

# Environmental Variables
* **USERNAME** Your Username
* **TOKEN** Personal Access Token of `repo` scope (https://github.com/settings/tokens/)
* **UPLOAD_URL** Upload endpoint. `{FileName}` will be replaced by filename.
* **BACKUP_MODE**
    * `all` All repositories