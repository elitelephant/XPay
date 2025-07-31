import * as StellarSdk from '@stellar/stellar-sdk';

// Enhanced types for our application
export interface StellarTransaction {
  id: string;
  hash: string;
  created_at: string;
  fee_charged: string;
  successful: boolean;
  source_account: string;
  operations: StellarOperation[];
  ledger: number;
  envelope_xdr: string;
  result_xdr: string;
}

export interface StellarOperation {
  id: string;
  type: string;
  type_i: number;
  amount?: string;
  asset_code?: string;
  asset_issuer?: string;
  from?: string;
  to?: string;
  source_account?: string;
  starting_balance?: string;
  funder?: string;
  account?: string;
  transaction_hash: string;
  created_at: string;
}

export interface StellarBalance {
  balance: string;
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
  limit?: string;
  buying_liabilities?: string;
  selling_liabilities?: string;
}

export interface PaymentData {
  id: string;
  date: string;
  amount: number;
  token: string;
  status: "completed" | "pending" | "converting" | "failed";
  hash: string;
  from_account?: string;
  to_account?: string;
  operation_type?: string;
  direction: "incoming" | "outgoing";
  fee?: string;
  memo?: string;
}

export interface NetworkConfig {
  isTestnet: boolean;
  horizonUrl: string;
  networkPassphrase: string;
  friendbotUrl?: string;
}

export interface AccountInfo {
  account_id: string;
  sequence: string;
  balances: StellarBalance[];
  signers: any[];
  data: { [key: string]: string };
  flags: {
    auth_required: boolean;
    auth_revocable: boolean;
    auth_immutable: boolean;
  };
  thresholds: {
    low_threshold: number;
    med_threshold: number;
    high_threshold: number;
  };
}

class StellarService {
  private server: StellarSdk.Horizon.Server;
  private networkConfig: NetworkConfig;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(isTestnet: boolean = true) {
    this.networkConfig = {
      isTestnet,
      horizonUrl: isTestnet 
        ? 'https://horizon-testnet.stellar.org'
        : 'https://horizon.stellar.org',
      networkPassphrase: isTestnet 
        ? StellarSdk.Networks.TESTNET 
        : StellarSdk.Networks.PUBLIC,
      friendbotUrl: isTestnet ? 'https://friendbot.stellar.org' : undefined
    };
    
    this.server = new StellarSdk.Horizon.Server(this.networkConfig.horizonUrl);
    
    console.log(`Stellar Service initialized for ${isTestnet ? 'TESTNET' : 'MAINNET'}`);
  }

  /**
   * Event system for real-time updates
   */
  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Get network configuration
   */
  getNetworkConfig(): NetworkConfig {
    return { ...this.networkConfig };
  }

