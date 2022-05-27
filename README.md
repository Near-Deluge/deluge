# Deluge: An Ecommerce Platform on Blockchain
`powered by Near Blockchain and IPFS`

Deluge is a scam-proof, blockchain based ecommerce marketplace. It will be powered by the Deluge Token(DLG). Deluge provides a 2 way escrow service by utilizing the power of smart contracts on the Near Network. No hidden fees as all transactions are handled with private keys granting complete control of your fund.

## Codebase Guides

### Smart Contracts
Smart Contracts are Organised in `contracts/` folder. 
Deluge Consists of follwing smart contracts:
- Marketplace Contract
    + This is the main contract for deluge which keep tracks for active orders, products and stores in the marketplace.
- Rating Contract
    + With each successful order, when a user recieves a product and completes and order it creates a rating on rating smart contract to which he/she can provide his honest feedback over the product.
- NFT Contract
    + Every Shop created on Deluge will have a NFT Contracts which generated a NFT Token on each successful order. 
- FT Contract
    + Deluge is a marketplace and inorder to maintain stability of it's currency we need a coin to provide liquidity to the platform as well as have a common notion for product pricing. This will be updated soon. 
| WIP |

### UI

User Interface for deluge is a react based web dApp. 
App the code related to ui is in `app/` folder.
| WIP |

### Testing Scripts

All the testing scripts for localnet and setting up local development environment are in folders : `scripts\` and `utils\`