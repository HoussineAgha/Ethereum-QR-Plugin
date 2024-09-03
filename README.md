# Ethereum QR Plugin

The Ethereum QR Plugin is a versatile and easy-to-use plugin for generating and reading QR codes for Ethereum wallet addresses and transactions. This plugin is designed to integrate seamlessly with `web3.js`, or it can be used as a standalone module in your JavaScript/TypeScript projects. It supports the EIP-681 standard for encoding transaction requests into QR codes.

## Features

- **Generate QR Code:** Convert Ethereum wallet addresses / contract addresses into QR codes.
- **Read QR Code:** Extract Ethereum wallet addresses / contract addresses from QR codes.
- **Generate Transaction QR Code:** Create QR codes that encode Ethereum transactions, following EIP-681.
- **Read Transaction QR Code:** Decode QR codes to extract and execute Ethereum transactions.
- **Generate ERC20 Transfer QR Code:** Create QR codes for ERC20 token transfers.
- **Address Validation:** Ensures the Ethereum addresses used are valid before generating QR codes and after reading them , and check for value intred.

## Installation

Install the plugin via npm:

```bash
npm install ethereum-qr-plugin
```

This will automatically install all required dependencies, including `web3`, `jsqr`, `qrcode`, `canvas`, and `web3-validator`.

## Usage

The plugin can be used in two different ways: integrated with `web3.js` or as a standalone module.

### Option 1: Using the Plugin with `web3.js`

This method integrates the plugin directly with `web3`, making it a part of the `web3` instance.

#### Example

```typescript
import Web3 from 'web3';
import { QrPlugin } from 'ethereum-qr-plugin';

// Initialize Web3
const web3 = new Web3('YOUR_PROVIDER_URL');  // Sepolia , Mainnet

// Extend Web3 with the QR Plugin
web3.extend({
  property: 'qr',
  methods: [new QrPlugin()]
});

// Generate a QR Code for an Ethereum address
  const options = {}// (this param is optional): QR code generation options (e.g., error correction level, image format, scale).
  await web3.qr.generateQRCode('YOUR_ADDRESS' , options)
  .then(qrCodeUrl => {
    console.log('QR Code URL:', qrCodeUrl);
  })
  .catch(err => {
    console.error('Failed to generate QR Code:', err);
  });

// Read a QR Code to extract the Ethereum address
  const qrImageBase64 = 'data:image/png;base64,...';
  await web3.qr.readQRCode(qrImageBase64)
  .then(address => {
    console.log('Extracted Ethereum address:', address);
  })
  .catch(err => {
    console.error('Failed to read QR Code:', err);
  });

  //Generate a QR Code with Transaction Ethereum
    const options = {}// (this param is optional): QR code generation options (e.g., error correction level, image format, scale).
    const transactionData  = {
    to: 'YOUR_ADDRESS',           //required
    value: '0.000001',            //required
    gas:'',                       //optional , If not entered explicitly, the function will calculate the latest gas price for the network.
    gasPrice: '',                 //optional , If not entered explicitly, the function will calculate the latest gas price for the network.
    data: 'this for test',        //optional , It can be sent when dealing with contracts.
    chainId: ChainId.SEPOLIA,     //optional (SEPOLIA or MAINNET) , If it is not entered, the function will know it from the provider that was passed.
  };
  await web3.qr.generateTransactionQRCode(transactionData,options)
  .then(qrCodeUrl => {
    console.log('QR Code URL :', qrCodeUrl);
  })
  .catch(err => {
    console.error('Failed to generate QR Code:', err);
  });

    //Generate a QR Code with Ethereum Custom ERC20 
    const options = {}// (this param is optional): QR code generation options (e.g., error correction level, image format, scale).
    const transactionData  = {
    to: 'YOUR_ADDRESS',           //required , Custom Contract
    value: '1',                   //required ,  token
    erc20:'',                     //required , Link Token Contract in Sepolia
    chainId: ChainId.SEPOLIA.     //optional (SEPOLIA or MAINNET) , If it is not entered, the function will know it from the provider that was 
  };
  await web3.qr.getQrEthereumCustomERC20(transactionData)
  .then(qrCodeUrl => {
    console.log('QR Code URL :', qrCodeUrl);
  })
  .catch(err => {
    console.error('Failed to generate QR Code:', err);
  });

  //Read QR Transaction 
  const qrImageBase64 = 'data:image/png;base64,...'; // This should contain a transaction.
  await web3.qr.readTransactionQRCode(qrImageBase64)
  .then(responce => {
    console.log('Extracted :', responce);
  })
  .catch(err => {
    console.error('Failed to read QR Code:', err);
  });

```

 ---
  **NOTE**

 readTransactionQRCode Method : can be integrated with any QR application you program, and through it your application can execute a transaction via MetaMask, as it checks whether the MetaMask application is installed or not, if it is installed, the QR application being manufactured can create a transaction on MetaMask, otherwise it gives an error asking to install the MetaMask application.

  ---

