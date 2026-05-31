# Splittr

Splittr is an expense splitting, progressive web app (PWA), designed primarily as a mobile application. "But you're using VueJs and Tailwind! How is this going to run on my phone outside the browser?!"

Well, Capacitor allows me to bundle my entire dist folder as a Swift project, while also giving me access to native iphone APIs so that I can actually use the phone's unique stuff, such as the native Camera during receipt scanning!

Now lets talk stack

## Tech Stack
- VueJs
- TailwindCss
- Supabase
- Capacitor

Yes, thats basically my tech stack.

Also yes, I'm calling the database directly from your client, SECURELY, thanks to Supabase's row level security (RLS).

## Features
1. **Group Creation:** You can create groups, and then invite your friends to said group! Then, add and split as many expenses as your heart desires.

2. **Expense Creation:** You can create expenses (duh)! Add expenses to your gorup to later be split amongst them.

3. **The Splits:** Enjoy up to 3 different ways to split any/all expenses. Either split equally amongst all group members, or split manually (great when someone basically wants to order the entire restaurant), or split via bill scanning (more on that later).

4. **Scan the Bill:** Don't want to enter each bill item by hand? That's alright, just scan the bill with Splittr and choose which group member ordered. Press "Confirm", and the bill is in fact, split.

## Running Locally
To run locally, you will need to set up supabase following the local database types. For the env, you'll need:

```
VITE_SUPABASE_URL=xxxx
VITE_SUPABASE_PUBLISHABLE_KEY=xxxx
```

And that's it! Just run these commands:

```
npm install
npm run dev
```

and you're project should be up and running. :)

## Running on iOS / Android:
Since Capacitor provides both an android and iOS runtime, you should be able to bundle the app for either target.

For iOS, just run the following:

```
npm run update-ios-build
npm run open-ios-build
```

This will build the project into a buncha static files, then Capacitor will bundle it for iOS, and then finally, will open the bundle in XCode to be ran.

Unfortunately, since I'm on Mac, I couldn't test nor set up an Android runtime ;-; but given you don't face any ridiculous errors, it should work fine on android as well.

## Demos
Okay SO. Considering that not everyone has an iphone and that not everyone is going to be willing to build the project, I've recorded a short demo of the app running on my phone:

[Demo Link](https://drive.google.com/file/d/1WNVobutj3XbZb95IQO9THOMksE20HxxD/view?usp=sharing)

Check it out!

## AI Usage
I initially used AI to write the readme, but I've rewritten the whole thing myself now :D

I also used AI for debugging the invites section, but yeah that's about it.