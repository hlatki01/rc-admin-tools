# Rocket.Chat Admin Tools
A few tools that can help admins do a quick job :)

## Usage
You can host by cloning this repo or simply by going to https://rc-tools.guilhermeh.me

## Tools
Use your Rocket.Chat server together with admin credentials, you will be able to:

* Bulk delete users/departments/livechat rooms
* Bulk close livechat rooms
* Bulk disable users/departments
* Display disabled/enabled users/departments
* Display how many days a user is iddle
* Export users/departments/livechat rooms to xlsx, json, pdf, csv and html.

## Configuration
You will need to enable cors under Administration > General > REST API > Enable CORS also, you will have to set ```https://rc-tools.guilhermeh.me``` under Administration > General > REST API > CORS Origin (or your domain) 

## You can execute the following lines in order to update your server

`bash cd ~ &&
cd rc-admin-tools &&
docker-compose down &&
cd .. &&
sudo rm -r rc-admin-tools &&
git clone https://github.com/hlatki01/rc-admin-tools rc-admin-tools &&
cd rc-admin-tools &&
docker build . --no-cache && docker-compose up -d`

## Contributing
Pull requests are welcome, please make this code better! You can reach me on [Open](https://open.rocket.chat/direct/luis.hlatki)

## Warning
This repo is an experimental work, so use it wisely (I can't guarantee the code quality)

## License
[MIT](https://choosealicense.com/licenses/mit/)
