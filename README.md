# MageTerra

MageTerra is a multiplayer real-time board game. Players place down dominoes to create their own kingdom. The objective is to connect the dominoes and form areas to earn points. At the start of each round, based on a scoring system, players take turns choosing a domino to place. The player with the highest score at the end of the game wins.

## Features

- Open & Private rooms: Players can engage in matches with randomly matched opponents or create their own rooms to play with friends.
- Choose your avatar and name: There are several high quality avatars you can choose from to play as.
- Real-time gameplay: Experience seamless real-time gameplay with Firebase Realtime Database.
- Core mechanics: Strategically place dominoes to maximize points by creating interconnected areas.
- Arcane system: Always keep track of arcanes, they decide who gets to pick the best dominoes first!
- Score tracking & mini-boards: You can see each player's score, and their kingdoms throughout the game.
- Responsive: Play on mobile, desktop

## Technologies Used

- React
- Next.js
- Tailwind CSS
- Firebase: Realtime Database, Functions and Hosting
- React-dnd: This essential library provides the game's core mechanic, the drag and drop of the dominoes.

## Getting Started

To run MageTerra locally, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/mage-terra.git
   ```

2. Navigate to the project directory:

```bash
cd mage-terra
```

3. Install dependencies:

```bash
npm install
```

3. Set up Firebase:

   - Create a Firebase project and configure it for web.
   - Copy your Firebase configuration (apiKey, authDomain, projectId, etc.) and replace it in the Firebase config file.

4. Start the development server:

```bash
npm run dev
```

5. Open your browser and navigate to http://localhost:3000 to experience MageTerra!

## Contact & Credits

- The beautiful illustrations were made by Adrienn Kovacs ([Behance](https://www.behance.net/adriennkovcs2)).
- You can reach me on ([GitHub](https://github.com/SLorant)), ([LinkedIn](https://www.linkedin.com/in/l%C3%B3r%C3%A1nt-sutus-a32123238/)), or [email](mailto:contact.mageterra@gmail.com).

## License

This project is licensed under the MIT License.
