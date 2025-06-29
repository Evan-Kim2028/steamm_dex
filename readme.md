### contract
`yarn sentio add --chain sui_mainnet 0x4fb1cf45dffd6230305f1d269dd1816678cc8e3ba0b747a813a556921219f261 --name steamm`

`yarn sentio add --chain sui_mainnet 0xf4054b4c967ea64173453f593a0ec98cb6aa351635cbc412f4fdf5f804bb98db --name token_launcher`

`yarn sentio add --chain sui_mainnet 0x368d13376443a8051b22b42a9125f6a3bc836422bb2d9c4a53984b8d6624c326 --name steam_cpmm`

this contract needs to be added manually
`yarn sentio add --chain sui_mainnet 0x4fb1cf45dffd6230305f1d269dd1816678cc8e3ba0b747a813a556921219f261`


### events 

Events in the steamm contracts are wrapped in a generic Event type, making them nested. 


```"event":{7 items
"balance_a":string"184846752341390" -- total pool a reserve
"balance_b":string"731554720504"    -- total pool b reserve
"burn_lp":string"2768294254"
"pool_id":string"0xae12e94ad7dac17e923982b81e16ab97ad0436de37522b61fe66930968ad966b"
"user":string"0x1e19b697bb7a332d8e23651cb3fb8247e536eb0846b28602c801e991cb4dbad0"
"withdraw_a":string"46253290139" -- amount withdrawn
"withdraw_b":string"183053325" -- balance
}```


0x4fb1cf45dffd6230305f1d269dd1816678cc8e3ba0b747a813a556921219f261::events::Event<0x4fb1cf45dffd6230305f1d269dd1816678cc8e3ba0b747a813a556921219f261::pool::RedeemResult>


from the swap_event there are about 1087538 records...then there is a new cpmm swap event that has coin a and coin b as well.