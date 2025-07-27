import { StellarWalletsKit, WalletNetwork, allowAllModules } from '@creit.tech/stellar-wallets-kit';

class StellarWalletService {
  private kit: StellarWalletsKit | null = null;
  private publicKey: string | null = null;
  private selectedWallet: string | null = null;

  async initializeWallet(): Promise<StellarWalletsKit> {
    if (this.kit) {
      return this.kit;
    }

    this.kit = new StellarWalletsKit({
      network: WalletNetwork.TESTNET, // Use TESTNET for development, MAINNET for production
      selectedWalletId: 'freighter', // Default to Freighter wallet
      modules: allowAllModules(), // Allow all available wallet modules
    });

    return this.kit;
  }

  async connectWallet(): Promise<{ publicKey: string; walletType: string }> {
    try {
      const kit = await this.initializeWallet();
      
      // Request connection
      const { address } = await kit.getAddress();
      this.publicKey = address;
      this.selectedWallet = 'stellar-wallet'; // Generic wallet type since we can't get specific type easily
      
      if (!this.publicKey) {
        throw new Error('Failed to get public key from wallet');
      }

      // Store in localStorage for persistence
      localStorage.setItem('stellar_wallet_connected', 'true');
      localStorage.setItem('stellar_public_key', this.publicKey);
      localStorage.setItem('stellar_wallet_type', this.selectedWallet);

      return {
        publicKey: this.publicKey,
        walletType: this.selectedWallet,
      };
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw new Error('Failed to connect to Stellar wallet');
    }
  }

  async disconnectWallet(): Promise<void> {
    this.publicKey = null;
    this.selectedWallet = null;
    this.kit = null;

    // Clear localStorage
    localStorage.removeItem('stellar_wallet_connected');
    localStorage.removeItem('stellar_public_key');
    localStorage.removeItem('stellar_wallet_type');
  }

  isConnected(): boolean {
    return (
      this.publicKey !== null ||
      localStorage.getItem('stellar_wallet_connected') === 'true'
    );
  }

  getPublicKey(): string | null {
    if (this.publicKey) {
      return this.publicKey;
    }
    
    return localStorage.getItem('stellar_public_key');
  }

  getWalletType(): string | null {
    if (this.selectedWallet) {
      return this.selectedWallet;
    }
    
    return localStorage.getItem('stellar_wallet_type');
  }

  async signTransaction(xdr: string): Promise<string> {
    try {
      const kit = await this.initializeWallet();
      
      if (!this.isConnected()) {
        throw new Error('Wallet not connected');
      }

      const { signedTxXdr } = await kit.signTransaction(xdr, {
        networkPassphrase: WalletNetwork.TESTNET,
      });

      return signedTxXdr;
    } catch (error) {
      console.error('Failed to sign transaction:', error);
      throw new Error('Failed to sign transaction');
    }
  }

  formatPublicKey(publicKey?: string): string {
    const key = publicKey || this.getPublicKey();
    if (!key) return '';
    
    return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
  }
}

// Export singleton instance
export const stellarWalletService = new StellarWalletService();
export default stellarWalletService;
