const Web3Modal=window.Web3Modal.default;const WalletConnectProvider=window.WalletConnectProvider.default;class NFTLib{constructor(config){this.config=config;this.contract=null;this.cache=null;this.isMobile=/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);try{this.connectionInfo=JSON.parse(localStorage.getItem('nftlib.connectionInfo'));}catch(e){console.error(e);}
this.contractInfo=[];this.connectedToCorrectNetwork=null;for(let i=0;i<config.contracts.length;i++){let c=config.contracts[i];this.addContract(c.address,c.abi,c.calls,config.cache[c.address]);}
if(typeof window.ethereum!=='undefined'){this.findMetaMask();}
if(this.metaMask!=null){this.provider=this.metaMask;let signer=this.provider.getSigner();if(this.connectionInfo!=null&&this.connectionInfo.type=='MetaMask'){signer.getAddress().then(async()=>{this.signer=signer;let address=await this.signer.getAddress();if(adress!=this.connectionInfo.address){this.setConnectionInfo('MetaMask',address);}
fetchData();}).catch(()=>{});}}else{this.defaultProvider=ethers.providers.getDefaultProvider(config.network,config.providers);this.defaultProvider.isDefault=true;this.provider=this.defaultProvider;this.connectedToCorrectNetwork=true;this.setupContracts();}
const providerOptions={walletconnect:{package:WalletConnectProvider,options:{infuraId:config.infura,chainId:config.network=='homestead'?1:3}},'custom-walletlink':{display:{logo:'https://play-lh.googleusercontent.com/PjoJoG27miSglVBXoXrxBSLveV6e3EeBPpNY55aiUUBM9Q1RCETKCOqdOkX2ZydqVf0',name:'Coinbase',description:'Connect to Coinbase Wallet (not Coinbase App)',},options:{appName:'Coinbase',infuraId:config.infura,chainId:config.network=='homestead'?1:3},package:WalletLink,connector:async(_,options)=>{const{appName,networkUrl,chainId}=options
const walletLink=new WalletLink({appName,})
const provider=walletLink.makeWeb3Provider(networkUrl,chainId)
await provider.enable()
return provider},}};this.web3Modal=new Web3Modal({network:this.config.network=='homestead'?'mainnet':this.config.network,cacheProvider:false,providerOptions});this.init();this.refresh();this.fetchTimeout=setTimeout(this.fetchData.bind(this),config.refreshRate==null?5000:config.refreshRate);}
init(){}
getChainID(network){switch(network){case 'homestead':return 1;case 'ropsten':return 3;case 'rinkeby':return 4;case 'goerli':return 5;}}
addContract(address,abi,calls,cache){if(cache==null)cache={};for(let key in cache){cache[key]=this.checkBigNumber(cache[key]);}
this.contractInfo.push({address,abi,calls,cache,contract:null});if(this.contractInfo.length==1){this.cache=cache;}}
checkBigNumber(val){if(val.type=='BigNumber'){return ethers.BigNumber.from(val);}
return val;}
setupContracts(){for(let i=0;i<this.contractInfo.length;i++){this.setupContract(i);}}
setupContract(i){let c=this.contractInfo[i];if(c.address==null)return;c.contract=new ethers.Contract(c.address,c.abi,this.provider);c.contract.on('Transfer',(from,to,tokenId,event)=>{this.fetchData();});if(i==0)this.contract=c.contract;}
async connect(){if(this.connecting){while(this.connecting){await new Promise(r=>setTimeout(r,10));}
return this.signer!=null;}
if(this.signer!=null){if(this.provider.network.name==this.config.network){let accounts=await this.provider.listAccounts();if(accounts.length>0){return true;}}}
this.connecting=true;if(this.connectionInfo!=null){try{if(this.connectionInfo.type=='MetaMask'){if(this.metaMask!=null&&this.connectedToCorrectNetwork){await this.connectMetaMask();}else{this.showConnectionOptions();}}else{await this.connectWalletConnect();}}catch(e){console.error(e);}}else if(this.isMobile&&typeof window.ethereum!=='undefined'){await this.connectMetaMask();}else{await this.showConnectionOptions();}
this.connecting=false;this.refresh();return this.signer!=null;}
async showConnectionOptions(){try{await this.showOptions('Select Provider',[{label:'MetaMask<br><span class="smaller">Recommended</span>',handler:async()=>await this.connectMetaMask()},{label:'WalletConnect<br><span class="smaller">Coinbase, Trust Wallet, ...</span>',handler:async()=>await this.connectWalletConnect()}]);}catch(e){console.error(e);}}
disconnect(){if(this.walletConnection&&this.walletConnection.disconnect){this.walletConnection.disconnect(0,"Requested");}
this.web3Modal.clearCachedProvider();this.signer=null;this.connectionInfo=null;localStorage.removeItem('nftlib.connectionInfo');this.refresh();}
findMetaMask(){if(window.ethereum==null)return null;if(window.ethereum.providers==null){this.metaMask=new ethers.providers.Web3Provider(window.ethereum);}else{let mm=window.ethereum.providers.find((provider)=>provider.isMetaMask);if(mm==null)return;window.ethereum.setSelectedProvider(mm);this.metaMask=new ethers.providers.Web3Provider(window.ethereum.selectedProvider);}
this.metaMask.on("network",(newNetwork,oldNetwork)=>{if(newNetwork.name==this.config.network){this.connectedToCorrectNetwork=true;this.setupContracts();this.fetchData();}else{this.connectedToCorrectNetwork=false;}
this.refresh();});}
async connectMetaMask(){if(!this.connectedToCorrectNetwork){this.message('You are not connected to the '+this.config.networkName+' network');return;}
if(typeof window.ethereum!=='undefined'){this.findMetaMask();}
if(this.metaMask!=null){this.provider=this.metaMask;this.setupContracts();let result;if(this.isMobile||(this.connectionInfo!=null&&this.connectionInfo.type=='MetaMask')){result=await this.provider.send('eth_requestAccounts');}else{result=await new Promise((resolve,reject)=>{if(window.ethereum.selectedProvider){window.ethereum.selectedProvider.send({method:'wallet_requestPermissions',params:[{eth_accounts:{},}]},(e)=>{if(e!=null&&e.code!=null)reject();else resolve();});}else{window.ethereum.send({method:'wallet_requestPermissions',params:[{eth_accounts:{},}]},(e)=>{if(e!=null&&e.code!=null)reject();else resolve();});}});}
this.signer=this.provider.getSigner();if(this.signer==null)return;this.setConnectionInfo('MetaMask',await this.signer.getAddress());this.fetchData();}else{if(this.isMobile){document.location='https://metamask.app.link/dapp/'+document.location.hostname+document.location.pathname;}else{this.showOptions('MetaMask is not installed.',[{label:'Download MetaMask',handler:()=>window.open('https://metamask.io','_blank')}]);}}}
async connectWalletConnect(){this.walletConnection=await this.web3Modal.connect();let provider=new ethers.providers.Web3Provider(this.walletConnection);let network=await provider.getNetwork();if(network.name!=this.config.network){console.log(network.name,this.config.network);this.message('Wrong network selected.');return;}
this.provider=provider;this.setupContracts();this.signer=await this.provider.getSigner();this.setConnectionInfo('WalletConnect',await this.signer.getAddress());this.fetchData();}
getContract(id=null){if(id==null)id=0;if(this.provider==null)return null;if(this.contractInfo[id]==null)return null;let c=this.contractInfo[id];if(c==null)return null;if(c.contract==null){this.setupContract(id);}
return c.contract;}
getCache(id=null){if(id==null)id=0;let c=this.contractInfo[id];if(c==null)return null;return c.cache;}
async connectContract(id){if(await this.connect()){let network=await this.provider.getNetwork();if(network.name!=this.config.network){this.message('You are not connected to the '+this.config.networkName+' network');return null;}
let contract=this.getContract(id);if(contract==null)return null;return contract.connect(this.signer);}}
async fetchData(){clearTimeout(this.fetchTimeout);if(this.fetching)return;if(this.fetchTimeout)clearTimeout(this.fetchTimeout);this.fetching=true;let prev=this.connectedToCorrectNetwork;if(this.provider!=null&&this.provider.provider!=null){let chain=ethers.BigNumber.from(this.provider.provider.chainId).toNumber();let desiredChain=this.getChainID(this.config.network);this.connectedToCorrectNetwork=chain==desiredChain;}
if(prev!=this.connectedToCorrectNetwork){this.setupContracts();}
try{await this.fetchGlobalData();}catch(e){console.error(e);}
try{await this.refresh();}catch(e){console.error(e);}
try{await this.fetchPersonalDataInternal();}catch(e){console.error(e);}
try{await this.refresh();}catch(e){console.error(e);}
this.fetchTimeout=setTimeout(this.fetchData.bind(this),this.provider==null?10000:5000);this.fetching=false;}
async fetchGlobalData(){if(this.provider!=null&&!this.provider.isDefault&&this.connectedToCorrectNetwork===true){await this.fetchGlobalDataFromProvider();}else if(this.config.cacheURI!=null){await this.fetchGlobalDataFromCache();}}
async fetchGlobalDataFromProvider(){for(let i=0;i<this.contractInfo.length;i++){let contractInfo=this.contractInfo[i];await this.makeCalls(contractInfo.contract,contractInfo.calls,contractInfo.cache);}}
async makeCalls(contract,calls,cache){if(contract==null)return;if(calls==null)return;for(let j=0;j<calls.length;j++){try{var call=calls[j];let res=await contract[call]();cache[call]=res;}catch(e){console.error(e);}}}
setConnectionInfo(type,address){this.connectionInfo={type,address};localStorage.setItem('nftlib.connectionInfo',JSON.stringify(this.connectionInfo));}
async fetchGlobalDataFromCache(){let res=await fetch(this.config.cacheURI+"?"+new Date().getTime());let cache=await res.json();for(let i=0;i<this.contractInfo.length;i++){let contractInfo=this.contractInfo[i];let contractCache=cache[contractInfo.address];for(let key in contractCache){contractInfo.cache[key]=this.checkBigNumber(contractCache[key]);}}}
async fetchPersonalDataInternal(){if(this.connectedToCorrectNetwork&&this.connectionInfo!=null&&this.provider!=null){if(this.signer!=null){let accounts=await this.provider.listAccounts();if(accounts.length>0){let address=await this.signer.getAddress();if(address!=this.connectionInfo.address){this.setConnectionInfo(this.connectionInfo.type,address);}}}
await this.fetchPersonalData(this.connectionInfo.address);}}
async fetchPersonalData(provider,signer,address){}
async refresh(){}
async showOptions(msg,options){$('body').addClass('modal-visible');let modal=$('<div class="modal">').appendTo('body');let popup=$('<div class="popup">').appendTo(modal);let text=$('<div class="message">').html(msg).appendTo(popup);let promise=new Promise(((resolve,reject)=>{for(let i=0;i<options.length;i++){let option=options[i];let btn=$('<div class="btn btn-option">').html(option.label).appendTo(popup);btn.on('click',async()=>{try{$('body').removeClass('modal-visible');modal.remove();await option.handler();resolve();}catch(e){reject(e);}});}
let close=$('<div class="btn btn-close">').text("Close").appendTo(popup);close.on('click',async()=>{$('body').removeClass('modal-visible');modal.remove();resolve();});}));try{await promise;}catch(e){console.error(e);}
modal.find('.btn').off('click');}
message(msg,extra,closeText){$('body').addClass('modal-visible');let modal=$('<div class="modal">').appendTo('body');let popup=$('<div class="popup">').appendTo(modal);let text=$('<div class="message">').html(msg).appendTo(popup);let xtra=extra==null?null:$(extra).appendTo(popup);let close=$('<div class="btn btn-close">').text(closeText==null?"Close":closeText).appendTo(popup);modal.on('click',(e)=>{if(popup.is(e.target)||text.is(e.target)){return;}
if(xtra&&(xtra.is(e.target)||xtra.has(e.target).length>0))return;modal.find('.btn').off('click');$('body').removeClass('modal-visible');modal.remove();});}
async transaction(msg,hash){$('body').addClass('modal-visible');let modal=$('<div class="modal">').appendTo('body');let popup=$('<div class="popup">').appendTo(modal);let text=$('<div class="message">').html(msg).appendTo(popup);let loader=$('<div class="lds-ripple"><div></div><div></div></div>').appendTo(popup);let close=$('<div class="btn btn-close">').text("Close this popup").appendTo(popup);let footnote=$('<div class="footnote">').html("Closing this popup will not affect your transaction.").appendTo(popup);close.on('click',(e)=>{modal.find('.btn').off('click');$('body').removeClass('modal-visible');modal.remove();});let cnt=0;while(true){try{let receipt=await this.provider.getTransactionReceipt(hash);if(receipt!=null){modal.find('.btn').off('click');$('body').removeClass('modal-visible');modal.remove();return receipt.status==1;}}catch(e){cnt++;if(cnt>10){modal.find('.btn').off('click');$('body').removeClass('modal-visible');modal.remove();throw "Could not verify transaction.<br>Please check on etherscan.";}}
await new Promise(r=>setTimeout(r,4000));}}
overlay(msg){let modal=$('<div class="modal overlay">').appendTo('body');let popup=$('<div class="popup">').appendTo(modal);let text=$('<div class="message">').html(msg).appendTo(popup);modal.on('click',async()=>{modal.find('.btn').off('click');$('body').removeClass('modal-visible');modal.remove();});}
hideOverlay(){$('.modal.overlay').remove();}
connected(){return this.connectionInfo!=null&&this.connectedToCorrectNetwork;}
clipAddress(addr){return addr.substr(0,6)+"..."+addr.substr(addr.length-4);}
convertPrice(price){try{return price.div('100000000000').toNumber()/10000000;}catch(e){return 0;}}
numberWithCommas(x){return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g,",");}
numberWithCommasAndDecimals(n){let temp=(Math.round(n*100)/100).toLocaleString('en-US');let parts=temp.split('.');if(parts.length==1)parts.push('00');if(parts[1].length==1){parts[1]+='0';}
return parts.join('.');}}