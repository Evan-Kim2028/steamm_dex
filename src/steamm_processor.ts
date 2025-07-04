
import { events, pool as poolTypes, registry as registryTypes, bank as bankTypes, fees as feesTypes, quote as quoteTypes } from "./types/sui/steamm.js";


export function initSteammProcessor() {
    // Listen for the generic Event wrapper
    events.bind()
      .onEventEvent(async (eventInstance, ctx) => {
          // Get the type of the wrapped event
          const wrappedEventType = eventInstance.type_arguments[0];
          const eventData = eventInstance.data_decoded.event; // Access the nested event data

          switch (wrappedEventType) {
              case poolTypes.SwapResult.TYPE_QNAME:
                  // Cast the generic event data to the specific SwapResult type
                  const swapData = eventData as poolTypes.SwapResult;
                  await ctx.eventLogger.emit('swap_result', {
                      distinctId: swapData.user, 
                      user: swapData.user,
                      pool_id: swapData.pool_id,
                      amount_in: swapData.amount_in.toString(),
                      amount_out: swapData.amount_out.toString(),
                      output_fees_pool: swapData.output_fees.pool_fees.toString(), 
                      output_fees_protocol: swapData.output_fees.protocol_fees.toString(), 
                      a2b: swapData.a2b,
                      balance_a: swapData.balance_a.toString(),
                      balance_b: swapData.balance_b.toString(),
                  });
                  break;

              case registryTypes.PoolData.TYPE_QNAME:
                  // Cast the generic event data to the specific PoolData type
                  const poolData = eventData as registryTypes.PoolData;
                  await ctx.eventLogger.emit('pool_data', {
                      pool_id: poolData.pool_id,
                      quoter_type: poolData.quoter_type.name,
                      swap_fee_bps: poolData.swap_fee_bps.toString(),
                      lp_token_type: poolData.lp_token_type.name,
                  });
                  break;
                case poolTypes.NewPoolResult.TYPE_QNAME:
                    // Cast the generic event data to the specific NewPoolResult type
                    const newPoolData = eventData as poolTypes.NewPoolResult;
                    
                    const coinTypeA = newPoolData.coin_type_a.name;
                    const coinTypeB = newPoolData.coin_type_b.name;
                    const quoterType = newPoolData.quoter_type.name;
                    const lpTokenType = newPoolData.lp_token_type.name;

                    const coinSymbolA = coinTypeA.includes("::") ? coinTypeA.split("::").pop() : coinTypeA;
                    const coinSymbolB = coinTypeB.includes("::") ? coinTypeB.split("::").pop() : coinTypeB;

                    await ctx.eventLogger.emit('new_pool_result', {
                        pool_id: newPoolData.pool_id,
                        coin_type_a: "+0x" + coinTypeA, // Ensure +0x prefix
                        coin_type_b: "+0x" + coinTypeB, // Ensure +0x prefix
                        quoter_type: "+0x" + quoterType, // Ensure +0x prefix
                        lp_token_type: "+0x" + lpTokenType, // Ensure +0x prefix
                        swap_fee_bps: newPoolData.swap_fee_bps.toString(),
                        coin_symbol_a: coinSymbolA,
                        coin_symbol_b: coinSymbolB,
                    });
                    break;
                case poolTypes.RedeemResult.TYPE_QNAME:
                    // Cast the generic event data to the specific RedeemResult type
                    const redeemData = eventData as poolTypes.RedeemResult;
                    await ctx.eventLogger.emit('redeem_result', {
                        distinctId: redeemData.user,
                        user: redeemData.user,
                        pool_id: redeemData.pool_id,
                        user_withdraw_a: redeemData.withdraw_a.toString(),
                        user_withdraw_b: redeemData.withdraw_b.toString(),
                        burn_lp: redeemData.burn_lp.toString(),
                        pool_balance_a: redeemData.balance_a.toString(), // Pool's balance of token A after redeem
                        pool_balance_b: redeemData.balance_b.toString(), // Pool's balance of token B after redeem
                    });
                    break;
                  case poolTypes.DepositResult.TYPE_QNAME:
                      // Cast the generic event data to the specific DepositResult type
                      const depositData = eventData as poolTypes.DepositResult;
                      await ctx.eventLogger.emit('deposit_result', {
                          distinctId: depositData.user,
                          user: depositData.user,
                          pool_id: depositData.pool_id,
                          user_deposit_a: depositData.deposit_a.toString(),
                          user_deposit_b: depositData.deposit_b.toString(),
                          mint_lp: depositData.mint_lp.toString(),
                          pool_balance_a: depositData.balance_a.toString(), // Pool's balance of token A after deposit
                          pool_balance_b: depositData.balance_b.toString(), // Pool's balance of token B after deposit
                      });
                      break;
                    case bankTypes.BurnBTokenEvent.TYPE_QNAME:
                        const burnBTokenData = eventData as bankTypes.BurnBTokenEvent;
                        await ctx.eventLogger.emit('burn_btoken_event', {
                            distinctId: burnBTokenData.user,
                            user: burnBTokenData.user,
                            bank_id: burnBTokenData.bank_id,
                            lending_market_id: burnBTokenData.lending_market_id,
                            withdrawn_amount: burnBTokenData.withdrawn_amount.toString(),
                            burned_amount: burnBTokenData.burned_amount.toString(),
                        });
                        break;
                    case bankTypes.DeployEvent.TYPE_QNAME:
                        const deployData = eventData as bankTypes.DeployEvent;
                        await ctx.eventLogger.emit('deploy_event', {
                            bank_id: deployData.bank_id,
                            lending_market_id: deployData.lending_market_id,
                            deployed_amount: deployData.deployed_amount.toString(),
                            ctokens_minted: deployData.ctokens_minted.toString(),
                        });
                        break;
                    case bankTypes.MintBTokenEvent.TYPE_QNAME:
                        const mintBTokenData = eventData as bankTypes.MintBTokenEvent;
                        await ctx.eventLogger.emit('mint_btoken_event', {
                            distinctId: mintBTokenData.user,
                            user: mintBTokenData.user,
                            bank_id: mintBTokenData.bank_id,
                            lending_market_id: mintBTokenData.lending_market_id,
                            deposited_amount: mintBTokenData.deposited_amount.toString(),
                            minted_amount: mintBTokenData.minted_amount.toString(),
                        });
                        break;
                    case bankTypes.NeedsRebalance.TYPE_QNAME:
                        const needsRebalanceData = eventData as bankTypes.NeedsRebalance;
                        await ctx.eventLogger.emit('needs_rebalance_event', {
                            needs_rebalance: needsRebalanceData.needs_rebalance,
                        });
                        break;
                    case bankTypes.NewBankEvent.TYPE_QNAME:
                        const newBankData = eventData as bankTypes.NewBankEvent;
                        await ctx.eventLogger.emit('new_bank_event', {
                            bank_id: newBankData.bank_id,
                            coin_type: "+0x" + newBankData.coin_type.name,
                            btoken_type: "+0x" + newBankData.btoken_type.name,
                            lending_market_id: newBankData.lending_market_id,
                            lending_market_type: "+0x" + newBankData.lending_market_type.name,
                        });
                        break;
                    case bankTypes.RecallEvent.TYPE_QNAME:
                        const recallData = eventData as bankTypes.RecallEvent;
                        await ctx.eventLogger.emit('recall_event', {
                            bank_id: recallData.bank_id,
                            lending_market_id: recallData.lending_market_id,
                            recalled_amount: recallData.recalled_amount.toString(),
                            ctokens_burned: recallData.ctokens_burned.toString(),
                        });
                        break;
                    case registryTypes.BankKey.TYPE_QNAME:
                        const bankKeyData = eventData as registryTypes.BankKey;
                        await ctx.eventLogger.emit('bank_key_event', {
                            lending_market_id: bankKeyData.lending_market_id,
                            coin_type: "+0x" + bankKeyData.coin_type.name,
                        });
                        break;
                    case registryTypes.PoolKey.TYPE_QNAME:
                        const poolKeyData = eventData as registryTypes.PoolKey;
                        await ctx.eventLogger.emit('pool_key_event', {
                            coin_type_a: "+0x" + poolKeyData.coin_type_a.name,
                            coin_type_b: "+0x" + poolKeyData.coin_type_b.name,
                        });
                        break;
                    case feesTypes.FeeConfig.TYPE_QNAME:
                        const feeConfigData = eventData as feesTypes.FeeConfig;
                        await ctx.eventLogger.emit('fee_config_event', {
                            fee_numerator: feeConfigData.fee_numerator.toString(),
                            fee_denominator: feeConfigData.fee_denominator.toString(),
                            min_fee: feeConfigData.min_fee.toString(),
                        });
                        break;
                    case quoteTypes.DepositQuote.TYPE_QNAME:
                        const depositQuoteData = eventData as quoteTypes.DepositQuote;
                        await ctx.eventLogger.emit('deposit_quote_event', {
                            initial_deposit: depositQuoteData.initial_deposit,
                            deposit_a: depositQuoteData.deposit_a.toString(),
                            deposit_b: depositQuoteData.deposit_b.toString(),
                            mint_lp: depositQuoteData.mint_lp.toString(),
                        });
                        break;
                    case quoteTypes.RedeemQuote.TYPE_QNAME:
                        const redeemQuoteData = eventData as quoteTypes.RedeemQuote;
                        await ctx.eventLogger.emit('redeem_quote_event', {
                            withdraw_a: redeemQuoteData.withdraw_a.toString(),
                            withdraw_b: redeemQuoteData.withdraw_b.toString(),
                            burn_lp: redeemQuoteData.burn_lp.toString(),
                        });
                        break;
                    case quoteTypes.SwapFee.TYPE_QNAME:
                        const swapFeeData = eventData as quoteTypes.SwapFee;
                        await ctx.eventLogger.emit('swap_fee_event', {
                            protocol_fees: swapFeeData.protocol_fees.toString(),
                            pool_fees: swapFeeData.pool_fees.toString(),
                        });
                        break;
                    case quoteTypes.SwapQuote.TYPE_QNAME:
                        const swapQuoteData = eventData as quoteTypes.SwapQuote;
                        await ctx.eventLogger.emit('swap_quote_event', {
                            amount_in: swapQuoteData.amount_in.toString(),
                            amount_out: swapQuoteData.amount_out.toString(),
                            output_fees_protocol_fees: swapQuoteData.output_fees.protocol_fees.toString(),
                            output_fees_pool_fees: swapQuoteData.output_fees.pool_fees.toString(),
                            a2b: swapQuoteData.a2b,
                        });
                        break;
              default:
                  break;
          }
      });
} 