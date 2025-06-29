import { SuiObjectTypeProcessor, SuiNetwork, SuiObjectChangeContext } from "@sentio/sdk/sui";
import { TypeDescriptor } from "@typemove/move";
import { registry, bank } from "./types/sui/steamm.js";
import * as _0x1 from "@sentio/sdk/sui/builtin/0x1";

export function initSteammPoolDataProcessor() {
  SuiObjectTypeProcessor.bind({
    objectType: registry.PoolData.type(),
    network: SuiNetwork.MAIN_NET,
    startCheckpoint: 115000000n,
  }).onObjectChange(async (changes, ctx: SuiObjectChangeContext) => {
    for (const ch of changes) {
      if (ch.type !== 'created') {
        continue
      }

      const fields = (ch as any).fields as registry.PoolData

      if (!fields) {
        console.warn(
          `Skipping created object ${ch.objectId} due to missing fields.`
        )
        continue
      }

      console.log(
        `[${ctx.network}] pool_data_created at checkpoint ${ctx.checkpoint}`,
        `\n  object_id: ${ch.objectId}`,
        `\n  tx_digest: ${ctx.txDigest}`,
        `\n  fields: ${JSON.stringify(fields, null, 2)}`
      )

      try {
        await ctx.eventLogger.emit('pool_data_created', {
          distinctId: ch.objectId,
          objectId: ch.objectId,
          version: ch.version,
          pool_id: fields.pool_id,
          quoter_type: fields.quoter_type?.name,
          swap_fee_bps: fields.swap_fee_bps?.toString(),
          lp_token_type: fields.lp_token_type?.name,
        })
      } catch (e) {
        console.error(
          `[${ctx.network}] Error emitting pool_data_created for object ${ch.objectId} at checkpoint ${ctx.checkpoint}:`,
          e,
          `\n  tx_digest: ${ctx.txDigest}`,
          `\n  fields: ${JSON.stringify(fields, null, 2)}`
        )
      }
    }
  })
}

function extractTypeArguments(typeString: string): string[] {
  const openBracketIndex = typeString.indexOf('<');
  const closeBracketIndex = typeString.lastIndexOf('>');

  if (openBracketIndex === -1 || closeBracketIndex === -1) {
    return [];
  }

  const argsStr = typeString.substring(openBracketIndex + 1, closeBracketIndex);
  const args = [];
  let currentArg = '';
  let bracketDepth = 0;

  for (const char of argsStr) {
    if (char === '<') {
      bracketDepth++;
    } else if (char === '>') {
      bracketDepth--;
    } else if (char === ',' && bracketDepth === 0) {
      args.push(currentArg.trim());
      currentArg = '';
      continue;
    }
    currentArg += char;
  }
  args.push(currentArg.trim());

  return args;
}

export function initSteammBankProcessor() {
  SuiObjectTypeProcessor.bind({
    objectType: bank.Bank.type(),
    network: SuiNetwork.MAIN_NET,
    startCheckpoint: 115000000n,
  }).onObjectChange(async (changes, ctx) => {
    for (const ch of changes) {
      if (ch.type !== 'created') {
        continue
      }

      const fields = (ch as any).fields as bank.Bank<any, any, any>

      if (!fields) {
        console.warn(
          `Skipping created object ${ch.objectId} due to missing fields.`
        )
        continue
      }

      const typeArgs = extractTypeArguments(ch.objectType)
      const t0 = typeArgs[0] || null
      const t1 = typeArgs[1] || null
      const t2 = typeArgs[2] || null

      console.log(
        `[${ctx.network}] bank_created at checkpoint ${ctx.checkpoint}`,
        `\n  object_id: ${ch.objectId}`,
        `\n  tx_digest: ${ctx.txDigest}`,
        `\n  type: ${ch.objectType}`,
        `\n  fields: ${JSON.stringify(fields, null, 2)}`
      )

      try {
        await ctx.eventLogger.emit('bank_created', {
          distinctId: ch.objectId,
          objectId: ch.objectId,
          version: ch.version,
          funds_available: fields.funds_available?.toString(),
          min_token_block_size: fields.min_token_block_size?.toString(),
          btoken_supply: fields.btoken_supply?.toString(),
          version_number: fields.version?.pos0,
          T0: t0,
          T1: t1,
          T2: t2,
        })
      } catch (e) {
        console.error(
          `[${ctx.network}] Error emitting bank_created for object ${ch.objectId} at checkpoint ${ctx.checkpoint}:`,
          e,
          `\n  tx_digest: ${ctx.txDigest}`,
          `\n  type: ${ch.objectType}`,
          `\n  fields: ${JSON.stringify(fields, null, 2)}`
        )
      }
    }
  })
} 