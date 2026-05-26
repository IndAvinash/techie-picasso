# how I built techie picasso

hey! so I want to tell you about this project I made called techie picasso. it's basically a real-time whiteboard where you and your friends can draw, erase, and drop custom pins on the canvas at the exact same time.

here is how I made it

what I used
I wanted it to be fast so I used react and vite. I also used a library called react-konva for the drawing canvas. konva is cool because it lets you use html5 canvas like normal react components. 

for the syncing part I used Yjs and y-websocket. it handles all the real-time syncing automatically using math (CRDTs).

the backend is just normal node.js and express handling the websockets. to make it scale so it doesn't crash with too many users, I used redis pub/sub and an nginx load balancer. I also used postgresql to save the room data so your drawing doesn't delete if the server restarts.

why I chose crdt instead of ot
when I first looked into this, I saw a lot about operational transformation (OT) like google docs uses. but OT is really hard to make because the server has to fix conflicts if two people draw on the exact same pixel. instead, I used CRDTs (Yjs). with this, the clients fix the conflicts themselves and the server just passes the messages around. it made the backend way easier.

what nginx is doing
a single node.js server can only handle so many connections before it gets slow. so instead of one server, I run multiple copies of the backend (like on port 4001 and 4002). but then I needed a way to route users to them. that's where nginx comes in. nginx sits in front of the servers at port 8080 and acts like a traffic cop. when you connect to the app, nginx decides which backend server has the least work and sends your connection there. it's called load balancing and it makes the app handle way more people.

then redis . 
if I connect to server A and you connect to server B through nginx, I fixed this with redis pub/sub. if I draw on server A, server A shouts the update into a redis channel. server B is listening to that channel, hears the update, and sends it down the websocket to you.

saving stuff with postgresql
if the node server crashes or restarts, all the drawings would be deleted from memory forever. so I used postgresql to save the room data. but saving every single tiny mouse movement to the database instantly would completely crash it with too many writes. so I made it "debounce". it basically waits 2 seconds after you stop drawing before it takes a snapshot of the whole canvas state and saves it to postgres. I used prisma to talk to the database because writing raw sql queries is annoying.

cleaning up the code
at first my canvas.tsx file was huge, like over 200 lines handling everything. I recently refactored it and broke it into smaller pieces. now I have a header component, a toolbar component, and a pin toolbar component. the main canvas file just orchestrates everything now and is much cleaner.

cool features I added
- custom image pins: you can upload an image, it turns into a data url, and syncs across everyone's screen instantly. you can drag them around.

- the duplicate tab glitch: if someone opened the room in two tabs, it would glitch. I used Yjs awareness to track when a user joined, and if they join again from a new tab, it boots their old tab automatically.
yt overview - https://youtu.be/BpF0SgLkJk8

docs I used
if you want to look at the docs I used, here they are:

react-konva free drawing: 
https://konvajs.org/docs/react/Free_Drawing.html

react-konva images (for the pins):
https://konvajs.org/docs/react/Images.html

the eraser trick (globalCompositeOperation):
https://konvajs.org/docs/sandbox/Free_Drawing.html

redis pub/sub in node.js:
https://redis.io/docs/latest/develop/clients/nodejs/
https://github.com/redis/node-redis#pubsub

nginx load balancing (acting like the traffic cop):
https://nginx.org/en/docs/http/load_balancing.html

postgresql documentation:
https://www.postgresql.org/docs/

prisma (saving to postgres):
https://www.prisma.io/docs/orm/prisma-client/queries/crud

yjs (syncing canvas state):
https://docs.yjs.dev/api/document-updates

yjs awareness (for booting duplicate tabs):
https://docs.yjs.dev/api/about-awareness
