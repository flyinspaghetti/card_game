class Card {
  constructor(suit, rank) {
    this.suit = suit;
    this.rank = rank;
  }
}

class Deck {
  constructor() {
    this.cards = [];
    this.suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    this.ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    this.initializeDeck();
    this.shuffle();
  }

  initializeDeck() {
    for (const suit of this.suits) {
      for (const rank of this.ranks) {
        this.cards.push(new Card(suit, rank));
      }
    }
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  drawCard() {
    return this.cards.pop();
  }
}

class Player {
  constructor(name) {
    this.name = name;
    this.hand = [];
  }

  drawHand(deck) {
    for (let i = 0; i < 5; i++) {
      this.hand.push(deck.drawCard());
    }
  }

  playCard(index) {
    return this.hand.splice(index, 1)[0];
  }

  takeCard(card) {
    this.hand.push(card);
  }

  hasMatchingCard(topCard) {
    return this.hand.some(card => card.suit === topCard.suit || card.rank === topCard.rank);
  }

  hasActionCard() {
    return this.hand.some(card => card.rank === 'A' || card.rank === 'K' || card.rank === 'Q' || card.rank === 'J');
  }
}

class CardGame {
  constructor(numPlayers) {
    this.deck = new Deck();
    this.players = [];
    this.currentPlayerIndex = 0;
    this.direction = 1;
    this.drawPile = [];
    this.discardPile = [];
    this.numPlayers = numPlayers;
    this.initializePlayers();
    this.playGame();
  }

  initializePlayers() {
    for (let i = 1; i <= this.numPlayers; i++) {
      const playerName = `Player ${i}`;
      this.players.push(new Player(playerName));
    }
  }

  playGame() {
    console.log('--- Card Game Started ---');

    // Draw initial hand for each player
    for (const player of this.players) {
      player.drawHand(this.deck);
    }

    // Draw the first card for the discard pile
    this.discardPile.push(this.deck.drawCard());

    while (true) {
      const currentPlayer = this.players[this.currentPlayerIndex];

      console.log(`\nCurrent Player: ${currentPlayer.name}`);
      console.log(`Top Card on Discard Pile: ${this.discardPile[this.discardPile.length - 1].rank} of ${this.discardPile[this.discardPile.length - 1].suit}`);
      console.log(`Current Hand: ${this.getHandString(currentPlayer.hand)}`);

      if (currentPlayer.hasMatchingCard(this.discardPile[this.discardPile.length - 1])) {
          const index = this.getPlayerInput(`Enter index of the card to play (0-${currentPlayer.hand.length - 1}):`, 0, currentPlayer.hand.length - 1);
          const playedCard = currentPlayer.playCard(index);
          this.discardPile.push(playedCard);

          console.log(`Player ${currentPlayer.name} played ${playedCard.rank} of ${playedCard.suit}`);

          if (playedCard.rank === 'A') {
            console.log('Action: Skip');
            this.incrementCurrentPlayerIndex(2);
          } else if (playedCard.rank === 'K') {
            console.log('Action: Reverse');
            this.direction *= -1;
            this.incrementCurrentPlayerIndex();
          } else if (playedCard.rank === 'Q') {
            console.log('Action: Draw Two');
            this.incrementCurrentPlayerIndex();
            const nextPlayer = this.players[this.currentPlayerIndex];
            nextPlayer.drawHand(this.deck);
            nextPlayer.drawHand(this.deck);
          } else if (playedCard.rank === 'J') {
            console.log('Action: Draw One');
            this.incrementCurrentPlayerIndex();
            const nextPlayer = this.players[this.currentPlayerIndex];
            nextPlayer.drawHand(this.deck);
          }

          if (playedCard.rank === 'A' || playedCard.rank === 'K' || playedCard.rank === 'Q' || playedCard.rank === 'J') {
            console.log(`Current Hand for Player ${currentPlayer.name}: ${this.getHandString(currentPlayer.hand)}`);
          } else {
            this.incrementCurrentPlayerIndex();
          }
        } else {
          console.log(`Player ${currentPlayer.name} does not have a matching card. Drawing a card from the draw pile...`);
          const drawnCard = this.deck.drawCard();
          currentPlayer.takeCard(drawnCard);
          console.log(`Player ${currentPlayer.name} drew ${drawnCard.rank} of ${drawnCard.suit}`);
          this.incrementCurrentPlayerIndex();
        }

        if (currentPlayer.hand.length === 0) {
          console.log(`Player ${currentPlayer.name} has no cards left. They are the winner!`);
          break;
        }
      }

      console.log('--- Card Game Ended ---');
    }

    getPlayerInput(prompt, min, max) {
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      return new Promise(resolve => {
        rl.question(prompt, answer => {
          rl.close();
          const input = parseInt(answer);
          if (isNaN(input) || input < min || input > max) {
            console.log(`Invalid input. Please enter a number between ${min} and ${max}.`);
            resolve(this.getPlayerInput(prompt, min, max));
          } else {
            resolve(input);
          }
        });
      });
    }

    getHandString(hand) {
      return hand.map(card => `${card.rank} of ${card.suit}`).join(', ');
    }

    incrementCurrentPlayerIndex(steps = 1) {
      this.currentPlayerIndex = (this.currentPlayerIndex + (steps * this.direction) + this.players.length) % this.players.length;
    }
}

const numPlayers = parseInt(prompt('Enter the number of players (up to 4):'));
const game = new CardGame(numPlayers);
