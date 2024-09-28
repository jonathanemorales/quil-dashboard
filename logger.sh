# Navigate to the correct directory
cd ./ceremonyclient/node || exit 1  # Exit if directory change fails

# Fetch balance and peer ID
PEER_ID=$(./node-1.4.21.1-linux-amd64 -peer-id | grep "Peer ID" | awk '{print $3}')
BALANCE=$(./node-1.4.21.1-linux-amd64 -balance | grep "Unclaimed balance" | awk '{print $3}')

DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Send the data to the Flask server
curl -X POST -H "Content-Type: application/json" \
-d "{\"peer_id\":\"$PEER_ID\", \"balance\":\"$BALANCE\", \"timestamp\":\"$DATE\"}" \
http://0.0.0.0:3000/api/miner