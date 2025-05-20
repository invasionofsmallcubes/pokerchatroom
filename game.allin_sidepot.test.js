const Game = require('./game');
const User = require('./user');
const PokerDeck = require('./pokerDeck'); // Mocked
const WinnerCalculator = require('./winnerCalculator'); // Mocked

// Mock PokerDeck
let deckInstance;
jest.mock('./pokerDeck', () => {
  return jest.fn().mockImplementation(() => {
    let cards = [];
    let drawCount = 0;
    deckInstance = {
      drawTwoCards: jest.fn(() => {
        const hand = cards.slice(drawCount, drawCount + 2);
        drawCount += 2;
        return hand;
      }),
      drawThreeCards: jest.fn(() => {
        const flop = cards.slice(drawCount, drawCount + 3);
        drawCount += 3;
        return flop;
      }),
      drawOneCard: jest.fn(() => {
        const card = cards[drawCount];
        drawCount += 1;
        return card;
      }),
      resetDeck: jest.fn(() => {
        drawCount = 0;
      }),
      __setCards: (newCards) => {
        cards = [...newCards];
        drawCount = 0;
      },
    };
    return deckInstance;
  });
});

// Mock WinnerCalculator
const mockWinnerCalculatorInstance = {
  calculateWinningPlayer: jest.fn(),
};
jest.mock('./winnerCalculator', () => {
  return jest.fn().mockImplementation(() => mockWinnerCalculatorInstance);
});

