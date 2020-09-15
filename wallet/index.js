const Transaction = require('./transaction');
const { STARTING_BALANCE } = require('../config');
const { ec, cryptoHash } = require('../util');


class Wallet {
//This is a crucial aspect of the wallet
//To get the economy going we are using some starter money from config file. {STARTING_BALANCE}
  constructor() {
    //Use 1000 from config file make this your actually wallet adddress
    this.balance = STARTING_BALANCE;

   this.keyPair = ec.genKeyPair();

    this.publicKey = this.keyPair.getPublic().encode('hex');
  }

  sign(data){
    return this.keyPair.sign(cryptoHash(data))
  }

  createTransaction({ recipient, amount, chain }) {
    if (chain) {
      this.balance = Wallet.calculateBalance({
        chain,
        address: this.publicKey
      });
    }

    if (amount > this.balance) {
      throw new Error('Amount exceeds balance');
    }

    return new Transaction({ senderWallet: this, recipient, amount });
  }

  static calculateBalance({ chain, address }) {
    let hasConductedTransaction = false;
    let outputsTotal = 0;

    for (let i=chain.length-1; i>0; i--) {
      const block = chain[i];

      for (let transaction of block.data) {
        if (transaction.input.address === address) {
          hasConductedTransaction = true;
        }

        const addressOutput = transaction.outputMap[address];

        if (addressOutput) {
          outputsTotal = outputsTotal + addressOutput;
        }
      }

      if (hasConductedTransaction) {
        break;
      }
    }

    return hasConductedTransaction ? outputsTotal : STARTING_BALANCE + outputsTotal;
  }



};

module.exports = Wallet;
