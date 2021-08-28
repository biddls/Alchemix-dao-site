import React, { Component } from 'react';
import Web3 from 'web3'
import './App.css';
// import { useState } from 'react';
// import { ethers } from 'ethers';

import daoNFTsABI from "./artifacts/@openzeppelin/contracts/token/ERC1155/presets/ERC1155PresetMinterPauser.sol/ERC1155PresetMinterPauser.json"
import mapABI from "./artifacts/contracts/ALCX_map.sol/ALCX_map.json"
import mapNFTsABI from "./artifacts/@openzeppelin/contracts/token/ERC721/ERC721.sol/ERC721.json"

const Map_Addr = "0x0165878A594ca255338adfa4d48449f69242Eb8F"
const MapNFT_Addr = "0x3B02fF1e626Ed7a8fd6eC5299e2C54e1421B626B"
const alcDAO_Addr = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853"
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
            this.setState({
                mapCont: map,
                mapNFTs: mapNFTs,
                daoNFTs: daoNFTs,
                mapNextX: await map.methods.nextX().call(),
                mapNextY: await map.methods.nextY().call(),
                radius: await map.methods.radius().call()})
            let tempMap = await this.createMap(5, () => null)// need to sort

            console.log(await this.state.mapCont.methods.map(0, 0))

            // for(let x = 0;x<this.state.radius;x++){
            //     for(let y = 0;y<this.state.radius;y++){
            //         tempMap[x][y] = await this.state.mapCont.map.call()
            //     }
            // }
            // console.log(tempMap)
        } else {
            window.alert('Smart contract not deployed to detected network.')
        }
    }

    async createMap(radius, mapper) {
        return Array(radius)
            .fill()
            .map(() => Array(radius).fill().map(mapper))
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
            mapCont: null,
            mapNFTsCont: null,
            daoNFTs: null,
            mapNextX: null,
            mapNextY: null,
            radius: null,
            map: null,
        }
    }

    render() {
        return (
            <div>
                {this.state.account} - {this.state.mapNextX} - {this.state.mapNextY} - {this.state.radius}
            </div>
        );
    }
}

export default App;