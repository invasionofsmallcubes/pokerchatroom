const Game = require('./game');
const User = require('./user');
const PokerDeck = require('./pokerDeck'); // Using real deck for simplicity, specific cards not crucial
const WinnerCalculator = require('./winnerCalculator'); // Real one, not used in these tests primarily

describe('Game Minimum Raise Rules Scenarios', () => {
  let owner;
  let game;
  let userP1, userP2, userP3, userP4; // Players

  beforeEach(() => {
    owner = User('gameOwner', 'ownerRaiseTest');
    // Using real deck and winner calculator as specific outcomes aren't the focus
    game = Game(owner, 'gameRaiseTest1', new PokerDeck(), new WinnerCalculator(), { count: () => 0 });

    userP1 = User('Player1', 'uidP1');
    userP2 = User('Player2', 'uidP2');
    userP3 = User('Player3', 'uidP3');
    userP4 = User('Player4', 'uidP4'); // For tests needing a 4th player

    // Add players - specific players added per test if needed for stack sizes
  });

  // --- Test Scenario 1: Initial Raise (Pre-flop) ---
  describe('Scenario 1: Initial Raise (Pre-flop)', () => {
    beforeEach(() => {
      game.addPlayer(userP1); // P0 in game.players - Dealer
      game.addPlayer(userP2); // P1 in game.players - SB
      game.addPlayer(userP3); // P2 in game.players - BB
      
      // Set large stacks
      game.players.forEach(p => p.money = 1000);

      // P0 Dealer, P1 SB (5), P2 BB (10). Action on P0.
      // Initial state: pool:15, highestBet:10, minRaiseAmount:10 (BB size)
      game.bootstrapGame(owner);
    });

    test('Attempt to raise less than big blind over BB should fail', () => {
      // P0 (userP1) is UTG (first to act after blinds)
      // highestBet is 10 (BB). minimumRaiseAmount is 10.
      // To raise, P0 must make total bet at least 10 (call) + 10 (minRaiseAmount) = 20.
      // Raising to 15 means a raise portion of 5 (15-10), which is < minimumRaiseAmount (10).
      const actionResult = game.raise(15, userP1);
      expect(actionResult.type).toBe('ERROR_STATE');
      expect(actionResult.message).toContain('Your raise of 5 must be at least 10');
      expect(game.highestBet).toBe(10);
      expect(game.minimumRaiseAmount).toBe(10);
    });

    test('Valid initial raise to 20 should succeed, update minimumRaiseAmount', () => {
      // P0 raises to 20. Old highestBet=10. Raise portion = 20-10=10. This is >= minRaiseAmount(10).
      const actionResult = game.raise(20, userP1);
      expect(actionResult.type).toBe('RAISE_STATE');
      expect(game.highestBet).toBe(20);
      expect(game.players[0].bet).toBe(20);
      // The raise portion was 10. If this is >= current minRaise (10), minRaise becomes 10.
      expect(game.minimumRaiseAmount).toBe(10); 
    });

    test('After a raise to 20, next player attempts raise to 25 (raise portion 5) - should fail', () => {
      game.raise(20, userP1); // P0 raises to 20. highestBet=20, minRaise=10.
      
      // P1 (userP2) is next. Current highestBet=20. minRaiseAmount=10.
      // To raise, P1 must make total bet at least 20 (call) + 10 (minRaiseAmount) = 30.
      // Raising to 25 means a raise portion of 5 (25-20), which is < minRaiseAmount (10).
      const actionResult = game.raise(25, userP2);
      expect(actionResult.type).toBe('ERROR_STATE');
      expect(actionResult.message).toContain('Your raise of 5 must be at least 10');
      expect(game.highestBet).toBe(20); // Unchanged
      expect(game.minimumRaiseAmount).toBe(10); // Unchanged
    });

    test('After a raise to 20, next player raises to 30 (raise portion 10) - should succeed, minRaise unchanged', () => {
      game.raise(20, userP1); // P0 raises to 20. HB=20, MRA=10.
      
      // P1 (userP2) raises to 30. Old HB=20. Raise portion = 30-20=10. This is >= MRA(10).
      const actionResult = game.raise(30, userP2);
      expect(actionResult.type).toBe('RAISE_STATE');
      expect(game.highestBet).toBe(30);
      expect(game.players[1].bet).toBe(30);
      // The raise portion was 10. If this is >= current MRA(10), MRA becomes 10.
      expect(game.minimumRaiseAmount).toBe(10);
    });
    
    test('After raises to 30, next player raises to 45 (raise portion 15) - should succeed, minRaise updated', () => {
      game.raise(20, userP1); // P0 raises to 20. HB=20, MRA=10.
      game.raise(30, userP2); // P1 raises to 30. HB=30, MRA=10. (Raise portion 10)
      
      // P2 (userP3) is next. Old HB=30. Raise portion = 45-30=15. This is >= MRA(10).
      const actionResult = game.raise(45, userP3);
      expect(actionResult.type).toBe('RAISE_STATE');
      expect(game.highestBet).toBe(45);
      expect(game.players[2].bet).toBe(45);
      // The raise portion was 15. This is >= current MRA(10). So MRA becomes 15.
      expect(game.minimumRaiseAmount).toBe(15);
    });
  });

  // --- Test Scenario 2: Raise After a Bet (Post-flop) ---
  describe('Scenario 2: Raise After a Bet (Post-flop)', () => {
    beforeEach(() => {
      game.addPlayer(userP1); // P0 Dealer
      game.addPlayer(userP2); // P1 SB
      game.addPlayer(userP3); // P2 BB
      game.players.forEach(p => p.money = 1000);
      game.bootstrapGame(owner); // Blinds 5/10. P0 is dealer. P1 SB, P2 BB. P0 acts.

      // Pre-flop actions: P0 calls, P1 calls, P2 checks.
      game.call(userP1); // P0 calls BB (10)
      game.call(userP2); // P1 SB calls BB (completes 5 to 10)
      game.call(userP3); // P2 BB "calls" (checks, bet is already 10, highestBet is 10)
                         // This should actually be a check. If highestBet is 10 and P2's bet is 10, call is a check.

      // At this point, pre-flop betting round is over.
      // calculateNextStep will deal flop, reset bets, highestBet, and minRaiseAmount.
      // P1 (SB) is first to act post-flop.
      const nextStateAfterPreflop = game.calculateNextStep();
      expect(nextStateAfterPreflop.type).toBe('NEXT_STATE'); // Flop dealt
      expect(game.currentStep).toBe(1); // Flop
      expect(game.highestBet).toBe(0);
      expect(game.minimumRaiseAmount).toBe(game.bigBlind); // Should be 10
    });

    test('Flop: P1 bets 20, highestBet and minimumRaiseAmount become 20', () => {
      // P1 (userP2) is SB, first to act post-flop
      const actionResult = game.raise(20, userP2); // P1 bets 20
      expect(actionResult.type).toBe('RAISE_STATE');
      expect(game.highestBet).toBe(20);
      expect(game.players[1].bet).toBe(20);
      // Raise portion from 0 is 20. This is >= MRA(10 from BB). So MRA becomes 20.
      expect(game.minimumRaiseAmount).toBe(20);
    });

    test('Flop: P1 bets 20. P2 attempts raise to 30 (raise portion 10) - should fail', () => {
      game.raise(20, userP2); // P1 bets 20. HB=20, MRA=20.
      
      // P2 (userP3) is BB, next to act.
      // To raise, P2 must make total bet at least 20 (call) + 20 (MRA) = 40.
      // Raising to 30 means a raise portion of 10 (30-20), which is < MRA (20).
      const actionResult = game.raise(30, userP3);
      expect(actionResult.type).toBe('ERROR_STATE');
      expect(actionResult.message).toContain('Your raise of 10 must be at least 20');
      expect(game.highestBet).toBe(20);
      expect(game.minimumRaiseAmount).toBe(20);
    });

    test('Flop: P1 bets 20. P2 raises to 40 (raise portion 20) - should succeed, MRA unchanged', () => {
      game.raise(20, userP2); // P1 bets 20. HB=20, MRA=20.
      
      // P2 (userP3) raises to 40. Old HB=20. Raise portion = 40-20=20. This is >= MRA(20).
      const actionResult = game.raise(40, userP3);
      expect(actionResult.type).toBe('RAISE_STATE');
      expect(game.highestBet).toBe(40);
      expect(game.players[2].bet).toBe(40);
      // The raise portion was 20. This is >= current MRA(20). MRA becomes 20 (no change).
      expect(game.minimumRaiseAmount).toBe(20);
    });
    
    test('Flop: After raises to 40, P3 raises to 70 (raise portion 30) - should succeed, MRA updated', () => {
      game.raise(20, userP2); // P1 bets 20. HB=20, MRA=20.
      game.raise(40, userP3); // P2 raises to 40. HB=40, MRA=20. (Raise portion 20)
      
      // P0 (userP1) is Dealer, next to act. Old HB=40. Raise portion = 70-40=30. This is >= MRA(20).
      const actionResult = game.raise(70, userP1);
      expect(actionResult.type).toBe('RAISE_STATE');
      expect(game.highestBet).toBe(70);
      expect(game.players[0].bet).toBe(70);
      // The raise portion was 30. This is >= current MRA(20). So MRA becomes 30.
      expect(game.minimumRaiseAmount).toBe(30);
    });
  });

  // --- Test Scenario 3: All-in Raise Less Than Minimum Raise ---
  describe('Scenario 3: All-in Raise Less Than Minimum Raise', () => {
    beforeEach(() => {
      // P1 (UTG), P2 (All-in), P3 (Caller)
      game.addPlayer(userP1); // P0 in game.players (UTG)
      game.addPlayer(userP2); // P1 in game.players (Goes all-in)
      game.addPlayer(userP3); // P2 in game.players (Acts after all-in)

      game.players[0].money = 1000; // P1 (userP1)
      game.players[1].money = 25;   // P2 (userP2)
      game.players[2].money = 1000; // P3 (userP3)
      
      // Blinds 5/10. For simplicity, let's assume P1 is UTG, P2 is SB, P3 is BB.
      // To achieve UTG P1, P2, P3 setup:
      // Dealer: some other player (not in this test directly)
      // SB: P1 (userP1)
      // BB: P2 (userP2)
      // UTG: P3 (userP3)
      // This setup is complex with bootstrap. Let's simplify:
      // P0 (userP1) is Dealer, P1 (userP2) is SB, P2 (userP3) is BB.
      // P0 (userP1) will be UTG after blinds.
      // P1(userP1): 1000, P2(userP2): 25, P3(userP3): 1000
      game.bootstrapGame(owner); // P0(userP1) Dealer, P1(userP2) SB 5 (stack 20), P2(userP3) BB 10 (stack 990)
                                 // Action is on P0(userP1). Pool:15, HB:10, MRA:10.
    });

    test('All-in raise less than min-raise is valid, does not change minRaiseAmount for others if too small', () => {
      // P0 (userP1) raises to 20. (Original raiser)
      // Old HB=10. Raise portion 20-10=10. This is >= MRA(10).
      // New HB=20. New MRA=10.
      let actionResult = game.raise(20, userP1);
      expect(actionResult.type).toBe('RAISE_STATE');
      expect(game.highestBet).toBe(20);
      expect(game.minimumRaiseAmount).toBe(10); // P1's raise portion was 10.
      expect(game.players[0].bet).toBe(20);

      // P1 (userP2) is SB. Stack 20. Bet 5 (SB). Has 15 left.
      // Current highestBet is 20. P1 needs to call 15 more to match.
      // P1 goes all-in for total 20 (adds remaining 15).
      // This is effectively a CALL of P0's raise.
      // Let's change P2's stack to make it a raise. P2 stack = 25. SB was 5. Has 20 left.
      // After P0 raises to 20. P2 (userP2) has 20 left.
      // P2 wants to raise. All-in for 25 means total bet of 25.
      // Raise portion over P0's bet (20) is 5 (25-20).
      // This is less than minimumRaiseAmount (10).
      // game.players[1] is userP2. Initial money 25. Posted SB 5. Remaining 20.
      // P0 raised to 20. P1 calls 15 to make their bet 20. Has 5 left.
      // Now P1 wants to raise all-in for these 5. Total bet becomes 25.
      
      // Resetting P2's stack to be clearer for the all-in raise scenario.
      // P1(userP1) is dealer, P2(userP2) is SB, P3(userP3) is BB.
      // P1 stack 1000, P2 stack 25, P3 stack 1000.
      // After blinds: P1 (1000), P2 SB 5 (20 left), P3 BB 10 (990 left). Pool 15. HB 10. MRA 10.
      // P1 (userP1, dealer) raises to 20.
      // P1.bet:0->20. P1.money:980. Pool:15+20=35. HB:20. MRA = 20-10 = 10.
      // Action is on P2 (userP2). Has 20 left. SB 5 already in.
      // P2 goes all-in for total 25. (Effectively raises by 5 over the 20)
      // P2.bet:5->25 (adds 20). P2.money:0. Pool:35+20=55. HB:25. MRA should remain 10.
      actionResult = game.raise(25, userP2); // P2 (SB) all-in raise
      expect(actionResult.type).toBe('RAISE_STATE');
      expect(game.players[1].isAllIn).toBe(true);
      expect(game.highestBet).toBe(25); // P2's all-in amount
      expect(game.players[1].bet).toBe(25);
      // P2's raise portion was 25 - 20 (P1's bet) = 5.
      // This raise portion (5) is < previous minimumRaiseAmount (10).
      // So, minimumRaiseAmount should remain 10.
      expect(game.minimumRaiseAmount).toBe(10);

      // P3 (userP3) is BB. Has 990 left. BB 10 already in.
      // Current highestBet is 25. MinRaiseAmount is 10.
      // P3 attempts to raise to 30. Raise portion over 25 is 5. This is < minRaiseAmount (10).
      actionResult = game.raise(30, userP3);
      expect(actionResult.type).toBe('ERROR_STATE');
      expect(actionResult.message).toContain('Your raise of 5 must be at least 10');

      // P3 attempts to raise to 35. Raise portion over 25 is 10. This is == minRaiseAmount (10).
      actionResult = game.raise(35, userP3);
      expect(actionResult.type).toBe('RAISE_STATE');
      expect(game.highestBet).toBe(35);
      expect(game.players[2].bet).toBe(35);
      // P3's raise portion was 10. This is >= current MRA(10). So MRA becomes 10.
      expect(game.minimumRaiseAmount).toBe(10);
    });
  });
  
  // --- Test Scenario 4: Multiple Re-raises, MinimumRaiseAmount Updates Correctly ---
  describe('Scenario 4: Multiple Re-raises', () => {
    beforeEach(() => {
      game.addPlayer(userP1); // P0 Dealer
      game.addPlayer(userP2); // P1 SB
      game.addPlayer(userP3); // P2 BB
      game.players.forEach(p => p.money = 1000); // Large stacks
      // P0 Dealer, P1 SB (5), P2 BB (10). Action on P0.
      // Initial: Pool:15, HB:10, MRA:10
      game.bootstrapGame(owner);
    });

    test('MinimumRaiseAmount updates correctly with multiple re-raises', () => {
      // P0 (userP1) UTG raises to 20. (Old HB=10). Raise portion 10. MRA remains 10.
      let actionResult = game.raise(20, userP1);
      expect(actionResult.type).toBe('RAISE_STATE');
      expect(game.highestBet).toBe(20);
      expect(game.minimumRaiseAmount).toBe(10); // Raise portion was 10.

      // P1 (userP2) SB re-raises to 50. (Old HB=20). Raise portion 30.
      // Raise portion 30 >= MRA 10. New MRA = 30.
      actionResult = game.raise(50, userP2);
      expect(actionResult.type).toBe('RAISE_STATE');
      expect(game.highestBet).toBe(50);
      expect(game.minimumRaiseAmount).toBe(30);

      // P2 (userP3) BB re-raises to 100. (Old HB=50). Raise portion 50.
      // Raise portion 50 >= MRA 30. New MRA = 50.
      actionResult = game.raise(100, userP3);
      expect(actionResult.type).toBe('RAISE_STATE');
      expect(game.highestBet).toBe(100);
      expect(game.minimumRaiseAmount).toBe(50);
      
      // P0 (userP1) attempts to re-raise to 120. (Old HB=100). Raise portion 20.
      // Raise portion 20 < MRA 50. Should fail.
      actionResult = game.raise(120, userP1);
      expect(actionResult.type).toBe('ERROR_STATE');
      expect(actionResult.message).toContain('Your raise of 20 must be at least 50');
      expect(game.highestBet).toBe(100); // Unchanged
      expect(game.minimumRaiseAmount).toBe(50); // Unchanged

      // P0 (userP1) re-raises to 150. (Old HB=100). Raise portion 50.
      // Raise portion 50 >= MRA 50. Should succeed. New MRA = 50.
      actionResult = game.raise(150, userP1);
      expect(actionResult.type).toBe('RAISE_STATE');
      expect(game.highestBet).toBe(150);
      expect(game.minimumRaiseAmount).toBe(50);
    });
  });
});
