import { SuiObjectTypeProcessor } from "@sentio/sdk/sui";
import { TypeDescriptor } from "@typemove/move";
import { pool, bank } from "./types/sui/steamm.js";
import { BigDecimal } from "@sentio/sdk";


const startCheckpoint = 113110000n;

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
    startCheckpoint: startCheckpoint
    // looks like I am getting an error at this checkpoint 114121673
    // [2025-07-05T17:01:36.051522Z] user processor bad usage error: in event PoolSnapshot batch insertion, the emitted event data is not compatible with the schema, please check your code and upload again. (reason: schema field [balance_b] not equal, infos: type not equal, have: string, new: decimal), event detail({"Timestamp":"2025-02-
    // ({"Timestamp":"2025-02-19T00:00:00.074Z","DistinctID":"system","EventName":"PoolSnapshot","TransactionHash":"","TransactionIndex":0,"BlockNumber":114131066,"LogIndex":0,"Chain":"sui_mainnet","Address":"0x86802873345d65ef2b9739cc4dfbdf989d6595731c2cd74beb1db468d9f77d78","Contract":"object","Severity":"INFO","DistinctEventID":"e04335643802914b","RawAttributes":"{\"fields\":{\"balance_a\":{\"intValue\":161498},\"balance_b\":{\"intValue\":153122884},\"coin_type_a\":{\"stringValue\":\"0x73cfd0703fa65ce89b5928a1497b5de3db5648659eed7e3feabba58db0fd3ea0::b_btc::B_BTC\"},\"coin_type_b\":{\"stringValue\":\"0x7fb074a648b8521f65136ac701e94abf55151efc26a39cdab589fabe92285535::b_usdc::B_USDC\"},\"lp_supply\":{\"intValue\":4972749},\"lp_token_type\":{\"stringValue\":\"0x54608442ef0bf48def6cba44ee915b69fa8aacdef3d314b1925ee5c70af8bf08::steamm_lp_bwbtc_busdc::STEAMM_LP_BWBTC_BUSDC\"},\"objectId\":{\"stringValue\":\"0x86802873345d65ef2b9739cc4dfbdf989d6595731c2cd74beb1db468d9f77d78\"},\"pool_fee_denominator\":{\"bigintValue\":{\"data\":\"JxA=\"}},\"pool_fee_numerator\":{\"bigintValue\":{\"data\":\"ZA==\"}},\"pool_fees_a\":{\"bigintValue\":{\"data\":\"AA==\"}},\"pool_fees_b\":{\"bigintValue\":{\"data\":\"E2U=\"}},\"pool_min_fee\":{\"bigintValue\":{\"data\":\"AA==\"}},\"protocol_fees_a\":{\"bigintValue\":{\"data\":\"AA==\"}},\"protocol_fees_b\":{\"bigintValue\":{\"data\":\"BNo=\"}},\"protocol_fees_balance_a\":{\"stringValue\":\"0\"},\"protocol_fees_balance_b\":{\"stringValue\":\"0\"},\"protocol_fees_config\":{\"stringValue\":\"{\\\"fee_numerator\\\":\\\"2000\\\",\\\"fee_denominator\\\":\\\"10000\\\",\\\"min_fee\\\":\\\"0\\\"}\"},\"quoter\":{\"stringValue\":\"{\\\"version\\\":{\\\"pos0\\\":1},\\\"offset\\\":\\\"0\\\"}\"},\"quoter_type\":{\"stringValue\":\"0x4fb1cf45dffd6230305f1d269dd1816678cc8e3ba0b747a813a556921219f261::cpmm::CpQuoter\"},\"swap_a_in_amount\":{\"bigintValue\":{\"data\":\"Aow=\"}},\"swap_a_out_amount\":{\"bigintValue\":{\"data\":\"AA==\"}},\"swap_b_in_amount\":{\"bigintValue\":{\"data\":\"AA==\"}},\"swap_b_out_amount\":{\"bigintValue\":{\"data\":\"CWBC\"}}}}","Source":"{\"Timestamp\":\"2025-02-19T00:00:00.074Z\",\"DistinctID\":\"system\",\"EventName\":\"PoolSnapshot\",\"TransactionHash\":\"\",\"TransactionIndex\":0,\"BlockNumber\":114131066,\"LogIndex\":0,\"Chain\":\"sui_mainnet\",\"Address\":\"0x86802873345d65ef2b9739cc4dfbdf989d6595731c2cd74beb1db468d9f77d78\",\"Contract\":\"object\",\"Severity\":\"INFO\",\"ProcessorID\":\"TqZEiBoX\"}","ProcessorID":"TqZEiBoX"})
})
.onTimeInterval(async (self, _, ctx) => {
    // Access decoded object fields here
    const fields = self.data_decoded;
    
    // // DEBUGGING - Show Object Field Output
    // console.log(`DEBUG: Raw Pool Object Fields: ${JSON.stringify(fields)}`, { objectId: fields.id?.id });
    // console.log(`DEBUG: Raw balance_a: ${JSON.stringify(fields.balance_a)} Type: ${typeof fields.balance_a}`, { objectId: fields.id?.id });
    // console.log(`DEBUG: Raw balance_b: ${JSON.stringify(fields.balance_b)} Type: ${typeof fields.balance_b}`, { objectId: fields.id?.id });
    // console.log(`DEBUG: Raw lp_supply: ${JSON.stringify(fields.lp_supply)} Type: ${typeof fields.lp_supply}`, { objectId: fields.id?.id });
    
    const tradingData = fields.trading_data;
    const protocolFees = fields.protocol_fees;
    const poolFeeConfig = fields.pool_fee_config;
    
    // Convert balance BigInts to BigDecimal, accessing the 'intValue' property
    const balance_a = new BigDecimal(safeGetValue(fields.balance_a, 'intValue') || 0n);
    const balance_b = new BigDecimal(safeGetValue(fields.balance_b, 'intValue') || 0n);
    
    const lp_supply = (new BigDecimal(safeGetValue(fields.lp_supply, 'fields.value') || safeGetValue(fields.lp_supply, 'value') || 0n));
        
    ctx.eventLogger.emit("PoolSnapshot", {
        distinctId: "system", // Use system for timed intervals
        pool_id: fields.id?.id || "unknown",
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
})

// Bank Object Processor
SuiObjectTypeProcessor.bind({
    objectType: new TypeDescriptor(bank.Bank.TYPE_QNAME),
    startCheckpoint: startCheckpoint
})
.onTimeInterval(async (self, _, ctx) => {
    // Access decoded object fields here
    const fields = self.data_decoded;
    
    const lending = fields.lending;
    
    // Convert btoken_supply to BigDecimal
    const btoken_supply = (new BigDecimal(safeGetValue(fields.btoken_supply, 'fields.value') || safeGetValue(fields.btoken_supply, 'value') || 0n));
    
    ctx.eventLogger.emit("BankSnapshot", {
        distinctId: "system", // Use system for timed intervals
        pool_id: fields.id?.id || "unknown",
        // Generic type arguments from Bank<T0, T1, T2>
        lending_market_type: `${self.type_arguments[0] || "unknown"}`, // T0 - lending market type
        coin_type: `${self.type_arguments[1] || "unknown"}`, // T1 - coin type (funds_available)
        btoken_type: `${self.type_arguments[2] || "unknown"}`, // T2 - btoken type (btoken_supply)
        // Bank fields - keep as strings for debugging
        funds_available: safeGetValue(fields.funds_available, 'fields.value') || safeGetValue(fields.funds_available, 'value') || '0',
        min_token_block_size: fields.min_token_block_size,
        btoken_supply: btoken_supply.toNumber(),
        // Lending data - keep as strings
        lending_ctokens: lending?.ctokens,
        lending_target_utilisation_bps: lending?.target_utilisation_bps,
        lending_utilisation_buffer_bps: lending?.utilisation_buffer_bps,
        lending_reserve_array_index: lending?.reserve_array_index,
        lending_obligation_cap: JSON.stringify(lending?.obligation_cap || {}),
    });
})