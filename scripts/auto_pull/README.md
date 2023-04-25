# auto_pull

We assume a standard FoundryVTT install. Feel free to change paths if you changed standard install paths.

To install, replace ```__USER__``` with the user using the system in the ```.env``` file. Then run the ```install.sh``` script.

For example, if your user is named ```pi```:

```(bash)
sed -i 's/__USER__/pi/g' .env
source .env
sudo sh install.sh
```
