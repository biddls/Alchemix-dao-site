import React, { Component } from 'react';
import Web3 from 'web3'
import './App.css';
// import { useState } from 'react';
// import { ethers } from 'ethers';

import daoNFTsABI from "./artifacts/@openzeppelin/contracts/token/ERC1155/presets/ERC1155PresetMinterPauser.sol/ERC1155PresetMinterPauser.json"
import mapABI from "./artifacts/contracts/ALCX_map.sol/ALCX_map.json"
import mapNFTsABI from "./artifacts/@openzeppelin/contracts/token/ERC721/ERC721.sol/ERC721.json"

const Map_Addr = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"
const MapNFT_Addr = "0x856e4424f806D16E8CBC702B3c0F2ede5468eae5"
const alcDAO_Addr = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"

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
            this.setState({mapCont: map})
            this.setState({mapNFTs: mapNFTs})
            this.setState({daoNFTs: daoNFTs})
            this.setState({mapNextX: await map.methods.nextX().call()})
            this.setState({mapNextY: await map.methods.nextY().call()})
            this.setState({radius: await map.methods.radius().call()})
            let tempMap = await this.createMap(5, () => null)// need to sort

            console.log(await this.state.mapCont.methods.map(0, 0))
            // mapGet_ALCX_DAO_NFT_ID
            // mapGet_index
            // mapGet_dead
            // mapGet_NFTProtection

            for(let x = 0;x<5;x++){
                for(let y = 0;y<5;y++){
                    tempMap[x][y] = [
                        await this.state.mapCont.methods.mapGet_ALCX_DAO_NFT_ID(x,y).call(),
                        await this.state.mapCont.methods.mapGet_index(x,y).call(),
                        await this.state.mapCont.methods.mapGet_dead(x,y).call(),
                        await this.state.mapCont.methods.mapGet_NFTProtection(x,y).call()]
                }
            }
            console.log("temp map", tempMap)
            this.setState({map: tempMap})
        } else {
            window.alert('Smart contract not deployed to detected network.')
        }
    }

    async createMap(radius, mapper) {
        return Array(radius)
            .fill()
            .map(() => Array(radius).fill().map(mapper))
    }

    async redeemLand(){
        console.log(await this.state.account)
        // await this.state.daoNFTs.methods.mint(await this.state.account, 0, 1, "0x").call()
    }


    constructor(props) {
        super(props)
        this.state = {
            account: "",
            mapCont: "",
            mapNFTsCont: "",
            daoNFTs: "",
            mapNextX: 0,
            mapNextY: 0,
            radius: 0,
            map: [],
        }
    }

    render() {
        return (
            <div>
                {this.state.account} - {this.state.mapNextX} - {this.state.mapNextY} - {this.state.radius}
                <table>
                    <tbody>
                    {this.state.map.reverse().slice(0, this.state.map.length).map((item, index) => {
                        return (
                            <tr>
                                <td>{item[0][0] > 1000000 ? "max" : item[0][0]}</td>
                                <td>{item[1][0]}</td>
                                <td>{item[2][0]}</td>
                                <td>{item[3][0]}</td>
                                <td>{item[4][0]}</td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
                <button onClick={this.redeemLand}>
                    Redeem 1 land
                </button>
            </div>
        );
    }
}

export default App;