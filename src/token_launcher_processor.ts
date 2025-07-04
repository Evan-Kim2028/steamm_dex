import { token_emitter } from './types/sui/token_launcher.js';
import { SuiContext } from '@sentio/sdk/sui';

token_emitter.bind()
  .onEventMintEvent(async (event, ctx) => {
    // There is no user-like field in this event, using the transaction sender as distinctId.
    ctx.eventLogger.emit("MintEvent", {
      distinctId: ctx.transaction.transaction?.data.sender,
      ...event.data_decoded
    });
  })
  .onEventNewTokenEvent(async (event, ctx) => {
    // There is no user-like field in this event, using the transaction sender as distinctId.
    ctx.eventLogger.emit("NewTokenEvent", {
      distinctId: ctx.transaction.transaction?.data.sender,
      ...event.data_decoded
    });
  }) 