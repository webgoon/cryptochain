const redis = require('redis');

const CHANNELS = {
  TEST: 'TEST',
  BLOCKCHAIN: 'BLOCKCHAIN',
  TRANSACTION: 'TRANSACTION'
};

class PubSub{
    constructor({ blockchain, transactionPool, wallet }){
      this.wallet = wallet;
      this.blockchain = blockchain;
      this.transactionPool = transactionPool;

      this.publisher = redis.createClient();
      this.subscriber = redis.createClient();

      this.subscribeToChannels();
       

      this.subscriber.on(
        'message', 
        (channel, message) => this.handleMessage(channel, message)
        );
    }

    handleMessage(channel, message) {
      console.log(`Message received. Channel: ${channel}. Message: ${message}.`);
      
      const parsedMessage = JSON.parse(message);

      switch(channel) {
        case CHANNELS.BLOCKCHAIN:
          this.blockchain.replaceChain(parsedMessage, true, () => {
            this.transactionPool.clearBlockchainTransactions({
              chain: parsedMessage
            });
          });
          break;
          case CHANNELS.TRANSACTION:
            if (!this.transactionPool.existingTransaction({
              inputAddress: this.wallet.publicKey
            })) {
              this.transactionPool.setTransaction(parsedMessage);
            }
            break;
        default:
          return;
      }

      
    }

    subscribeToChannels(){
      Object.values(CHANNELS).forEach(channel => {
        this.subscriber.subscribe(channel);
      });
      
    }

    // This is to make sure that publisher non sequential messages to the same local subscriber
    publish({ channel, message}){
      this.subscriber.unsubscribe(channel, () => {
         this.publisher.publish(channel, message, () => {
          this.subscriber.subscribe(channel);
         });
      });
    }

    broadcastChain(){
      this.publish({
        channel: CHANNELS.BLOCKCHAIN,
        message: JSON.stringify(this.blockchain.chain)
      });
    }

    broadcastTransaction(transaction) {
      this.publish({
        channel: CHANNELS.TRANSACTION,
        message: JSON.stringify(transaction)
      });
    }
  

  }

  
//const testPubSub = new PubSub();
//setTimeout(() => testPubSub.publisher.publish(CHANNELS.TEST, 'foo'), 1000);

module.exports = PubSub;