### Option 2: Using the Plugin as a Standalone Module

This method allows you to use the plugin independently of `web3`.

#### Example

```typescript
import { QrPlugin } from 'ethereum-qr-plugin';

// Create an instance of the plugin
const qrPlugin = new QrPlugin();

// Generate a QR Code for an Ethereum address
await qrPlugin.generateQRCode('YOUR_ADDRESS')
  .then(qrCodeUrl => {
    console.log('QR Code URL:', qrCodeUrl);
  })
  .catch(err => {
    console.error('Failed to generate QR Code:', err);
  });

// Read a QR Code to extract the Ethereum address
const qrImageBase64 = 'data:image/png;base64,...';
await qrPlugin.readQRCode(qrImageBase64)
  .then(address => {
    console.log('Extracted Ethereum address:', address);
  })
  .catch(err => {
    console.error('Failed to read QR Code:', err);
  });


  //Generate a QR Code with Transaction Ethereum
  const transactionData  = {
  to: 'YOUR_ADDRESS',           //required
  value: '0.000001',            //required
  gas:'',                       //optional , If not entered explicitly, the function will calculate the latest gas price for the network.
  gasPrice: '',                 //optional , If not entered explicitly, the function will calculate the latest gas price for the network.
  data: 'this for test',        //optional , It can be sent when dealing with contracts.
  chainId: ChainId.SEPOLIA,     //optional (SEPOLIA or MAINNET) , If it is not entered, the function will know it from the provider that was passed.
};
  await qrPlugin.generateTransactionQRCode(transactionData)
  .then(qrCodeUrl => {
    console.log('QR Code URL :', qrCodeUrl);
  })
  .catch(err => {
    console.error('Failed to generate QR Code:', err);
  });
```

## API Documentation

### `generateQRCode(address: string, options?: QRCode.QRCodeToDataURLOptions): Promise<string>`

Generates a QR code for the given Ethereum address.

- **address**: The Ethereum address to encode in the QR code.
- **options** (optional): QR code generation options (e.g., error correction level, image format, scale).
- **Returns**: A promise that resolves to the data URL of the generated QR code.

### `readQRCode(qrImageBase64: string): Promise<string>`

Reads a QR code from a base64-encoded image and extracts the Ethereum address.

- **qrImageBase64**: The base64-encoded image of the QR code.
- **Returns**: A promise that resolves to the extracted Ethereum address.

### `generateTransactionQRCode(transactionData: ITransactionData & { chainId?: number }, options?: QRCode.QRCodeToDataURLOptions): Promise<string>`

Generates a QR code containing Ethereum transaction data, following the EIP-681 standard.

- **transactionData**: The transaction data to encode in the QR code.
- **options** (optional): QR code generation options.
- **Returns**: A promise that resolves to the data URL of the generated QR code.

### `readTransactionQRCode(qrImageBase64: string): Promise<void>`

Reads a QR code containing Ethereum transaction data and executes the transaction.

- **qrImageBase64**: The base64-encoded image of the QR code.
- **Returns**: A promise that resolves to the transaction hash.

### `getQrEthereumCustomERC20(ethCustomERC20Params: IETHCustomERC20 & { chainId?: number }, options?: QRCode.QRCodeToDataURLOptions): Promise<string>`

Generates a QR code for an ERC20 token transfer, encoding a URI that follows the EIP-681 standard.

- **ethCustomERC20Params**: Parameters for the ERC20 transfer, including the contract address, recipient address, and token amount.
- **options** (optional): QR code generation options.
- **Returns**: A promise that resolves to the data URL of the generated QR code.

## Error Handling

All methods throw errors if something goes wrong (e.g., invalid Ethereum address, failure to generate/read the QR code). Ensure to use `.catch` in your promise chains or `try-catch` blocks for better error handling.

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/HoussineAgha/Ethereum-QR-Plugin/issues) if you have any questions or ideas.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

This plugin leverages the following libraries:

- [web3.js]
- [web3-validator]
- [jsQR]
- [qrcode]
- [canvas]

## Support

For any questions or issues, please open an issue on the GitHub repository.
```