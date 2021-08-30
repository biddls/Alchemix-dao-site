import React, { Component } from 'react';
import Web3 from 'web3'
import './App.css';
// import { useState } from 'react';
// import { ethers } from 'ethers';

import daoNFTsABI from "./artifacts/@openzeppelin/contracts/token/ERC1155/presets/ERC1155PresetMinterPauser.sol/ERC1155PresetMinterPauser.json"
import mapABI from "./artifacts/contracts/ALCX_map.sol/ALCX_map.json"
import mapNFTsABI from "./artifacts/@openzeppelin/contracts/token/ERC721/ERC721.sol/ERC721.json"
import DAO_mintABI from "./artifacts/contracts/DAO_mint.sol/DAO_mint.json"

const Map_Addr = "0x4C4a2f8c81640e47606d3fd77B353E87Ba015584"
const MapNFT_Addr = "0x86699f95700424A20eDf530041f3869480604aC9"
const alcDAO_Addr = "0x21dF544947ba3E8b3c32561399E88B52Dc8b2823"
const DAO_mint_Addr = "0x2E2Ed0Cfd3AD2f1d34481277b3204d807Ca2F8c2"


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
            const DAO_mint = new web3.eth.Contract(DAO_mintABI.abi, DAO_mint_Addr)
            this.setState({mapCont: map})
            this.setState({mapNFTs: mapNFTs})
            this.setState({daoNFTs: daoNFTs})
            this.setState({DAO_mint: DAO_mint})
            this.setState({mapNextX: await map.methods.nextX().call()})
            this.setState({mapNextY: await map.methods.nextY().call()})
            this.setState({radius: await map.methods.radius().call()})
            let tempMap = await this.createMap(5, () => null)// need to sort

            console.log(await this.state.mapCont.methods.map(0, 0))
            for(let x = 0;x<5;x++){
                for(let y = 0;y<5;y++){
                    tempMap[x][y] = [
                        await this.state.mapCont.methods.mapContExternal_ALCX_DAO_NFT_ID(x,y).call(),
                        await this.state.mapCont.methods.mapContExternal_index(x,y).call(),
                        await this.state.mapCont.methods.mapContExternal_dead(x,y).call(),
                        await this.state.mapCont.methods.mapContExternal_NFTProtection(x,y).call()
                    ]
                }
            }
            console.log("temp map", tempMap)
            this.setState({map: tempMap})

            let amounts = [
                await this.getAmountofDaoID(0),
                await this.getAmountofDaoID(1),
                await this.getAmountofDaoID(2),
                await this.getAmountofDaoID(3),
                await this.getAmountofDaoID(4)]

            this.setState({daoNFTAmounts: amounts})
        } else {
            window.alert('Smart contract not deployed to detected network.')
        }
    }

    async createMap(radius, mapper) {
        return Array(radius)
            .fill()
            .map(() => Array(radius).fill().map(mapper))
    }

    async get1ID_DAO(id){
        await this.state.DAO_mint.methods.getNFTs([id], [1], "0x").send({ from: this.state.account })
        console.log("added 1 of ID:", id)
    }

    async get1ID_MAP(id){
        await this.state.mapCont.methods.redeemNFTsForLand([id], [1], ).send({ from: this.state.account })
        console.log("added 1 of ID:", id)
    }

    async getAmountofDaoID(id){
        return await this.state.daoNFTs.methods.balanceOf(this.state.account, id).call()
    }

    async approveMapForAllDaoNfts() {
        await this.state.daoNFTs.methods.setApprovalForAll(Map_Addr, true).send({ from: this.state.account})
    }

    handleChangeX(event) {
        this.setState({valueX: event.target.value});
    }
    handleChangeY(event) {
        this.setState({valueY: event.target.value});
    }
    handleChangeAmount(event) {
        this.setState({amount: event.target.value});
    }

    async handleSubmit(event) {
        // this.state.valueX
        // this.state.valueY
        if(this.state.amount > 0){
            let amount = Math.abs(this.state.amount)
            await this.state.mapCont.methods.increaseLandsProtection(this.state.valueX,this.state.valueY,amount).send({from: this.state.account})
        } else {
            let amount = Math.abs(this.state.amount)
            await this.state.mapCont.methods.decreaseLandsProtection(this.state.valueX,this.state.valueY,amount).send({from: this.state.account})
        }
        alert("A name was submitted: " + (this.state.valueX.toString() + this.state.valueY.toString() + this.state.amount.toString()));
        event.preventDefault();
    }

    constructor(props) {
        super(props)
        this.state = {
            account: "",
            mapCont: "",
            mapNFTs: "",
            daoNFTs: "",
            DAO_mint: "",
            mapNextX: 0,
            mapNextY: 0,
            radius: 0,
            map: [],
            daoNFTAmounts: [],
            valueX: null,
            valueY: null,
            amount: null,
        }
        this.handleChangeX = this.handleChangeX.bind(this);
        this.handleChangeY = this.handleChangeY.bind(this);
        this.handleChangeAmount = this.handleChangeAmount.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    render() {
        return (
            <div>
                <h1 style={{ color: 'red' }}>Welcome to Biddls DAO game</h1>
                Account addr: {this.state.account}<br/>
                Maps next NFT: ({this.state.mapNextX}, {this.state.mapNextY})<br/>
                Maps radius: {this.state.radius}<br/>
                <table>
                    <tbody>
                    {this.state.map.reverse().slice(0, this.state.map.length).map((item, index) => {
                        return (
                            <tr>
                                <td>{item[0][0] > 1000000 ? "max" : item[0][1]}</td>
                                {/*<td>{item[0][1] < 100 ? item[0][1] : "dead"}</td>*/}
                                <td>{item[1][1] >= 1 ? item[1][1] : "dead"}</td>
                                <td>{item[2][1] >= 1 ? item[2][1] : "dead"}</td>
                                <td>{item[3][1] >= 1 ? item[3][1] : "dead"}</td>
                                <td>{item[4][1] >= 1 ? item[4][1] : "dead"}</td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
                <button onClick={() => this.get1ID_DAO(0)}>Redeem 1 nft ID 0</button>
                <button onClick={() => this.get1ID_DAO(1)}>Redeem 1 nft ID 1</button>
                <button onClick={() => this.get1ID_DAO(2)}>Redeem 1 nft ID 2</button>
                <button onClick={() => this.get1ID_DAO(3)}>Redeem 1 nft ID 3</button>
                <button onClick={() => this.get1ID_DAO(4)}>Redeem 1 nft ID 4</button><br/>

                DAO NFT Amounts:<br/>

                ID0: {this.state.daoNFTAmounts[0]}<br/>
                ID1: {this.state.daoNFTAmounts[1]}<br/>
                ID2: {this.state.daoNFTAmounts[2]}<br/>
                ID3: {this.state.daoNFTAmounts[3]}<br/>

                <h4 style={{ color: 'red' }}>Redeem map pieces, make sure to grant approval</h4>

                <button onClick={() => this.approveMapForAllDaoNfts()}>Set approval for all</button><br/>

                <button onClick={() => this.get1ID_MAP(0)}>ID 0</button>
                <button onClick={() => this.get1ID_MAP(1)}>ID 1</button>
                <button onClick={() => this.get1ID_MAP(2)}>ID 2</button>
                <button onClick={() => this.get1ID_MAP(3)}>ID 3</button>
                <button onClick={() => this.get1ID_MAP(4)}>ID 4</button><br/>
                <h4 style={{ color: 'red' }}>Increase or decrease protection for tiles you own</h4>
                <form onSubmit={this.handleSubmit}>
                    <label>
                        X:<br/>
                        <input type="number" value={this.state.valueX} onChange={this.handleChangeX}/><br/>
                        Y:<br/>
                        <input type="number" value={this.state.valueY} onChange={this.handleChangeY}/><br/>
                        Amount +/-ve:<br/>
                        <input type="number" value={this.state.amount} onChange={this.handleChangeAmount}/><br/>
                    </label>
                    <input type="submit" value="Submit" />
                </form>
            </div>
        );
    }
}

export default App;