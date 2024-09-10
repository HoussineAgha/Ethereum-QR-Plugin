export interface ITransactionData {
    to: string;
    from?:string;
    value: string ;
    gas?: string ;
    gasPrice?: string | bigint;
    data?: string | null;
    nonce?:number | bigint;
  }
  
export interface EthereumProvider {
    isMetaMask?: boolean;
    request: (args: { method: string; params?: any[] }) => Promise<any>;
  }

export interface Window {
    ethereum?: EthereumProvider;
  }

  export interface IETHCustomERC20 {
    erc20: string;
    to: string;
    value: string;
  }