import React, { Component } from 'react';
import Web3 from 'web3'
import './App.css';
// import { useState } from 'react';
// import { ethers } from 'ethers';

import daoNFTsABI from "./artifacts/@openzeppelin/contracts/token/ERC1155/presets/ERC1155PresetMinterPauser.sol/ERC1155PresetMinterPauser.json"
import mapABI from "./artifacts/contracts/ALCX_map.sol/ALCX_map.json"
import mapNFTsABI from "./artifacts/@openzeppelin/contracts/token/ERC721/ERC721.sol/ERC721.json"
import DAO_mintABI from "./artifacts/contracts/DAO_mint.sol/DAO_mint.json"

const Map_Addr = "0x712701A9a98809E19aa7e62E96C14eCeb52245bc"
const MapNFT_Addr = "0x228F7A2eDF001a2010fcFD45711d3672Fe9dF007"
const alcDAO_Addr = "0xEffF10B7E537FE380c4bA740Bb455A59231669f4"
const DAO_mint_Addr = "0x724Bc75124b7346698899edaeC3Cf9C8E7Da9Ab3"


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
        if(networkId === 4) {
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

            for(let x = 0;x<5;x++){
                for(let y = 0;y<5;y++){
                    tempMap[y][x] = [
                        await this.state.mapCont.methods.mapContExternal_ALCX_DAO_NFT_ID(x,y).call(),
                        await this.state.mapCont.methods.mapContExternal_index(x,y).call(),
                        await this.state.mapCont.methods.mapContExternal_dead(x,y).call(),
                        await this.state.mapCont.methods.mapContExternal_NFTProtection(x,y).call()
                    ]
                }
            }
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

    async getOwnedTiles(){
        const radius = this.state.radius
        let owned = []
        const nftsOwned = await this.state.mapNFTs.methods.balanceOf(this.state.account).call()
        for (let x=0;x<radius;x++){
            for (let y=0;y<radius;y++){
                if(!((x === y) && (y === 0))) {
                    if (!await this.state.mapCont.methods.mapContExternal_dead(x, y).call()) {
                        let id = await this.state.mapCont.methods.mapContExternal_index(x, y).call()
                        console.log(x, y, id, !await this.state.mapCont.methods.mapContExternal_dead(x, y).call())
                        if (await this.state.mapNFTs.methods.ownerOf(id).call() === this.state.account) {
                            if(nftsOwned > owned.length) {
                                owned.push([x, y])
                            }
                        }
                    }
                }
            }
        }
        this.setState({daoNFTOwnedAmounts: owned})
        this.setState({daoNFTsOwned: nftsOwned})
    }

    async get1ID_DAO(id){
        await this.state.DAO_mint.methods.getNFTs([id], [1], "0x").send({ from: this.state.account })
    }

    async get1ID_MAP(id){
        await this.state.mapCont.methods.redeemNFTsForLand([id], [1], ).send({ from: this.state.account })
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
        event.preventDefault();
    }

    handleChangeAttackX(event) {
        this.setState({AttackX: event.target.value});
    }
    handleChangeAttackY(event) {
        this.setState({AttackY: event.target.value});
    }
    handleChangeFromX(event) {
        this.setState({FromX: event.target.value});
    }
    handleChangeFromY(event) {
        this.setState({FromY: event.target.value});
    }
    async handleAttack(event) {
        await this.state.mapCont.methods.magicAttack(this.state.AttackX, this.state.AttackY, this.state.FromX, this.state.FromY).send({from: this.state.account})
        event.preventDefault();
    }

    setDisplayMode(mode) {
        this.setState({mapViewMode: mode})
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
            mapViewMode: 0,
            daoNFTAmounts: [],
            daoNFTOwnedAmounts: [],
            daoNFTsOwned: 0,
            valueX: null,
            valueY: null,
            amount: null,
            AttackX: null,
            AttackY: null,
            FromX: null,
            FromY: null,
        }
        this.handleChangeX = this.handleChangeX.bind(this);
        this.handleChangeY = this.handleChangeY.bind(this);
        this.handleChangeAmount = this.handleChangeAmount.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChangeAttackX = this.handleChangeAttackX.bind(this);
        this.handleChangeAttackY = this.handleChangeAttackY.bind(this);
        this.handleChangeFromX = this.handleChangeFromX.bind(this);
        this.handleChangeFromY = this.handleChangeFromY.bind(this);
        this.handleAttack = this.handleAttack.bind(this);
    }

    render() {
        return (
            <div>
                <h1 style={{ color: 'red' }}>Welcome to Biddls DAO game</h1><br/>
                This project is on rinkiby atm so you will need rinkiby eth<br/>
                https://faucet.rinkeby.io/ and to select the rinkeby network on ur wallet<br/>
                Account addr: {this.state.account}<br/>
                Maps next NFT: ({this.state.mapNextX}, {this.state.mapNextY})<br/>
                Maps radius: {this.state.radius}<br/><br/>
                Maps view mode: {this.state.mapViewMode}<br/>
                0: the DAO NFT ID number of the tile<br/>
                1: the index of the tile<br/>
                2: whether or not its dead<br/>
                3: how many NFTs does it had protecting it<br/><br/>
                Set Display mode:<br/>
                <button onClick={() => this.setDisplayMode(0)}>0</button>
                <button onClick={() => this.setDisplayMode(1)}>1</button>
                <button onClick={() => this.setDisplayMode(2)}>2</button>
                <button onClick={() => this.setDisplayMode(3)}>3</button><br/><br/>
                <table border="1">
                    <tbody>
                    {this.state.map.reverse().slice(0, this.state.map.length).map((item, index) => {
                        return (
                            <tr>
                                <td>{(item[0][0] > 1000000) && (this.state.mapViewMode === 0) ? "max"
                                    :item[0][1] >= 1 ? (item[0][this.state.mapViewMode] ? item[0][this.state.mapViewMode] : "Alive") : "dead"}</td>
                                <td>{item[1][1] >= 1 ? (item[1][this.state.mapViewMode] ? item[1][this.state.mapViewMode] : "Alive") : "dead"}</td>
                                <td>{item[2][1] >= 1 ? (item[2][this.state.mapViewMode] ? item[2][this.state.mapViewMode] : "Alive") : "dead"}</td>
                                <td>{item[3][1] >= 1 ? (item[3][this.state.mapViewMode] ? item[3][this.state.mapViewMode] : "Alive") : "dead"}</td>
                                <td>{item[4][1] >= 1 ? (item[4][this.state.mapViewMode] ? item[4][this.state.mapViewMode] : "Alive") : "dead"}</td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
                <br/>
                <button onClick={() => this.getOwnedTiles()}>List tiles owned you own: {this.state.daoNFTsOwned.toString()}</button>
                <br/>
                <table border="1">
                    <tbody>
                    {this.state.daoNFTOwnedAmounts.map((item, index) => {
                        return (
                            <td>{"(" + item[0].toString() + ", " + item[1].toString() + ")"}</td>
                        );
                    })}
                    </tbody>
                </table>

                <br/>

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
                ID3: {this.state.daoNFTAmounts[4]}<br/>

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
                <h4 style={{ color: 'red' }}>Magic Attack</h4>
                <form onSubmit={this.handleAttack}>
                    <label>
                        Attack X:<br/>
                        <input type="number" value={this.state.AttackX} onChange={this.handleChangeAttackX}/><br/>
                        Attack Y:<br/>
                        <input type="number" value={this.state.AttackY} onChange={this.handleChangeAttackY}/><br/>
                        From X:<br/>
                        <input type="number" value={this.state.FromX} onChange={this.handleChangeFromX}/><br/>
                        From Y:<br/>
                        <input type="number" value={this.state.FromY} onChange={this.handleChangeFromY}/><br/>
                    </label>
                    <input type="submit" value="Submit" />
                </form>
            </div>
        );
    }
}

export default App;