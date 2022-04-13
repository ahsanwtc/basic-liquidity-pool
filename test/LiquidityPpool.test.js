const { time } = require('@openzeppelin/test-helpers');
const LiquidityPool = artifacts.require("LiquidityPool");
const GovernanceToken = artifacts.require("GovernanceToken");
const UnderlyingToken = artifacts.require("UnderlyingToken");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("LiquidityPool", accounts => {
  const [admin, trader1, trader2, _] = accounts;
  let underlyingToken, governanceToken, liquidityPool;

  beforeEach(async () => {
    underlyingToken = await UnderlyingToken.new();
    governanceToken = await GovernanceToken.new();
    liquidityPool = await LiquidityPool.new(underlyingToken.address, governanceToken.address);
    await governanceToken.transferOwnership(liquidityPool.address, { from: admin });
    await Promise.all([
      underlyingToken.faucet(trader1, web3.utils.toWei('1000')),
      underlyingToken.faucet(trader2, web3.utils.toWei('1000')),
    ]);
  });

  it('should mint 500 governace tokens', async () => {
    await underlyingToken.approve(liquidityPool.address, web3.utils.toWei('100'), { from: trader1 });
    await liquidityPool.deposit(web3.utils.toWei('100'), { from: trader1 }); // block 1
    await time.advanceBlock(); // block 2
    await time.advanceBlock(); // block 3
    await time.advanceBlock(); // block 4
    await time.advanceBlock(); // block 5
    await liquidityPool.withdraw(web3.utils.toWei('100'), { from: trader1 });
    const balanceGevernanceToken = await governanceToken.balanceOf(trader1);
    assert(web3.utils.fromWei(balanceGevernanceToken.toString()) === '500', 'balance is not equal to 500');
  });

  it('should mint and burn 100 Lp tokens', async () => {
    await underlyingToken.approve(liquidityPool.address, web3.utils.toWei('100'), { from: trader1 });
    await liquidityPool.deposit(web3.utils.toWei('100'), { from: trader1 });
    const balanceLpTokenBefore = await liquidityPool.balanceOf(trader1);
    assert(web3.utils.fromWei(balanceLpTokenBefore.toString()) === '100', 'LpToken balance is not equal to 100');

    await liquidityPool.withdraw(web3.utils.toWei('100'), { from: trader1 });
    const balanceLpTokenAfter = await liquidityPool.balanceOf(trader1);
    assert(web3.utils.fromWei(balanceLpTokenAfter.toString()) === '0', 'LpToken balance is not equal to 0');
  });
});
