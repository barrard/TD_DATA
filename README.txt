running the auth server
https://www.stefanbruhns.tech/td-ameritrade-apis/

better command for making the ssl certs
mkdir keys && cd keys && openssl req -x509 -sha256 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365

point browser to 
https://auth.tdameritrade.com/auth?response_type=code&redirect_uri=https%3A%2F%2Flocalhost%3A8443&client_id=BARRARD%40AMER.OAUTHAP





