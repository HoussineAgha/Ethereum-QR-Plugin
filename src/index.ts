import  { utils, Web3Context, Web3PluginBase  } from "web3";
import jsQR from "jsqr";
import QRCode from "qrcode";
import { createCanvas, loadImage } from "canvas";
import { isAddress } from "web3-validator";
import  {ITransactionData , IETHCustomERC20 }  from "./transaction";

export class QrPlugin extends Web3PluginBase {
  
  public pluginNamespace = "qr";


  constructor(){
    super();

  }
  /**
   * Validate wallet address
   * @param address wallet address
   * @returns if address is valid
   */
  private isValidAddress(address: string): boolean {
    return isAddress(address);
  }

  /**
   * Generate QR Code from Ethereum wallet address
   * @param address Wallet address
   * @param options Additional options for QR Code
   * @returns URL of QR Code image
   */
  async generateQRCode(
    address: string,
    options?: QRCode.QRCodeToDataURLOptions
  ): Promise<string> {
    if (!this.isValidAddress(address)) {
      throw new Error("Invalid Ethereum address");
    }

    const defaultOptions: QRCode.QRCodeToDataURLOptions = {
      errorCorrectionLevel: "H",
      type: "image/png",
      scale: 4,
      width: 200,
      margin: 2,
      ...options,
    };

    try {
      const result = await QRCode.toDataURL(address, defaultOptions);
      return result;
    } catch (error) {
      throw new Error("Failed to generate QR Code");
    }
  }

  /**
   * Read a QR code to extract the Ethereum wallet address
   * @param qrImageBase64 Base64 encoded image of QR Code
   * @returns Extracted wallet address from QR Code
   */
  async readQRCode(qrImageBase64: string): Promise<string> {
    const qrImage = Buffer.from(qrImageBase64, "base64");

    const img = await loadImage(qrImage);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);

    const imageData = ctx.getImageData(0, 0, img.width, img.height);

    const code = jsQR(imageData.data, img.width, img.height);

    if (!code) {
      throw new Error("Failed to read QR Code");
    }

    const address = code.data.trim();
    if (!this.isValidAddress(address)) {
      throw new Error("Invalid Ethereum address in QR Code");
    }

