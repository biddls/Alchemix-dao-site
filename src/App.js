import React, { Component } from 'react';
import Web3 from 'web3'
import './App.css';
import { useState } from 'react';
import { ethers } from 'ethers';

import daoNFTsABI from "./artifacts/@openzeppelin/contracts/token/ERC1155/presets/ERC1155PresetMinterPauser.sol/ERC1155PresetMinterPauser.json"
import mapABI from "./artifacts/contracts/ALCX_map.sol/ALCX_map.json"
import mapNFTsABI from "./artifacts/@openzeppelin/contracts/token/ERC721/ERC721.sol/ERC721.json"

const Map_Addr = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
const MapNFT_Addr = "0x75537828f2ce51be7289709686A69CbFDbB714F1"
const alcDAO_Addr = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"


class App extends Component {

    async componentWillMount() {
        await this.loadWeb3()
        await this.loadBlockChainData()
    }

    async loadWeb3() {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum)
            await window.ethereum.enable()
        } else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider)
        } else {
            window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    }

    async loadBlockChainData() {
        const web3 = window.web3
        const accounts = await web3.eth.getAccounts()
        this.setState({account: accounts[0]})

        const networkId = await web3.eth.net.getId()
        if(networkId === 31337) {
            const map = new web3.eth.Contract(mapABI.abi, Map_Addr)
            const mapNFTs = new web3.eth.Contract(mapNFTsABI.abi, MapNFT_Addr)
            const daoNFTs = new web3.eth.Contract(daoNFTsABI.abi, alcDAO_Addr)
            this.setState({ map })
            this.setState({ mapNFTs })
            this.setState({ daoNFTs })
            await this.loadContractData()
        } else {
            window.alert('Smart contract not deployed to detected network.')
        }
    }

    async loadContractData (){
        this.setState({ mapNextX: await this.map.methods.nextX.call() })
        this.setState({ mapNextY: await this.map.methods.nextY.call() })

    }

    async getTile(x, y) {
        return await this.state.map.methods.map(x, y).call()
    }
    async keeper(x, y){
        return (await this.getTile(x, y)).keeper
    }
    async DAO_NFT_ID(x, y){
        return (await this.getTile(x, y)).ALCX_DAO_NFT_ID
    }
    async index(x, y){
        return (await this.getTile(x, y)).index
    }
    async dead(x, y){
        return (await this.getTile(x, y)).dead
    }

    constructor(props) {
        super(props)
        this.state = {
            account: '',
            map: null,
            mapNFTs: null,
            daoNFTs: null,
            mapNextX: 0,
            mapNextY: 1,
        }
    }

    render() {
        return (
            <div>
                <p>your account {this.state.account}</p>
                <p>map contract address {Map_Addr}</p>
                <p>map nft address {MapNFT_Addr}</p>
                <p>alc dao nft address {alcDAO_Addr}</p>
                <p></p>
            </div>
        );
    }
}

export default App;
// Map address:  0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
// Map NFT address:  0x75537828f2ce51be7289709686A69CbFDbB714F1
// alc DAO address:  0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9