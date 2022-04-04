import { contractABI, contractAddress } from "../components/utils/constants"
import { createContext, useEffect, useState } from "react";

import { ethers } from "ethers"

export const TransactionContext = createContext();

const { ethereum } = window

const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum)

  const signer = provider.getSigner()

  const TransactionContract = new ethers.Contract(contractAddress, contractABI, signer)

  return TransactionContract
}

export const TransactionProvider = ({ children }) => {

  const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'))
  const [isLoading, setIsLoading] = useState(false)
  const [currentAccount, setCurrentAccount] = useState("")
  const [formData, setFormData] = useState({
    addressTo: "",
    amount: "",
    keyword: "",
    message: ""
  })

  const handleChange = (e, name) => {
    setFormData((prevState) => ({
      ...prevState,
      [name]: e.target.value
    }))
  }

  const checkIfWalletIsConnected = async () => {
    try {
      const accounts = await ethereum.request({ method: "eth_accounts" })

      if (!ethereum) {
        return alert("Please install Metamask")
      }
      if (accounts.length) {
        setCurrentAccount(accounts[0])
      } else {
        console.log("No Accounts Found");
      }
      // Get metamask connected accounts
    } catch (error) {
      console.log(error);
      throw new Error("No Ethereum Object")
    }
  }

  const connectWallet = async () => {
    try {
      if (!ethereum) {
        return alert("Please install Metamask")
      }
      // Get metamask connected accounts
      const account = await ethereum.request({ method: "eth_requestAccounts" })
      setCurrentAccount(account[0])

    } catch (error) {
      console.log(error);
      throw new Error("No Ethereum Object")
    }
  }

  const sendTransaction = async () => {
    try {
      if (!ethereum) return alert("Please install Metamask")

      const { addressTo, amount, keyword, message } = formData
      const parsedAmount = ethers.utils.parseEther(amount)

      const transactionContract = getEthereumContract()

      // Send Ethereum
      await ethereum.request({
        method: "eth_sendTransaction",
        params: [{
          from: currentAccount,
          to: addressTo,
          gas: "0x5208", //21000 gwei
          value: parsedAmount._hex,
        }]
      })

      // Accept Ethereum
      const transactionHash = await transactionContract.addToBlockchain(addressTo, parsedAmount, message, keyword)
      setIsLoading(true)
      console.log(`Loading transaction ${transactionHash.hash}`);

      await transactionHash.wait();
      setIsLoading(false)
      console.log(`Success - ${transactionHash.hash}`);
      const transactionCount = await transactionContract.getTransactionCount()
      setTransactionCount(transactionCount.toNumber())


    } catch (error) {
      console.log(error);
      throw new Error("No Ethereum Object")
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        currentAccount,
        handleChange,
        formData,
        setFormData,
        sendTransaction
      }}
    >
      {children}
    </TransactionContext.Provider>
  )
}