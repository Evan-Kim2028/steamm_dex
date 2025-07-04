import { SuiContext } from '@sentio/sdk/sui';
import { steamm_cpmm, steamm_omm } from './types/sui/steam_cpmm.js';

steamm_cpmm.bind()
    .onEventSteammCPMMSwapEvent(async (event: steamm_cpmm.SteammCPMMSwapEventInstance, ctx: SuiContext) => {
        let priceAtoB: number;
        let priceBtoA: number;

        const amountIn = Number(event.data_decoded.amount_in);
        const amountOut = Number(event.data_decoded.amount_out);

        if (event.data_decoded.a2b) {
            priceAtoB = amountOut / amountIn;
            priceBtoA = amountIn / amountOut;
        } else {
            priceAtoB = amountIn / amountOut;
            priceBtoA = amountOut / amountIn;
        }

        ctx.eventLogger.emit("SteammCPMMSwapEvent", {
            distinctId: ctx.transaction.transaction?.data.sender,
            pool_id: event.data_decoded.pool_id,
            amount_in: event.data_decoded.amount_in.toString(),
            amount_out: event.data_decoded.amount_out.toString(),
            a2b: event.data_decoded.a2b,
            by_amount_in: event.data_decoded.by_amount_in,
            coin_a: "0x" + event.data_decoded.coin_a.name,
            coin_b: "0x" + event.data_decoded.coin_b.name,
            price_a_to_b: priceAtoB,
            price_b_to_a: priceBtoA
        });
    });

steamm_omm.bind()
    .onEventSteammOMMSwapEvent(async (event: steamm_omm.SteammOMMSwapEventInstance, ctx: SuiContext) => {
        let priceAtoB: number;
        let priceBtoA: number;

        const amountIn = Number(event.data_decoded.amount_in);
        const amountOut = Number(event.data_decoded.amount_out);

        if (event.data_decoded.a2b) {
            priceAtoB = amountOut / amountIn;
            priceBtoA = amountIn / amountOut;
        } else {
            priceAtoB = amountIn / amountOut;
            priceBtoA = amountOut / amountIn;
        }

        ctx.eventLogger.emit("SteammOMMSwapEvent", {
            distinctId: ctx.transaction.transaction?.data.sender,
            pool_id: event.data_decoded.pool_id,
            amount_in: event.data_decoded.amount_in.toString(),
            amount_out: event.data_decoded.amount_out.toString(),
            a2b: event.data_decoded.a2b,
            by_amount_in: event.data_decoded.by_amount_in,
            coin_a: "0x" + event.data_decoded.coin_a.name,
            coin_b: "0x" + event.data_decoded.coin_b.name,
            price_a_to_b: priceAtoB,
            price_b_to_a: priceBtoA
        });
    }); 