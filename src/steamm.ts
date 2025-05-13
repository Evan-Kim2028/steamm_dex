import { events, pool as poolTypes, registry as registryTypes } from "./types/sui/steamm.js";
import { token_emitter } from "./types/sui/token_launcher.js";

// Define the full type names for easier comparison
const SWAP_RESULT_TYPE = "0x4fb1cf45dffd6230305f1d269dd1816678cc8e3ba0b747a813a556921219f261::pool::SwapResult";
const POOL_DATA_TYPE = "0x4fb1cf45dffd6230305f1d269dd1816678cc8e3ba0b747a813a556921219f261::registry::PoolData";
const NEW_POOL_RESULT_TYPE = "0x4fb1cf45dffd6230305f1d269dd1816678cc8e3ba0b747a813a556921219f261::pool::NewPoolResult";
const REDEEM_RESULT_TYPE = "0x4fb1cf45dffd6230305f1d269dd1816678cc8e3ba0b747a813a556921219f261::pool::RedeemResult";
const DEPOSIT_RESULT_TYPE = "0x4fb1cf45dffd6230305f1d269dd1816678cc8e3ba0b747a813a556921219f261::pool::DepositResult";


export function initSteammProcessor() {
    // Listen for the generic Event wrapper
    events.bind()
      .onEventEvent(async (eventInstance, ctx) => {
          // Get the type of the wrapped event
          const wrappedEventType = eventInstance.type_arguments[0];
          const eventData = eventInstance.data_decoded.event; // Access the nested event data

          switch (wrappedEventType) {
              case SWAP_RESULT_TYPE:
                  // Cast the generic event data to the specific SwapResult type
                  const swapData = eventData as poolTypes.SwapResult;
                  await ctx.eventLogger.emit('swap_result', {
                      distinctId: swapData.user, 
                      user: swapData.user,
                      pool_id: swapData.pool_id,
                      amount_in: swapData.amount_in,
                      amount_out: swapData.amount_out,
                      output_fees_pool: swapData.output_fees.pool_fees, 
                      output_fees_protocol: swapData.output_fees.protocol_fees, 
                      a2b: swapData.a2b,
                      balance_a: swapData.balance_a,
                      balance_b: swapData.balance_b,
                  });
                  break;

              case POOL_DATA_TYPE:
                  // Cast the generic event data to the specific PoolData type
                  const poolData = eventData as registryTypes.PoolData;
                  await ctx.eventLogger.emit('pool_data', {
                      pool_id: poolData.pool_id,
                      quoter_type: poolData.quoter_type,
                      swap_fee_bps: poolData.swap_fee_bps,
                      lp_token_type: poolData.lp_token_type,
                  });
                  break;
                case NEW_POOL_RESULT_TYPE:
                    // Cast the generic event data to the specific NewPoolResult type
                    const newPoolData = eventData as poolTypes.NewPoolResult;
                    
                    const coinTypeNameA = newPoolData.coin_type_a.name;
                    const coinTypeNameB = newPoolData.coin_type_b.name;
                    const lpTokenTypeName = newPoolData.lp_token_type.name;
                  
                    // extract symbols from the coin data (0x...B_SUI) --> SUI to make it easier to obtain pricing data
                    const partsA = coinTypeNameA.split('::');
                    const symbolPartsA = partsA[partsA.length - 1].split('_');
                    const coinSymbolA = symbolPartsA[symbolPartsA.length - 1];

                    const partsB = coinTypeNameB.split('::');
                    const symbolPartsB = partsB[partsB.length - 1].split('_');
                    const coinSymbolB = symbolPartsB[symbolPartsB.length - 1];

                    await ctx.eventLogger.emit('new_pool_result', {
                        distinctId: newPoolData.pool_id, 
                        pool_id: newPoolData.pool_id,
                        coin_type_a: `0x${coinTypeNameA}`,
                        coin_symbol_a: coinSymbolA,
                        coin_type_b: `0x${coinTypeNameB}`,
                        coin_symbol_b: coinSymbolB,
                        swap_fee_bps: newPoolData.swap_fee_bps,
                        quoter_type: newPoolData.quoter_type.name,
                        lp_token_type: `0x${lpTokenTypeName}`,
                    });
                    break;
                case REDEEM_RESULT_TYPE:
                    // Cast the generic event data to the specific RedeemResult type
                    const redeemData = eventData as poolTypes.RedeemResult;
                    await ctx.eventLogger.emit('redeem_result', {
                        distinctId: redeemData.user,
                        user: redeemData.user,
                        pool_id: redeemData.pool_id,
                        user_withdraw_a: redeemData.withdraw_a,
                        user_withdraw_b: redeemData.withdraw_b,
                        burn_lp: redeemData.burn_lp,
                        pool_balance_a: redeemData.balance_a,
                        pool_balance_b: redeemData.balance_b,
                    });
                    break;
                  case DEPOSIT_RESULT_TYPE:
                      // Cast the generic event data to the specific DepositResult type
                      const depositData = eventData as poolTypes.DepositResult;
                      await ctx.eventLogger.emit('deposit_result', {
                          distinctId: depositData.user,
                          user: depositData.user,
                          pool_id: depositData.pool_id,
                          user_deposit_a: depositData.deposit_a,
                          user_deposit_b: depositData.deposit_b,
                          mint_lp: depositData.mint_lp,
                          pool_balance_a: depositData.balance_a, // Pool's balance of token A after deposit
                          pool_balance_b: depositData.balance_b, // Pool's balance of token B after deposit
                      });
                      break;
              default:
                  break;
          }
      });


    token_emitter.bind()
    .onEventMintEvent(async (self, ctx) => {
        await ctx.eventLogger.emit('mint_event', {
            // Add distinctId if applicable, e.g., ctx.transaction.sender or another relevant field
            token_type: self.data_decoded.token_type,
            amount: self.data_decoded.amount,
        });
    });
}
