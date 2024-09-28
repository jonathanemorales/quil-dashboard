#!/bin/bash

# Navigate to the correct directory
cd ./ceremonyclient/node || exit 1  # Exit if directory change fails

PREVIOUS_BALANCE=""

while true; do
  #git pull

  # Fetch peer ID and balance
  PEER_ID=$(./node-1.4.21.1-linux-amd64 -peer-id | grep "Peer ID" | awk '{print $3}')
  CURRENT_BALANCE=$(./node-1.4.21.1-linux-amd64 -balance | grep "Unclaimed balance" | awk '{print $3}')
  DATE=$(date '+%Y-%m-%d %H:%M:%S')

  # Check if the balance has changed
  if [ "$CURRENT_BALANCE" != "$PREVIOUS_BALANCE" ]; then
    # Send the data to the API endpoint
    curl -X POST -H "Content-Type: application/json" \
    -d "{\"peer_id\":\"$PEER_ID\", \"balance\":\"$CURRENT_BALANCE\", \"timestamp\":\"$DATE\"}" \
    http://127.0.0.1:3000/api/miner
    
    # Update the previous balance
    PREVIOUS_BALANCE=$CURRENT_BALANCE
  fi

  # Wait for 1 second before the next iteration
  sleep 1
done