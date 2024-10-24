extract an archive from asset and another inputs from user

TO RUN:

1. Install the necessary dependencies (including both regular and dev dependencies):
npm install

2.  build the server and client code and start the production server:
npm start

3. Open a client (on a browser open): 
http://localhost:3000/search



--------------------------------------------------

Doeckerize:

1. docker build --no-cache -t extended-search .
2. docker run -p 3000:3000 extended-search