#!/bin/bash

# Navigate to the correct directory
cd ~/ceremonyclient/node || exit 1  # Exit if directory change fails

PREVIOUS_BALANCE=""

while true; do
  # Run the command once and store the output
  NODE_INFO_OUTPUT=$(./node-2.0.3.4-linux-amd64 --node-info)

  # Extract Peer ID, Prover Ring, and Owned Balance from the output
  PEER_ID=$(echo "$NODE_INFO_OUTPUT" | grep "Peer ID" | awk '{print $3}')
  PROVER_RING=$(echo "$NODE_INFO_OUTPUT" | grep "Prover Ring" | awk '{print $3}')
  CURRENT_BALANCE=$(echo "$NODE_INFO_OUTPUT" | grep "Owned balance" | awk '{print $3}')
  DATE=$(date '+%Y-%m-%d %H:%M:%S')

  # Check if the balance has changed
  if [ "$CURRENT_BALANCE" != "$PREVIOUS_BALANCE" ]; then
    # Send the data to the API endpoint
    curl -X POST -H "Content-Type: application/json" \
    -d "{\"peer_id\":\"$PEER_ID\", \"prover_ring\":\"$PROVER_RING\", \"balance\":\"$CURRENT_BALANCE\", \"timestamp\":\"$DATE\"}" \
    http://127.0.0.1:3000/api/miner
    
    # Update the previous balance
    PREVIOUS_BALANCE=$CURRENT_BALANCE
  fi

  # Wait for 1 second before the next iteration
  sleep 1
done