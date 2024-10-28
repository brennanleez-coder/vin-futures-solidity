# Install Dependencies
```bash
npm install
```
# Compile Contracts
```
npx hardhat compile
```bash

# Run Tests
```bash
npx hardhat test
```
# Deploy smart contracts for local development

## 1. Run a local hardhat node
```bash
    npx hardhat node
```

## Deploy Contracts locally
```bash
    npx hardhat compile && npx hardhat run migrations/1_deploy_contracts.js --network development --show-stack-traces
```

## Import ABI files to frontend
ABI files are located in artifacts/contracts/<Contract>.sol/<Contract>.json