describe('Game All-in and Side Pot Scenarios', () => {
  let owner;
  let game;
  let deckMock;

  beforeEach(() => {
    owner = User('gameOwner', 'owner123');
    
    if (deckInstance) {
        deckInstance.drawTwoCards.mockClear();
        deckInstance.drawThreeCards.mockClear();
        deckInstance.drawOneCard.mockClear();
        deckInstance.resetDeck.mockClear();
        if (deckInstance.__setCards) deckInstance.__setCards.mockClear();
    }
    mockWinnerCalculatorInstance.calculateWinningPlayer.mockReset();

    game = Game(owner, 'game1', new PokerDeck(), new WinnerCalculator(), { count: () => 0 });
    deckMock = deckInstance; // Use the auto-created mock instance
  });

  // Test Scenario 1: Single Player All-in, Multiple Callers, Simple Showdown
  test('Scenario 1: Single Player All-in, Multiple Callers', () => {
    const userA = User('UserA', 'uidA'); // P0
    const userB = User('UserB', 'uidB'); // P1
    const userC = User('UserC', 'uidC'); // P2

    game.addPlayer(userA); 
    game.addPlayer(userB); 
    game.addPlayer(userC); 

    game.players[0].money = 100; 
    game.players[1].money = 200; 
    game.players[2].money = 200; 
    
    deckMock.__setCards([
      'Ah', 'Ad', // P0 (UserA) - Wins
      'Kh', 'Kd', // P1 (UserB)
      'Qh', 'Qd', // P2 (UserC)
      '2c', '3d', '4s', '7h', '8c' 
    ]);
    
    // Start game: P0 dealer, P1 SB (5), P2 BB (10). P0 to act.
    game.bootstrapGame(owner); 
    
    game.raise(100, userA); // P0 all-in (100 total)
    game.call(userB); // P1 calls 100 (already put 5, adds 95)
    game.call(userC); // P2 calls 100 (already put 10, adds 90)
    
    // Manually advance to river end for showdown
    game.currentStep = 3; 
    mockWinnerCalculatorInstance.calculateWinningPlayer.mockReturnValueOnce([{ playerId: 0 }]); // P0 wins
    const finalState = game.calculateNextStep();

    expect(finalState.type).toBe('WINNING_MULTI_STATE');
    expect(game.pots.length).toBe(1);
    expect(game.pots[0].amount).toBe(300); // 100 (A) + 100 (B) + 100 (C)
    expect(game.pots[0].eligiblePlayers.map(p=>p.user.id)).toEqual(expect.arrayContaining([userA.id, userB.id, userC.id]));
    
    expect(game.players[0].money).toBe(300); // 100 - 100 + 300 = 300
    expect(game.players[1].money).toBe(100); // 200 - 100 = 100
    expect(game.players[2].money).toBe(100); // 200 - 100 = 100
  });

  // Test Scenario 2: Two Players All-in (Different Amounts), One Caller, Side Pots
  test('Scenario 2: Two Players All-in (Different Amounts), One Caller', () => {
    const userA = User('UserA', 'uidA'); // P0 - 50 chips
    const userB = User('UserB', 'uidB'); // P1 - 150 chips
    const userC = User('UserC', 'uidC'); // P2 - 300 chips

    game.addPlayer(userA);
    game.addPlayer(userB);
    game.addPlayer(userC);

    game.players[0].money = 50;
    game.players[1].money = 150;
    game.players[2].money = 300;

    deckMock.__setCards([
      'Ah', 'Ad', // P0 (UserA) - Wins main pot
      'Kh', 'Kd', // P1 (UserB) - Wins side pot
      'Qh', 'Qd', // P2 (UserC)
      '2c', '3d', '4s', '7h', '8c' 
    ]);

    // Start game: P0 dealer, P1 SB (5), P2 BB (10). P0 to act.
    // P0:50, P1:145 (bet 5), P2:290 (bet 10). Pool:15. highestBet:10. minRaise:10
    game.bootstrapGame(owner);

    // Actions to create the scenario:
    // P0 (UserA) raises to 50 (all-in)
    // P0.bet:0->50. P0.money:0. Pool:15+50=65. highestBet:50. minRaise=50-10=40.
    game.raise(50, userA); 
    expect(game.players[0].isAllIn).toBe(true);

    // P1 (UserB) calls 50. (Has 145, SB 5 already in). Puts 45 more.
    // P1.bet:5->50. P1.money:145-45=100. Pool:65+45=110.
    game.call(userB);

    // P2 (UserC) calls 50. (Has 290, BB 10 already in). Puts 40 more.
    // P2.bet:10->50. P2.money:290-40=250. Pool:110+40=150.
    // Betting round should end. P0, P1, P2 eligible for main pot of 150.
    game.call(userC); 
    
    // --- Next Betting Round (e.g. Flop) ---
    // Reset bets for current round, P1 is next to act (or P2 if P1 folded/all-in)
    // For test simplicity, let's assume it goes to next round.
    // calculateNextStep would normally deal flop, reset bets, set waitingPlayer.
    // game.currentStep is 0 (preflop). After calls, calculateNextStep will make it 1 (flop).
    // player.bet and highestBet get reset by calculateNextStep.
    let nextState = game.calculateNextStep(); // Deals flop, P1 to act
    expect(nextState.type).toBe('NEXT_STATE');
    expect(game.currentStep).toBe(1); // Flop
    expect(game.players[1].bet).toBe(0); // Bets reset for new round
    expect(game.players[2].bet).toBe(0);
    expect(game.highestBet).toBe(0);
    expect(game.minimumRaiseAmount).toBe(game.bigBlind); // Reset to big blind for new round

    // P1 (UserB) bets 100 (all-in)
    // P1.money:100. P1.bet:0->100. Pool:150+100=250. highestBet:100. minRaise:100.
    game.raise(100, userB); 
    expect(game.players[1].isAllIn).toBe(true);

    // P2 (UserC) calls 100
    // P2.money:250. P2.bet:0->100. Pool:250+100=350.
    game.call(userC);
    
    // Manually advance to river end for showdown
    game.currentStep = 3;
    
    // Define winners
    mockWinnerCalculatorInstance.calculateWinningPlayer
      .mockReturnValueOnce([{ playerId: 0 }]) // P0 (userA) wins Main Pot (150)
      .mockReturnValueOnce([{ playerId: 1 }]); // P1 (userB) wins Side Pot 1 (200)

    const finalState = game.calculateNextStep();

    expect(finalState.type).toBe('WINNING_MULTI_STATE');
    expect(game.pots.length).toBe(2);
    // Main Pot: 50 (A) + 50 (B) + 50 (C) = 150
    expect(game.pots[0].amount).toBe(150);
    expect(game.pots[0].eligiblePlayers.map(p=>p.user.id)).toEqual(expect.arrayContaining([userA.id, userB.id, userC.id]));
    // Side Pot 1: (150-50 from B) + (150-50 from C, assuming C matched B's 150 total bet)
    // P1 betInHandTotal = 5(SB) + 45(call) + 100(raise) = 150
    // P2 betInHandTotal = 10(BB) + 40(call) + 100(call) = 150
    // P0 betInHandTotal = 50(all-in)
    // Pot for P0's 50: P0(50)+P1(50)+P2(50) = 150
    // Pot for P1's next 100 (total 150): P1(100)+P2(100) = 200
    expect(game.pots[1].amount).toBe(200); 
    expect(game.pots[1].eligiblePlayers.map(p=>p.user.id)).toEqual(expect.arrayContaining([userB.id, userC.id]));
    
    // P0 (UserA) initial 50. Goes all-in for 50. Wins main pot (150). Final: 150.
    expect(game.players[0].money).toBe(150);
    // P1 (UserB) initial 150. Bets 150. Wins side pot (200). Final: 200.
    expect(game.players[1].money).toBe(200);
    // P2 (UserC) initial 300. Bets 150. Loses both. Final: 300-150 = 150.
    expect(game.players[2].money).toBe(150);
  });

  test('Scenario 3: Multiple All-ins, Folded Player, Dead Money', () => {
    const p1 = User('P1', 'uidP1'); // 50
    const p2 = User('P2', 'uidP2'); // 100
    const p3 = User('P3', 'uidP3'); // 200
    const p4 = User('P4', 'uidP4'); // 200

    game.addPlayer(p1); game.addPlayer(p2); game.addPlayer(p3); game.addPlayer(p4);
    game.players[0].money = 50; game.players[1].money = 100; game.players[2].money = 200; game.players[3].money = 200;

    deckMock.__setCards([
      'Ah', 'Ad', // P1 - wins main pot
      'Kh', 'Kd', // P2
      '2c', '3c', // P3 - folds
      'Qh', 'Qd', // P4 - wins side pot
      '7c', '8d', '9s', 'Th', 'Jc'
    ]);

    // P0(p1) dealer, P1(p2) SB 5, P2(p3) BB 10. P3(p4) UTG.
    // P1:50, P2:95(b5), P3:190(b10), P4:200. Pool:15. highestBet:10, minRaise:10
    game.bootstrapGame(owner);

    // P3 (p4) raises to 100
    // P3(p4).bet:0->100. P3.money:100. Pool:15+100=115. highestBet:100. minRaise=100-0=100 (or 100-10 if BB was prev highest)
    // The raise is 100. The amount to call was 10 (BB). So raise portion is 90. This becomes new minRaise.
    game.raise(100, p4); // P4 raises to 100. MinRaise becomes 90 (100-10).
    
    // P0 (p1) calls 50 (all-in)
    // P0.bet:0->50. P0.money:0. Pool:115+50=165. highestBet:100 (P4's bet). P1 is all-in.
    game.call(p1); // P1 calls, is all-in for 50.
    expect(game.players[0].isAllIn).toBe(true);

    // P1 (p2) calls 100 (all-in). (SB 5 already in, needs 95 more)
    // P1.bet:5->100. P1.money:0. Pool:165+95=260. P2 is all-in.
    game.call(p2);
    expect(game.players[1].isAllIn).toBe(true);
    
    // P2 (p3) folds. (BB 10 already in. Has contributed 10 to pool).
    // P3's 10 is part of poolPrize. betInHandTotal for P3 is 10.
    // The prompt scenario is slightly different: P3 calls 50 then P4 raises and P3 folds.
    // Let's adjust for simpler flow or follow prompt strictly.
    // Prompt: P1 bets 50 (all-in). P2 calls 50. P3 calls 50. P4 raises to 100. P2 calls 50 more (all-in). P3 folds.
    // Resetting for prompt flow:
    game.players[0].money = 50; game.players[1].money = 100; game.players[2].money = 200; game.players[3].money = 200;
    game.players.forEach(p => { p.bet = 0; p.betInHandTotal = 0; p.isAllIn = false; p.hasFolded = false; });
    game.poolPrize = 0; game.highestBet = 0; game.minimumRaiseAmount = game.bigBlind; game.currentStep = 0;
    // No blinds for this specific test setup to match prompt actions directly.
    // P1 bets 50 (all-in)
    game.raise(50, p1); // P1: 50 (all-in), Pool: 50, HB: 50, MinRaise: 50
    // P2 calls 50
    game.call(p2);    // P2: 50, Pool: 100, HB: 50
    // P3 calls 50
    game.call(p3);    // P3: 50, Pool: 150, HB: 50
    // P4 raises to 100
    game.raise(100, p4);// P4: 100, Pool: 150 - 50(P4's prev implied call) + 100 = 200. Actual: 150 + (100-0 for P4 if P4 was new actor, or 100-50 if P4 called 50 first)
                        // P4's total bet for round is 100. moneyToPot = 100. Pool: 150+100 = 250. HB:100. MinRaise=50 (100-50)
    // P2 calls 50 more (all-in, total 100)
    game.call(p2);    // P2.bet:50->100. moneyToPot=50. Pool: 250+50=300. P2 all-in.
    // P3 folds (has contributed 50)
    game.fold(p3);

    // Showdown: P1 (50), P2 (100), P4 (100). P3 folded (put in 50).
    // PoolPrize should be 50(P1) + 100(P2) + 50(P3) + 100(P4) = 300.
    expect(game.poolPrize).toBe(300);
    
    game.currentStep = 3; // Force River
    mockWinnerCalculatorInstance.calculateWinningPlayer
        .mockReturnValueOnce([{ playerId: 0 }]) // P1 wins Main Pot
        .mockReturnValueOnce([{ playerId: 3 }]); // P4 wins Side Pot 1

    const finalState = game.calculateNextStep();
    expect(finalState.type).toBe('WINNING_MULTI_STATE');

    // Main Pot: P1(50), P2(50), P3(50), P4(50) = 200. Eligible: P1, P2, P4. (P3's 50 is in this pot)
    // Side Pot 1: P2(50), P4(50) = 100. Eligible: P2, P4.
    expect(game.pots.length).toBe(2);
    expect(game.pots[0].amount).toBe(200);
    expect(game.pots[0].eligiblePlayers.map(p=>p.user.id)).toEqual(expect.arrayContaining([p1.id, p2.id, p4.id]));
    expect(game.pots[1].amount).toBe(100);
    expect(game.pots[1].eligiblePlayers.map(p=>p.user.id)).toEqual(expect.arrayContaining([p2.id, p4.id]));

    // P1: 50 (initial) - 50 (bet) + 200 (wins main) = 200
    expect(game.players[0].money).toBe(200);
    // P2: 100 (initial) - 100 (bet) + 0 (loses side) = 0
    expect(game.players[1].money).toBe(0);
    // P3: 200 (initial) - 50 (bet) + 0 (folded) = 150
    expect(game.players[2].money).toBe(150);
    // P4: 200 (initial) - 100 (bet) + 100 (wins side) = 200
    expect(game.players[3].money).toBe(200);
  });

  test('Scenario 4: All Players All-in Pre-flop (different amounts)', () => {
    const p1 = User('P1', 'uidP1'); // 20 (SB)
    const p2 = User('P2', 'uidP2'); // 50 (BB)
    const p3 = User('P3', 'uidP3'); // 100 (Dealer)

    game.addPlayer(p3); // Dealer (P0 in game.players)
    game.addPlayer(p1); // SB (P1 in game.players)
    game.addPlayer(p2); // BB (P2 in game.players)

    game.players[0].money = 100; // P3 (Dealer)
    game.players[1].money = 20;  // P1 (SB)
    game.players[2].money = 50;  // P2 (BB)

    deckMock.__setCards([
      'Ah', 'Ad', // P3 (Dealer) - wins side pot 2
      'Kh', 'Kd', // P1 (SB) - wins main pot
      'Qh', 'Qd', // P2 (BB) - wins side pot 1
      '2c', '3d', '4s', '7h', '8c' 
    ]);
    
    // P0(p3) Dealer, P1(p1) SB, P2(p2) BB. Action starts with P0(p3).
    // Blinds: P1(p1) posts 5 (has 15 left). P2(p2) posts 10 (has 40 left).
    // Pool: 15. P3 to act.
    game.bootstrapGame(owner);
    expect(game.players[1].betInHandTotal).toBe(5);
    expect(game.players[2].betInHandTotal).toBe(10);
    expect(game.poolPrize).toBe(15);

    // P3 (Dealer) goes all-in for 100.
    // P3.money:0. P3.bet:100. P3.betInHand:100. Pool:15+100=115. HB:100. MinRaise:90 (100-10).
    game.raise(100, p3); 
    expect(game.players[0].isAllIn).toBe(true);

    // P1 (SB) calls with remaining 15 (all-in, total bet 20).
    // P1.money:0. P1.bet:5->20. P1.betInHand:5+15=20. Pool:115+15=130. HB:100. P1 all-in.
    game.call(p1); 
    expect(game.players[1].isAllIn).toBe(true);

    // P2 (BB) calls with remaining 40 (all-in, total bet 50).
    // P2.money:0. P2.bet:10->50. P2.betInHand:10+40=50. Pool:130+40=170. HB:100. P2 all-in.
    game.call(p2);
    expect(game.players[2].isAllIn).toBe(true);
    
    expect(game.poolPrize).toBe(170); // 20(P1) + 50(P2) + 100(P3)

    game.currentStep = 3; // Force River for showdown logic
    
    mockWinnerCalculatorInstance.calculateWinningPlayer
      .mockReturnValueOnce([{ playerId: game.lookupPlayerIdx(p1) }]) // P1 wins Main Pot
      .mockReturnValueOnce([{ playerId: game.lookupPlayerIdx(p2) }]) // P2 wins Side Pot 1
      .mockReturnValueOnce([{ playerId: game.lookupPlayerIdx(p3) }]);// P3 wins Side Pot 2

    const finalState = game.calculateNextStep();
    expect(finalState.type).toBe('WINNING_MULTI_STATE');
    
    // Pots based on betInHandTotal: P1=20, P2=50, P3=100
    // Main Pot (cap P1=20): P1(20)+P2(20)+P3(20) = 60. Eligible: P1,P2,P3.
    // Side Pot 1 (cap P2=50, P1 already out): P2(30)+P3(30) = 60. Eligible: P2,P3.
    // Side Pot 2 (cap P3=100, P1,P2 already out): P3(50) = 50. Eligible: P3.
    expect(game.pots.length).toBe(3);
    expect(game.pots[0].amount).toBe(60);
    expect(game.pots[0].eligiblePlayers.map(p=>p.user.id)).toEqual(expect.arrayContaining([p1.id, p2.id, p3.id]));
    expect(game.pots[1].amount).toBe(60);
    expect(game.pots[1].eligiblePlayers.map(p=>p.user.id)).toEqual(expect.arrayContaining([p2.id, p3.id]));
    expect(game.pots[2].amount).toBe(50);
    expect(game.pots[2].eligiblePlayers.map(p=>p.user.id)).toEqual(expect.arrayContaining([p3.id]));

    // P1 (idx 1): 20 initial - 20 bet + 60 (main pot) = 60
    expect(game.players[1].money).toBe(60);
    // P2 (idx 2): 50 initial - 50 bet + 60 (side pot 1) = 60
    expect(game.players[2].money).toBe(60);
    // P3 (idx 0): 100 initial - 100 bet + 50 (side pot 2) = 50
    expect(game.players[0].money).toBe(50);
  });
});
