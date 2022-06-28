cd ~ &&
cd rc-admin-tools &&
docker compose down &&
cd .. &&
sudo rm -r rc-admin-tools &&
git clone https://github.com/hlatki01/rc-admin-tools rc-admin-tools &&
cd rc-admin-tools &&
docker build . --no-cache && docker compose up -d