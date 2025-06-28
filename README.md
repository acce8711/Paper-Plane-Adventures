# 🛩️ Paper Plane Adventures – A Two Player Game Between Desktop and Mobile

A two-player game where one person plays on desktop and the other on mobile. Work together or compete by flying paper airplanes through hoops.

## Overview

This project was created as part of a two-week assignment for a third-year design studio course, where we explored networked multiplayer experiences using the [A-Frame](https://aframe.io/) framework.

I was inspired by the game [Lifeslide](https://store.steampowered.com/app/956140/Lifeslide/) and wanted to make a simple flying game based on paper airplanes.

There are two modes:

- **Collaborative Mode**
  - Players share one airplane.
  - Mobile player tilts phone to move up and down.
  - Desktop player clicks buttons to move left and right.
  - The goal is to pass through hoops together.

- **Competitive Mode**
  - Each player controls their own airplane.
  - Mobile player is limited to up and down movement.
  - Desktop player is limited to left and right movement.
  - Ghost planes and hoops show the opponent’s position.
  - The goal is to score more points than the other player.

### Supported Devices

This experience requires two players, one on mobile and one on desktop.

### Technologies Used

- JavaScript  
- HTML  
- CSS  
- Node.js  
- VS Code  
- [A-Frame](https://aframe.io/)  
- [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) (via [socket.io](https://socket.io/))

## 🧾Setup Instructions

This project is not hosted online at the moment. In the meantime, you can run it locally by following the steps below:

1. Download and install [Git](https://git-scm.com/downloads)  
2. Download and install [Node.js](https://nodejs.org/en/download)  
3. Open your terminal and run the following commands to clone the repository and navigate to it:
   - `git clone https://github.com/acce8711/Assignment3-IMD3901B.git`
   - `cd Assignment3-IMD3901B`
4. Run the following commands in the same terminal to start the server:
   - `npm install`
   - `node app.js`
5. Create an [Ngrok](https://dashboard.ngrok.com/get-started/setup/windows) account
6. Open a new terminal and install ngrok by following the instructions on the Ngrok web dashboard under Getting started --> Setup & Installation
   
   ![image](https://github.com/user-attachments/assets/495bde99-8b49-44c5-8431-546d91d6d812)
   
    **Windows users**: Make sure to open a new terminal as administrator
8. Create an ngrok tunnel to share your local server on the internet by running these commands in the **same terminal window you opened in step 6**:
   - `./ngrok.exe config add-authtoken {your Authtoken}` (Your authoken should be visible on the Ngrok web dashboard under Getting started --> Setup & Installation)
   - `./ngrok.exe http http://localhost:8080`
9. Open the game on both your desktop and phone by clicking the link that the commands from step 7 generate. The link should end with `ngrok-free.app`
10. You're all set! Choose a mode and follow the instructions on screen

## 🚧 What Was Challenging

The hardest part was running into frame rate differences. My phone and computer both run at 60fps, so syncing looked fine. But when I tested it with a classmate’s 120fps device, their airplane moved too fast. To fix this, I looked at A-Frame’s source code and how they use the `tick()` function in the `wasd-controls` component. I realized I could scale movement using the built-in `deltaTime` value. After implementing that, movement synced properly across devices with different frame rates.

## ✅ What Went Well

I'm happy with how the ghost plane and ghost hoops turned out in competitive mode. They were extra features I wasn’t sure I’d have time to finish, but I managed to get them working and I think they help show the other player's position in a clear and non-intrusive way.

## 🎨 Assets and Attributions
See the full list of assets used in this project in the ASSETS.md file.

## 📚 Credits

This project was developed as part of a third-year design studio course (IMD3901B) in the [Interactive Multimedia and Design](https://bitdegree.ca/index.php?Program=IMD&Section=Home) program.