  /**
   * Get account information including balances
   */
  async getAccountInfo(publicKey: string): Promise<{
    balances: StellarBalance[];
    account: StellarSdk.Horizon.AccountResponse;
  }> {
    try {
      console.log(`Loading account info for: ${publicKey}`);
      const account = await this.server.loadAccount(publicKey);
      
      this.emit('accountLoaded', { publicKey, account });
      
      return {
        balances: account.balances as StellarBalance[],
        account
      };
    } catch (error) {
      console.error('Error loading account:', error);
      this.emit('error', { type: 'accountLoad', error, publicKey });
      throw new Error(`Failed to load account information: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get account balances formatted for display with real-time updates
   */
  async getAccountBalances(publicKey: string): Promise<{ [asset: string]: number }> {
    try {
      const { balances } = await this.getAccountInfo(publicKey);
      
      const formattedBalances = balances.reduce((acc, balance) => {
        const assetCode = balance.asset_type === 'native' ? 'XLM' : balance.asset_code || 'Unknown';
        acc[assetCode] = parseFloat(balance.balance);
        return acc;
      }, {} as { [asset: string]: number });

      console.log(`Account balances for ${publicKey}:`, formattedBalances);
      this.emit('balancesUpdated', { publicKey, balances: formattedBalances });
      
      return formattedBalances;
    } catch (error) {
      console.error('Error getting balances:', error);
      this.emit('error', { type: 'balances', error, publicKey });
      return {};
    }
  }

  /**
   * Get transactions for an account
   */
  async getAccountTransactions(
    publicKey: string, 
    limit: number = 20
  ): Promise<StellarTransaction[]> {
    try {
      const transactions = await this.server.transactions()
        .forAccount(publicKey)
        .limit(limit)
        .order('desc')
        .includeFailed(false)
        .call();

      // Get operations for each transaction
      const transactionsWithOps = await Promise.all(
        transactions.records.map(async (tx) => {
          try {
            const operations = await this.server.operations()
              .forTransaction(tx.hash)
              .call();

            return {
              id: tx.id,
              hash: tx.hash,
              created_at: tx.created_at,
              fee_charged: tx.fee_charged,
              successful: tx.successful,
              source_account: tx.source_account,
              ledger: tx.ledger_attr,
              envelope_xdr: tx.envelope_xdr,
              result_xdr: tx.result_xdr,
              operations: operations.records.map(op => ({
                id: op.id,
                type: op.type,
                type_i: op.type_i,
                transaction_hash: tx.hash,
                created_at: op.created_at,
                source_account: op.source_account,
                ...(op as any) // Include all other operation-specific fields
              })) as StellarOperation[]
            } as StellarTransaction;
          } catch (error) {
            console.error(`Error getting operations for tx ${tx.hash}:`, error);
            return {
              id: tx.id,
              hash: tx.hash,
              created_at: tx.created_at,
              fee_charged: tx.fee_charged,
              successful: tx.successful,
              source_account: tx.source_account,
              ledger: tx.ledger_attr,
              envelope_xdr: tx.envelope_xdr,
              result_xdr: tx.result_xdr,
              operations: []
            } as StellarTransaction;
          }
        })
      );

      return transactionsWithOps;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw new Error('Failed to fetch transactions');
    }
  }

  /**
   * Convert Stellar transactions to our Payment format
   */
  async getPaymentsForAccount(publicKey: string, limit: number = 20): Promise<PaymentData[]> {
    try {
      const transactions = await this.getAccountTransactions(publicKey, limit);
      
      const payments: PaymentData[] = [];

      for (const tx of transactions) {
        // Look for payment operations in this transaction
        for (const op of tx.operations) {
          if (this.isPaymentOperation(op)) {
            const payment = this.convertOperationToPayment(tx, op, publicKey);
            if (payment) {
              payments.push(payment);
            }
          }
        }
      }

      // Sort by date (newest first)
      return payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error getting payments:', error);
      throw new Error('Failed to get payments');
    }
  }

  /**
   * Check if an operation is a payment-related operation
   */
  private isPaymentOperation(operation: StellarOperation): boolean {
    const paymentTypes = [
      'payment',
      'path_payment_strict_receive',
      'path_payment_strict_send',
      'create_account'
    ];
    return paymentTypes.includes(operation.type);
  }

  /**
   * Convert a Stellar operation to our Payment format
   */
  private convertOperationToPayment(
    transaction: StellarTransaction,
    operation: StellarOperation,
    userPublicKey: string
  ): PaymentData | null {
    try {
      let amount = 0;
      let token = 'XLM';
      let status: "completed" | "pending" | "converting" | "failed" = 'completed';

      // Extract amount and asset
      if (operation.amount) {
        amount = parseFloat(operation.amount);
      }

      // Determine asset
      if (operation.asset_code) {
        token = operation.asset_code;
      } else if (operation.type === 'create_account') {
        token = 'XLM';
        amount = parseFloat(operation.amount || '0');
      }

      // Determine if this is incoming or outgoing
      const isIncoming = operation.to === userPublicKey;
      const isOutgoing = operation.from === userPublicKey || operation.source_account === userPublicKey;
      
      let direction: "incoming" | "outgoing" = "outgoing";
      if (isIncoming && !isOutgoing) {
        direction = "incoming";
      } else if (operation.type === 'create_account' && operation.account === userPublicKey) {
        direction = "incoming";
      }

      return {
        id: operation.id,
        date: new Date(transaction.created_at).toLocaleString("en-US"),
        amount: amount,
        token: token,
        status: transaction.successful ? 'completed' : 'failed',
        hash: transaction.hash,
        from_account: operation.from || operation.source_account,
        to_account: operation.to || operation.account,
        operation_type: operation.type,
        direction,
        fee: transaction.fee_charged,
        memo: (transaction as any).memo
      };
    } catch (error) {
      console.error('Error converting operation to payment:', error);
      return null;
    }
  }

  /**
   * Stream live transactions for an account
   */
  streamTransactions(
    publicKey: string,
    onTransaction: (transaction: StellarTransaction) => void,
    onError?: (error: any) => void
  ) {
    try {
      const closeStream = this.server.transactions()
        .forAccount(publicKey)
        .cursor('now')
        .stream({
          onmessage: async (transaction) => {
            try {
              // Get operations for the new transaction
              const operations = await this.server.operations()
                .forTransaction(transaction.hash)
                .call();

              const txWithOps: StellarTransaction = {
                id: transaction.id,
                hash: transaction.hash,
                created_at: transaction.created_at,
                fee_charged: String(transaction.fee_charged),
                successful: transaction.successful,
                source_account: transaction.source_account,
                ledger: transaction.ledger_attr,
                envelope_xdr: transaction.envelope_xdr,
                result_xdr: transaction.result_xdr,
                operations: operations.records.map(op => ({
                  id: op.id,
                  type: op.type,
                  type_i: op.type_i,
                  transaction_hash: transaction.hash,
                  created_at: op.created_at,
                  source_account: op.source_account,
                  ...(op as any)
                })) as StellarOperation[]
              };

              onTransaction(txWithOps);
            } catch (error) {
              console.error('Error processing streamed transaction:', error);
              if (onError) onError(error);
            }
          },
          onerror: (error) => {
            console.error('Transaction stream error:', error);
            if (onError) onError(error);
          }
        });

      return closeStream;
    } catch (error) {
      console.error('Error starting transaction stream:', error);
      if (onError) onError(error);
      return () => {}; // Return empty function if stream fails to start
    }
  }

  /**
   * Get transaction details by hash
   */
  async getTransactionDetails(hash: string): Promise<StellarTransaction | null> {
    try {
      const transaction = await this.server.transactions()
        .transaction(hash)
        .call();

      const operations = await this.server.operations()
        .forTransaction(hash)
        .call();

      return {
        id: transaction.id,
        hash: transaction.hash,
        created_at: transaction.created_at,
        fee_charged: String(transaction.fee_charged),
        successful: transaction.successful,
        source_account: transaction.source_account,
        ledger: transaction.ledger_attr,
        envelope_xdr: transaction.envelope_xdr,
        result_xdr: transaction.result_xdr,
        operations: operations.records.map(op => ({
          id: op.id,
          type: op.type,
          type_i: op.type_i,
          transaction_hash: hash,
          created_at: op.created_at,
          source_account: op.source_account,
          ...(op as any)
        })) as StellarOperation[]
      };
    } catch (error) {
      console.error('Error getting transaction details:', error);
      return null;
    }
  }

  /**
   * Check if an account exists on the network
   */
  async accountExists(publicKey: string): Promise<boolean> {
    try {
      await this.server.loadAccount(publicKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get network info
   */
  getNetworkInfo() {
    return {
      isTestnet: this.networkConfig.isTestnet,
      horizonUrl: this.networkConfig.horizonUrl,
      networkPassphrase: this.networkConfig.networkPassphrase
    };
  }

  /**
   * Fund account on testnet (for development)
   */
  async fundTestnetAccount(publicKey: string): Promise<boolean> {
    if (!this.networkConfig.isTestnet || !this.networkConfig.friendbotUrl) {
      throw new Error('Account funding is only available on testnet');
    }

    try {
      const response = await fetch(`${this.networkConfig.friendbotUrl}?addr=${encodeURIComponent(publicKey)}`);
      return response.ok;
    } catch (error) {
      console.error('Error funding testnet account:', error);
      return false;
    }
  }
}

// Export singleton instance
export const stellarService = new StellarService(true); // Using testnet for development
export default stellarService;
