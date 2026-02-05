




# example  
V4_ADDRESS=""
# example: 
V3_ADDRESS="" 

#V4_ADDRESS=""
#V3_ADDRESS=""


echo "."
NUM_TRIES=0
while true; do
    CLAIM_MESSAGE="I accept the DMDv4 Whitepaper terms and claim my airdrop to: $V4_ADDRESS $NUM_TRIES"
    OUTPUT=$(diamond-cli signmessage $V3_ADDRESS "$CLAIM_MESSAGE") 
    NUM_TRIES=$(($NUM_TRIES+1));
    
    printf "Try: %d\r" "$NUM_TRIES"
    if [[ "$OUTPUT" == I* ]]; then
        echo "----------------------------------------"
        echo "Signature found after $NUM_TRIES"
        echo "$CLAIM_MESSAGE"
        echo "$OUTPUT"
        echo "----------------------------------------"
        break
    fi
done