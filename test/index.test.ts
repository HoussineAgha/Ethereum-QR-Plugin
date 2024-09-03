import { Web3, core } from "web3";
import { QrPlugin } from "../src";
import { ChainId } from "../src/select_chain";

describe("QrPlugin Tests", () => {
  const provider = 'https://mainnet.infura.io/v3/KEY_VALUE';
  const providertest = 'https://sepolia.infura.io/v3/KEY_VALUE';
  const address = '0x82c9e8F1043550Ed46ecdf63ceD8CaeE758b654d';
  const dataurl = 'data:image/png;base64,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';

  it("should register QrPlugin plugin on Web3Context instance", () => {
    const web3Context = new core.Web3Context(providertest);
    web3Context.registerPlugin(new QrPlugin());
    expect(web3Context.qr).toBeDefined();
  });

  describe("QrPlugin method tests", () => {

    let web3: Web3;

    beforeAll(() => {
      web3 = new Web3(providertest);
      web3.registerPlugin(new QrPlugin());
    });


    it("should call QrPlugin test method (generateQRCode) with expected param", async() => {
      const res = await web3.qr.generateQRCode(address);
      //console.log('This Is Data URL : ' , res);
      expect(res);
    });


    it("should call QrPlugin test method (readQRCode) with expected param", async() => {
      const base64 : string = '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';
      const res = await web3.qr.readQRCode(base64);
      console.log('This Is Address : ' , res);
      expect(res);
    });


    it('should call QrPlugin test method (generateTransactionQRCode) with expected param', async () => {
      const transactionData  = {
        to: address,
        value: '0.00012',
        gas:'21000',
        data: 'this for test',
        chainId: ChainId.SEPOLIA,
      };

      const dataURL = await web3.qr.generateTransactionQRCode(transactionData);
      console.log('this is dataurl : ', dataURL);
      expect(dataURL).toMatch(/^data:image\/png;base64,/);
    });



    it("should call QrPlugin test method (readTransactionQRCode) with expected param", async() => {
      const base64 : string = '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';
      const res = await web3.qr.readTransactionQRCode(base64);
      console.log('This Is Address : ' , res);
      expect(res);
    });



    it('should call QrPlugin test method (getQrEthereumCustomERC20) with expected param', async () => {
      const transactionData  = {
        to: '0x21029f3F80fD633bc7273079B5a01ce9De988c99',
        value: '1',
        erc20:'0x779877A7B0D9E8603169DdbD7836e478b4624789', // Link Token Contract in Sepolia
        chainId: ChainId.SEPOLIA,
      };

      const dataURL = await web3.qr.getQrEthereumCustomERC20(transactionData);
      console.log('this is dataurl : ', dataURL);
      expect(dataURL).toMatch(/^data:image\/png;base64,/);
    });

    
  });
});