    return address;
  }

  /**
   * Generate a QR Code containing transaction data
   * @param transactionData Transaction data to encode in the QR Code
   * @param options Additional options for QR Code generation
   * @param chainId Additional options fro Chain Id
   * @returns URL of the QR Code image
   */
  async generateTransactionQRCode(
    transactionData: ITransactionData & { chainId?: number },
    options?: QRCode.QRCodeToDataURLOptions
  ): Promise<string> {


    const { to, value, gas, data, chainId  } = transactionData;

    const gasPrice  = await this._requestManager.send({
      method: "eth_gasPrice",
      params:[],
    });

    // Get chainId from the transactionData or fetch it dynamically
    const getChainId = chainId || await this._requestManager.send({
      method: "eth_chainId",
      params:[]
    });


    // Validate the Ethereum address
    if (!this.isValidAddress(to)) {
      throw new Error("Invalid Ethereum address");
    }

    if (typeof value !== 'string' || isNaN(Number(value)) || Number(value) < 0) {
      throw new Error(
        `Provided 'value' is not a valid amount of Ether: ${value}`,
      );
    }

    //Check data after generate uri for metamask
    const transactionParameters: ITransactionData = {
      to: to,
      value: utils.toWei(value, 'ether'),
      gas: gas ? gas.toString() : '21000',
      gasPrice: gasPrice,
      data: data || '',
    };


    // Construct the deeplink URI
      const uri = `ethereum:${transactionParameters.to}@${getChainId}?value=${transactionParameters.value}`
       + `${transactionParameters.gas ? '&gas=' + transactionParameters.gas : ''}`
       + `${transactionParameters.gasPrice ? '&gasPrice=' + transactionParameters.gasPrice : ''}`
       + `${transactionParameters.data ? '&data=' + transactionParameters.data : ''}`;

    const defaultOptions: QRCode.QRCodeToDataURLOptions = {
      errorCorrectionLevel: "H",
      type: "image/png",
      scale: 4,
      width: 200,
      margin: 2,
      ...options,
    };

    try {
      return await QRCode.toDataURL(uri, defaultOptions);
    } catch (error) {
      throw new Error("Failed to generate QR Code");
    }
  }

  /**
   * Read a QR Code to extract transaction data and execute the transaction
   * @param qrImageBase64 Base64 encoded image of the QR Code
   * @returns Transaction hash
   */
  async readTransactionQRCode(qrImageBase64: string): Promise<void> {
   
    const qrImage = Buffer.from(qrImageBase64, "base64");
  
 
    const img = await loadImage(qrImage);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);
  

    const imageData = ctx.getImageData(0, 0, img.width, img.height);
  
 
    const code = jsQR(imageData.data, img.width, img.height);
  
    if (!code) {
      throw new Error("Failed to read QR Code");
    }
  
    let transactionData;
    try {
      transactionData = JSON.parse(code.data);
    } catch (error) {
      throw new Error("Invalid QR Code format");
    }
  
    const { to, value, gas, data } = transactionData;

    const gasPrice  = await this._requestManager.send({
      method: "eth_gasPrice",
      params:[],
    });
  
    if (!this.isValidAddress(to)) {
      throw new Error("Invalid Ethereum address in QR Code");
    }
    //return transactionData ;
  
    const ethereum = (Window as any).ethereum;
    if (!ethereum) {
      throw new Error('MetaMask is not installed');
    }
  
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const fromAddress: string = accounts[0];
  
    let transactionParameters : ITransactionData = {
      to: to,
      from: fromAddress,
      value: utils.toWei(value, 'ether'),
      gas: gas || '21000', 
      gasPrice: gasPrice || undefined, 
      data: data || ''
    };
  
    try {
      const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });
      console.log('Transaction sent, hash:', txHash);
    } catch (error) {
      console.error('Transaction failed:', error);
    }
    
  }


  /**
   * Generates a QR code for an ERC20 token transfer on the Ethereum.
   * The QR code encodes a URI for initiating a token transfer.
   * 
   * @param ethCustomERC20Params - Parameters for the ERC20 transfer:
   *   - `erc20`: ERC20 token contract address
   *   - `to`: Recipient's Ethereum address
   *   - `value`: Amount of tokens to transfer (in Ether)
   * 
   * @returns A Data URL of the generated QR code
   * 
   * @throws Error if invalid addresses or value are provided
   */
   async getQrEthereumCustomERC20(
    ethCustomERC20Params: IETHCustomERC20 & { chainId?: number } , options?: QRCode.QRCodeToDataURLOptions
  ): Promise<string> {
    try {
      const { erc20, to, value , chainId} = ethCustomERC20Params;
  
      if (!this.isValidAddress(erc20)) {
        throw new Error(`Provided 'erc20' address is not a valid ERC20 Contract address: ${erc20}`);
      }
  
      if (!this.isValidAddress(to)) {
        throw new Error(`Provided 'to' address is not a valid Ethereum address: ${to}`);
      }
  
      if (typeof value !== 'string' || isNaN(Number(value)) || Number(value) < 0) {
        throw new Error(`Provided 'value' is not a valid amount of Ether: ${value}`);
      }

      const getChainId = chainId || await this._requestManager.send({
        method: "eth_chainId",
        params:[]
      });

      //Check data after generate uri for metamask
      const transactionParameters: IETHCustomERC20 = {
        to: to,
        value: utils.toWei(value, 'ether'),
        erc20:erc20
      };

      const defaultOptions: QRCode.QRCodeToDataURLOptions = {
        errorCorrectionLevel: "H",
        type: "image/png",
        scale: 4,
        width: 200,
        margin: 2,
        ...options,
      };
    
      const qrData = `ethereum:${transactionParameters.erc20}@${getChainId}/transfer?address=${transactionParameters.to}&uint256=${transactionParameters.value}`

      const qr = await QRCode.toDataURL(qrData);
      return qr;
  
    } catch (error) {
      throw error;
    }
  }

  public link(parentContext: Web3Context) {
    super.link(parentContext);
    console.log('provider is : ',this.provider);
  }
  
}

// Module Augmentation
declare module "web3" {
  interface Web3Context {
    qr: QrPlugin;
  }
}
