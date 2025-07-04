import { SuiObjectTypeProcessor } from "@sentio/sdk/sui";
import { TypeDescriptor } from "@typemove/move";
import { pool, bank } from "./types/sui/steamm.js";
import { BigDecimal } from "@sentio/sdk";

// Helper function to safely access nested values
const safeGetValue = (obj: any, path: string) => {
    try {
        const keys = path.split('.');
        let current = obj;
        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return undefined;
            }
        }
        return current;
    } catch (e) {
        console.warn(`Failed to access ${path}:`, e);
        return undefined;
    }
};

// Pool Object Processor
SuiObjectTypeProcessor.bind({
    objectType: new TypeDescriptor(pool.Pool.TYPE_QNAME),
    startCheckpoint: 114124000n
})
.onTimeInterval(async (self, _, ctx) => {
    // Access decoded object fields here
    const fields = self.data_decoded;
    
    // !!! CONCISE FIX: USE console.log !!!
    console.log(`DEBUG: Raw Pool Object Fields: ${JSON.stringify(fields)}`, { objectId: fields.id?.id });
    console.log(`DEBUG: Raw balance_a: ${JSON.stringify(fields.balance_a)} Type: ${typeof fields.balance_a}`, { objectId: fields.id?.id });
    console.log(`DEBUG: Raw balance_b: ${JSON.stringify(fields.balance_b)} Type: ${typeof fields.balance_b}`, { objectId: fields.id?.id });
    console.log(`DEBUG: Raw lp_supply: ${JSON.stringify(fields.lp_supply)} Type: ${typeof fields.lp_supply}`, { objectId: fields.id?.id });
    // !!! END FIX !!!
    
    const tradingData = fields.trading_data;
    const protocolFees = fields.protocol_fees;
    const poolFeeConfig = fields.pool_fee_config;
    
    // Convert balance BigInts to BigDecimal
    const balance_a = (new BigDecimal(fields.balance_a || 0n));
    const balance_b = (new BigDecimal(fields.balance_b || 0n));
    
    const lp_supply = (new BigDecimal(safeGetValue(fields.lp_supply, 'fields.value') || safeGetValue(fields.lp_supply, 'value') || 0n));
        
    ctx.eventLogger.emit("PoolSnapshot", {
        distinctId: "system", // Use system for timed intervals
        objectId: fields.id?.id || "unknown",
        // Generic type arguments from Pool<T0, T1, T2, T3>
        coin_type_a: `${self.type_arguments[0] || "unknown"}`, // T0 - coin type A (balance_a)
        coin_type_b: `${self.type_arguments[1] || "unknown"}`, // T1 - coin type B (balance_b)
        quoter_type: `${self.type_arguments[2] || "unknown"}`, // T2 - quoter type
        lp_token_type: `${self.type_arguments[3] || "unknown"}`, // T3 - LP token type (lp_supply)
        quoter: JSON.stringify(fields.quoter),
        // Handle balance fields - convert string to number
        balance_a: balance_a.toNumber(),
        balance_b: balance_b.toNumber(),
        // Handle lp_supply which has nested structure - convert string to number
        lp_supply: lp_supply.toNumber(),
        // Trading Data - keep as strings
        swap_a_in_amount: tradingData?.swap_a_in_amount,
        swap_b_out_amount: tradingData?.swap_b_out_amount,
        swap_a_out_amount: tradingData?.swap_a_out_amount,
        swap_b_in_amount: tradingData?.swap_b_in_amount,
        protocol_fees_a: tradingData?.protocol_fees_a,
        protocol_fees_b: tradingData?.protocol_fees_b,
        pool_fees_a: tradingData?.pool_fees_a,
        pool_fees_b: tradingData?.pool_fees_b,
        // Protocol Fees - keep as strings
        protocol_fees_config: JSON.stringify(protocolFees?.config || {}),
        protocol_fees_balance_a: safeGetValue(protocolFees?.fee_a, 'fields.value') || safeGetValue(protocolFees?.fee_a, 'value') || '0',
        protocol_fees_balance_b: safeGetValue(protocolFees?.fee_b, 'fields.value') || safeGetValue(protocolFees?.fee_b, 'value') || '0',
        // Pool Fee Config - keep as strings
        pool_fee_numerator: poolFeeConfig?.fee_numerator,
        pool_fee_denominator: poolFeeConfig?.fee_denominator,
        pool_min_fee: poolFeeConfig?.min_fee,
    });
}, undefined, 4800) // Run every 4800ms (4.8 seconds)

// Bank Object Processor
SuiObjectTypeProcessor.bind({
    objectType: new TypeDescriptor(bank.Bank.TYPE_QNAME)
})
.onTimeInterval(async (self, _, ctx) => {
    // Access decoded object fields here
    const fields = self.data_decoded;
    
    const lending = fields.lending;
    
    ctx.eventLogger.emit("BankSnapshot", {
        distinctId: "system", // Use system for timed intervals
        objectId: fields.id?.id || "unknown",
        // Generic type arguments from Bank<T0, T1, T2>
        lending_market_type: `${self.type_arguments[0] || "unknown"}`, // T0 - lending market type
        coin_type: `${self.type_arguments[1] || "unknown"}`, // T1 - coin type (funds_available)
        btoken_type: `${self.type_arguments[2] || "unknown"}`, // T2 - btoken type (btoken_supply)
        // Bank fields - keep as strings for debugging
        funds_available: safeGetValue(fields.funds_available, 'fields.value') || safeGetValue(fields.funds_available, 'value') || '0',
        min_token_block_size: fields.min_token_block_size,
        btoken_supply: safeGetValue(fields.btoken_supply, 'fields.value') || safeGetValue(fields.btoken_supply, 'value') || '0',
        // Lending data - keep as strings
        lending_ctokens: lending?.ctokens,
        lending_target_utilisation_bps: lending?.target_utilisation_bps,
        lending_utilisation_buffer_bps: lending?.utilisation_buffer_bps,
        lending_reserve_array_index: lending?.reserve_array_index,
        lending_obligation_cap: JSON.stringify(lending?.obligation_cap || {}),
    });
}, undefined, 4800) // Run every 4800ms (4.8 seconds)