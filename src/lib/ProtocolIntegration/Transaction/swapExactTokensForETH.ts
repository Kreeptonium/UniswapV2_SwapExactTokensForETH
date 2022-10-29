import Web3 from "web3";
//import {TransactionReceipt} from "web3-eth";
import { AbiItem } from 'web3-utils';
//import {TransactionConfig} from "web3-core";
import * as dotenv from "dotenv";
import {ISwapExactTokensForETHDataModel} from "../Model/swapExactTokensForETHDataModel";
//import {ISwapExactTokensForETHTransactionModel} from "../Model/swapExactTokensForETHTransactionModel";


//Configuring the directory path to access .env file
dotenv.config();

//Accessing UniswapV3Router contract's ABI
const UniswapV2Router02ABI = require('../../../../src/lib/abi/UniswapV2Router02ABI.json');
let encoded_tx: string;

export const swapExactTokensForETHAsync = async(swapExactTokensForETHDataModel:ISwapExactTokensForETHDataModel) : Promise<any>=> {

  // Setting up Ethereum blockchain Node through Infura
  const web3 = new Web3(process.env.infuraUrlRinkeby!);
  //Providing Private Key
  const activeAccount = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY!);
  
  // Initialising the Uniswap Router Contract
  const uniswapV2Router02Contract = new web3.eth.Contract(UniswapV2Router02ABI as AbiItem[], process.env.UniswapV2RinkebyRouter02Address);

  //Setting up the deadline for the transaction
  const expiryDate = Math.floor(Date.now() / 1000) + 900;

  // Get WETH address
  const WETH_ADDRESS = await uniswapV2Router02Contract.methods.WETH().call();

  // Array of tokens addresses
  const pairArray = [swapExactTokensForETHDataModel.TokenIn,WETH_ADDRESS];

  //get Token Out amount
  const ethOut = await uniswapV2Router02Contract.methods.getAmountsOut(web3.utils.toWei(swapExactTokensForETHDataModel.AmountIn!.toString()), pairArray).call();
  console.log("Actual Ether: ",web3.utils.toWei("0.01"));
  console.log("Derived Ether: ",ethOut);
  // Setting up Quantity in Ether (wei)
  const executionQty = ethOut[1];
  console.log("Execution Qty:", executionQty);

  //Get Balance
  //const getBalance = await web3.eth.getBalance(activeAccount.address);

  const amountsOut = await uniswapV2Router02Contract.methods.getAmountsOut(ethOut[1], pairArray).call();
  console.log("Amounts Out: ",amountsOut);
  //Calculate AmountOutMin
  const slippage = swapExactTokensForETHDataModel.Slippage;
  let amountOutMin =
  parseFloat(web3.utils.fromWei(amountsOut[1])) -
  (parseFloat(web3.utils.fromWei(amountsOut[1])) * slippage);
  const amountOutMinBN = web3.utils.toBN(web3.utils.toWei(amountOutMin.toFixed(18).toString()));


    try {

       // The call to `swapExactTokensForETH` executes the swap.
      let tx_builder = uniswapV2Router02Contract.methods.swapExactTokensForETH(executionQty,
      amountOutMinBN, pairArray, activeAccount.address, expiryDate);
      encoded_tx = tx_builder.encodeABI();
           
          } catch (error) {
           
            throw(error);
          }

  return encoded_tx;
  
}






// encoded_tx  = new Promise<any>((resolve,reject)=>{

//   try {

//      // The call to `swapExactTokensForETH` executes the swap.
//     let tx_builder = uniswapV2Router02Contract.methods.swapExactTokensForETH(executionQty,
//     amountOutMinBN, pairArray, activeAccount.address, expiryDate);
//     encoded_tx = tx_builder.encodeABI();
//          resolve(tx_builder ?? null);

//         } catch (error) {
//           reject(error);
//           throw(error);
//         }
//   });